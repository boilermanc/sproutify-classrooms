import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Video,
  Plus,
  Upload,
  Eye,
  EyeOff,
  Trash2,
  Calendar,
  FileText,
  Play,
  Edit,
  Save,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { generateUUID } from "@/utils/uuid";

interface ContentSection {
  id: string;
  slug: string;
  title: string;
  kind: "pest" | "disease";
  description?: string;
}

interface MediaAsset {
  id: string;
  section_id: string;
  type: string;
  bucket: string;
  object_path: string;
  title: string | null;
  description: string | null;
  file_size: number | null;
  file_type: string | null;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  is_published: boolean;
  created_at: string;
  created_by: string | null;
  content_section?: ContentSection;
}

export default function VideoManagement() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [videos, setVideos] = useState<MediaAsset[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Upload form state
  const [sectionId, setSectionId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Edit video state
  const [editingVideo, setEditingVideo] = useState<MediaAsset | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  // Toggle state
  const [togglingVideoId, setTogglingVideoId] = useState<string | null>(null);
  
  // Video validation state
  const [videoValidationResults, setVideoValidationResults] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);
  
  const { toast } = useToast();

  // Add a function to check if videos exist in storage
  const checkVideoExistsInStorage = async (video: MediaAsset): Promise<boolean> => {
    try {
      const { data, error } = await supabase.storage
        .from(video.bucket)
        .download(video.object_path);
      
      return !error && data !== null;
    } catch (error) {
      console.error("Error checking video existence:", error);
      return false;
    }
  };

  // Add a function to clean up orphaned database records
  const cleanupOrphanedVideos = async () => {
    // If we haven't validated yet, do it now
    if (Object.keys(videoValidationResults).length === 0) {
      await validateAllVideos();
    }
    
    const orphanedVideos = videos.filter(video => videoValidationResults[video.id] === false);
    
    if (orphanedVideos.length === 0) {
      toast({
        title: "No Orphaned Videos",
        description: "All videos in the database exist in storage.",
      });
      return;
    }
    
    const confirmMessage = `Found ${orphanedVideos.length} orphaned video(s) that don't exist in storage:\n\n${orphanedVideos.map(v => `- ${v.title} (${v.bucket}/${v.object_path})`).join('\n')}\n\nDo you want to delete these orphaned database records?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    try {
      const orphanedIds = orphanedVideos.map(v => v.id);
      const { error } = await supabase
        .from("media_assets")
        .delete()
        .in("id", orphanedIds);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: `Deleted ${orphanedVideos.length} orphaned video record(s)`,
      });
      
      // Clear validation results and refresh data
      setVideoValidationResults({});
      await fetchData();
    } catch (error: any) {
      console.error("Error cleaning up orphaned videos:", error);
      toast({
        title: "Error",
        description: "Failed to clean up orphaned videos",
        variant: "destructive",
      });
    }
  };

  // Add a function to validate all videos
  const validateAllVideos = async () => {
    setIsValidating(true);
    const results: Record<string, boolean> = {};
    
    for (const video of videos) {
      const exists = await checkVideoExistsInStorage(video);
      results[video.id] = exists;
    }
    
    setVideoValidationResults(results);
    
    const orphaned = Object.entries(results).filter(([_, exists]) => !exists);
    const valid = Object.entries(results).filter(([_, exists]) => exists);
    
    console.log("Video validation results:", {
      total: videos.length,
      valid: valid.length,
      orphaned: orphaned.length,
      orphanedVideos: orphaned.map(([id, _]) => {
        const video = videos.find(v => v.id === id);
        return video ? {
          title: video.title,
          bucket: video.bucket,
          object_path: video.object_path
        } : null;
      }).filter(Boolean)
    });
    
    toast({
      title: "Validation Complete",
      description: `Found ${valid.length} valid videos and ${orphaned.length} orphaned videos. Check console for details.`,
    });
    
    setIsValidating(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, searchTerm, sectionFilter, statusFilter]);

  const fetchData = async () => {
    try {
      // Check user's role first
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current user:", user?.id);
      
      if (user) {
        const { data: teamMember } = await supabase
          .from("team_members")
          .select("role, active")
          .eq("user_id", user.id)
          .eq("active", true)
          .maybeSingle();
        console.log("Team member data:", teamMember);
      }

      // Fetch content sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("content_section")
        .select("id, slug, title, kind, description")
        .order("title");

      if (sectionsError) {
        console.error("Error fetching sections:", sectionsError);
      } else {
        setSections(sectionsData || []);
      }

      // Fetch media assets (videos) - try to get all videos first
      // Use a more explicit query to bypass potential RLS issues
      const { data: videosData, error: videosError } = await supabase
        .from("media_assets")
        .select(`
          id,
          section_id,
          type,
          bucket,
          object_path,
          title,
          description,
          file_size,
          file_type,
          duration_seconds,
          thumbnail_url,
          is_published,
          created_at,
          created_by,
          content_section:content_section(id, slug, title, kind)
        `)
        .eq("type", "video")
        .order("created_at", { ascending: false });

      if (videosError) {
        console.error("Error fetching videos:", videosError);
        toast({
          title: "Error",
          description: "Failed to fetch videos",
          variant: "destructive",
        });
      } else {
        console.log("Fetched videos data:", videosData);
        console.log("Videos with is_published values:", videosData?.map(v => ({ id: v.id, title: v.title, is_published: v.is_published })));
        setVideos(videosData || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterVideos = () => {
    let filtered = videos;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.content_section?.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Section filter
    if (sectionFilter !== "all") {
      filtered = filtered.filter(video => video.section_id === sectionFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(video => 
        statusFilter === "published" ? video.is_published : !video.is_published
      );
    }

    setFilteredVideos(filtered);
  };

  const handleUpload = async () => {
    if (!file || !sectionId) {
      toast({ 
        title: "Missing Information",
        description: "Please select a section and a file." 
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const section = sections.find(s => s.id === sectionId)!;
      const bucket = section.kind === "pest" ? "pest-videos" : "disease-videos";
      
      // Get current user for better file organization
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        throw new Error("Not signed in");
      }
      
      // Create file path with user ID and UUID for better organization
      const filePath = `${user.id}/${generateUUID()}-${file.name}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { 
          upsert: false, 
          contentType: file.type || "video/mp4" 
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setProgress(50);

      // Insert record into database
      const { error: insertError } = await supabase.from("media_assets").insert({
        section_id: sectionId,
        type: "video",
        bucket,
        object_path: filePath,
        title: title || file.name,
        description: desc,
        file_size: file.size,
        file_type: file.type
      });

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      setProgress(100);
      
      // Trigger automatic sync to pest_catalog
      try {
        const { error: syncError } = await supabase.rpc('trigger_video_sync');
        if (syncError) {
          console.warn("Video sync warning:", syncError);
        } else {
          console.log("Video synced to pest catalog successfully");
        }
      } catch (syncError) {
        console.warn("Video sync error:", syncError);
      }
      
      toast({ 
        title: "Success",
        description: "Video uploaded and synced successfully!" 
      });

      // Reset form
      setFile(null);
      setTitle("");
      setDesc("");
      setSectionId("");
      
      // Refresh data
      await fetchData();
      
      setTimeout(() => setProgress(0), 1200);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const togglePublished = async (videoId: string, currentStatus: boolean) => {
    console.log("Toggle published called:", { videoId, currentStatus });
    setTogglingVideoId(videoId);
    
    try {
      const newStatus = !currentStatus;
      console.log("Setting new status:", newStatus);
      
      const { error } = await supabase
        .from("media_assets")
        .update({ is_published: newStatus })
        .eq("id", videoId);

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      console.log("Database update successful, new status:", newStatus);

      toast({
        title: "Success",
        description: `Video ${newStatus ? 'published' : 'unpublished'} successfully`,
      });

      // Update the local state immediately for better UX
      setVideos(prevVideos => 
        prevVideos.map(video => 
          video.id === videoId 
            ? { ...video, is_published: newStatus }
            : video
        )
      );

      // Also refresh data to ensure consistency
      await fetchData();
    } catch (error: any) {
      console.error("Error updating video:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update video status",
        variant: "destructive",
      });
    } finally {
      setTogglingVideoId(null);
    }
  };

  const deleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("media_assets")
        .delete()
        .eq("id", videoId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Video deleted successfully",
      });

      await fetchData();
    } catch (error: any) {
      console.error("Error deleting video:", error);
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  const startEditing = (video: MediaAsset) => {
    setEditingVideo(video);
    setEditTitle(video.title || "");
    setEditDesc(video.description || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditingVideo(null);
    setEditTitle("");
    setEditDesc("");
    setIsEditing(false);
  };

  const saveVideoEdit = async () => {
    if (!editingVideo) return;

    try {
      const { error } = await supabase
        .from("media_assets")
        .update({
          title: editTitle.trim() || null,
          description: editDesc.trim() || null,
        })
        .eq("id", editingVideo.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Video updated successfully",
      });

      await fetchData();
      cancelEditing();
    } catch (error: any) {
      console.error("Error updating video:", error);
      toast({
        title: "Error",
        description: "Failed to update video",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (isPublished: boolean) => {
    return (
      <Badge 
        variant={isPublished ? "default" : "secondary"}
        className={isPublished ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}
      >
        {isPublished ? "Published" : "Draft"}
      </Badge>
    );
  };

  const getSectionBadge = (section: ContentSection) => {
    return (
      <div className="px-3 py-1 bg-gray-50 rounded-md text-sm text-gray-700">
        {section.kind}: {section.title}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SEO title="Video Management" description="Manage educational videos and content" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading videos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SEO title="Video Management" description="Manage educational videos and content" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Video Management</h1>
          <p className="text-muted-foreground">
            Upload and manage educational videos for pest and disease content
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={validateAllVideos}
            title="Check if all videos exist in storage"
            disabled={isValidating}
          >
            {isValidating ? "Validating..." : "Validate Videos"}
          </Button>
          <Button
            variant="destructive"
            onClick={cleanupOrphanedVideos}
            title="Remove database records for videos that don't exist in storage"
            disabled={isValidating}
          >
            Cleanup Orphaned
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videos.length}</div>
            <p className="text-xs text-muted-foreground">
              {videos.filter(v => v.is_published).length} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pest Videos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {videos.filter(v => v.content_section?.kind === 'pest').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pest-related content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disease Videos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {videos.filter(v => v.content_section?.kind === 'disease').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Disease-related content
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Sections</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sections.length}</div>
            <p className="text-xs text-muted-foreground">
              Available sections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Video
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="block mb-1">Content Section</Label>
              <select 
                className="w-full border rounded p-2" 
                value={sectionId} 
                onChange={e => setSectionId(e.target.value)}
              >
                <option value="">Select a section…</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.kind}: {s.title} ({s.slug})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="block mb-1">Video Title</Label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Optional title" 
              />
            </div>
            <div>
              <Label className="block mb-1">Description</Label>
              <Input 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
                placeholder="Optional description" 
              />
            </div>
            <div>
              <Label className="block mb-1">Video File</Label>
              <Input 
                type="file" 
                accept="video/*" 
                onChange={e => setFile(e.target.files?.[0] ?? null)} 
              />
            </div>
            {progress > 0 && <Progress value={progress} className="w-full" />}
            <Button 
              onClick={handleUpload} 
              disabled={!file || !sectionId || isUploading}
              className="md:col-span-2"
            >
              {isUploading ? "Uploading..." : "Upload Video"}
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground mt-4">
            <p className="mb-2">Files are automatically organized by content section:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Pest videos:</strong> Stored in "pest-videos" bucket</li>
              <li><strong>Disease videos:</strong> Stored in "disease-videos" bucket</li>
              <li><strong>File paths:</strong> Organized by section slug</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.kind}: {section.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Videos Table */}
      <Card>
        <CardHeader>
          <CardTitle>Videos ({filteredVideos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>File Size</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVideos.map((video) => {
                const isOrphaned = videoValidationResults[video.id] === false;
                const isValidated = videoValidationResults[video.id] !== undefined;
                
                return (
                  <TableRow key={video.id} className={isOrphaned ? "bg-red-50" : ""}>
                    <TableCell>
                      <div>
                        {isEditing && editingVideo?.id === video.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Video title"
                              className="font-medium"
                            />
                            <Textarea
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              placeholder="Video description"
                              className="text-sm"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={saveVideoEdit}
                                className="h-8"
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditing}
                                className="h-8"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {video.title || "Untitled"}
                              {isValidated && (
                                isOrphaned ? (
                                  <Badge variant="destructive" className="text-xs">
                                    Missing File
                                  </Badge>
                                ) : (
                                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                    Valid
                                  </Badge>
                                )
                              )}
                            </div>
                            {video.description && (
                              <div className="text-sm text-muted-foreground">
                                {video.description}
                              </div>
                            )}
                            {isOrphaned && (
                              <div className="text-xs text-red-600 mt-1">
                                File not found: {video.bucket}/{video.object_path}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  <TableCell>
                    {video.content_section ? getSectionBadge(video.content_section) : "Unknown"}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(video.is_published)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatFileSize(video.file_size)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDuration(video.duration_seconds)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDate(video.created_at)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {!isEditing || editingVideo?.id !== video.id ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(video)}
                          title="Edit video details"
                          disabled={isEditing && editingVideo?.id !== video.id}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          console.log("Button clicked for video:", { id: video.id, is_published: video.is_published, title: video.title });
                          togglePublished(video.id, video.is_published);
                        }}
                        title={video.is_published ? "Unpublish video" : "Publish video"}
                        disabled={togglingVideoId === video.id || (isEditing && editingVideo?.id !== video.id)}
                      >
                        {togglingVideoId === video.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                        ) : video.is_published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteVideo(video.id)}
                        title="Delete video"
                        disabled={isEditing && editingVideo?.id !== video.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredVideos.length === 0 && (
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No videos found</h3>
              <p className="text-muted-foreground">
                {searchTerm || sectionFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No videos have been uploaded yet."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
