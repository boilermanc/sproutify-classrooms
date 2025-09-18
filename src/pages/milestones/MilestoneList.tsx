import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Calendar, 
  Award, 
  Eye, 
  BookOpen, 
  Sprout, 
  Custom,
  FileText,
  Edit,
  Trash2,
  Download
} from "lucide-react";
import { MilestoneDocument, getMilestoneDocuments, deleteMilestoneDocument } from "@/lib/milestoneDocuments";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const milestoneTypeConfig = {
  'planting': { label: 'Planting', icon: Sprout, color: 'bg-green-100 text-green-800' },
  'harvest': { label: 'Harvest', icon: Calendar, color: 'bg-orange-100 text-orange-800' },
  'observation': { label: 'Observation', icon: Eye, color: 'bg-blue-100 text-blue-800' },
  'achievement': { label: 'Achievement', icon: Award, color: 'bg-purple-100 text-purple-800' },
  'learning': { label: 'Learning', icon: BookOpen, color: 'bg-indigo-100 text-indigo-800' },
  'custom': { label: 'Custom', icon: Custom, color: 'bg-gray-100 text-gray-800' },
};

export default function MilestoneList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [milestones, setMilestones] = useState<MilestoneDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [milestoneToDelete, setMilestoneToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          toast({
            title: "Authentication required",
            description: "Please sign in to view milestones.",
            variant: "destructive"
          });
          navigate("/app");
          return;
        }

        // Get all classrooms for this teacher
        const { data: classrooms, error: classroomError } = await supabase
          .from("classrooms")
          .select("id")
          .eq("teacher_id", user.id);

        if (classroomError) {
          throw classroomError;
        }

        if (!classrooms || classrooms.length === 0) {
          setMilestones([]);
          setLoading(false);
          return;
        }

        // Get milestones from all classrooms
        const { data, error } = await supabase
          .from("tower_documents")
          .select(`
            *,
            classrooms (
              id,
              name
            )
          `)
          .eq("teacher_id", user.id)
          .eq("document_type", "milestone")
          .in("classroom_id", classrooms.map(c => c.id))
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setMilestones(data || []);
      } catch (error) {
        console.error("Error fetching milestones:", error);
        toast({
          title: "Error",
          description: "Could not load milestones. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, [navigate, toast]);

  const handleDeleteMilestone = async () => {
    if (!milestoneToDelete) return;

    try {
      await deleteMilestoneDocument(milestoneToDelete);
      
      setMilestones(prev => prev.filter(m => m.id !== milestoneToDelete));
      
      toast({
        title: "Milestone deleted",
        description: "The milestone document has been removed.",
      });
    } catch (error) {
      console.error("Error deleting milestone:", error);
      toast({
        title: "Error",
        description: "Could not delete milestone. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setMilestoneToDelete(null);
    }
  };

  const filteredMilestones = milestones.filter(milestone => {
    const matchesSearch = milestone.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         milestone.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         milestone.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || milestone.milestone_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="container max-w-6xl py-8">
        <SEO title="Milestone Documents | Sproutify School" description="View and manage milestone documents." canonical="/app/milestones" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading milestones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <SEO title="Milestone Documents | Sproutify School" description="View and manage milestone documents." canonical="/app/milestones" />
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/app")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Milestone Documents</h1>
              <p className="text-muted-foreground mt-2">
                View and manage your classroom milestone documents.
              </p>
            </div>
          </div>
          <Button asChild>
            <a href="/app/milestones/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Milestone
            </a>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search milestones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(milestoneTypeConfig).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    <config.icon className="h-4 w-4" />
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Milestones Grid */}
      {filteredMilestones.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {milestones.length === 0 ? "No milestones yet" : "No milestones match your search"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {milestones.length === 0 
                  ? "Create your first milestone document to start documenting classroom achievements."
                  : "Try adjusting your search terms or filters."
                }
              </p>
              {milestones.length === 0 && (
                <Button asChild>
                  <a href="/app/milestones/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Milestone
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMilestones.map((milestone) => {
            const typeConfig = milestoneTypeConfig[milestone.milestone_type || 'custom'];
            const IconComponent = typeConfig.icon;
            
            return (
              <Card key={milestone.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-primary" />
                      <Badge className={typeConfig.color}>
                        {typeConfig.label}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement edit functionality
                          toast({
                            title: "Edit functionality",
                            description: "Edit functionality will be implemented soon.",
                          });
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setMilestoneToDelete(milestone.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {milestone.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {milestone.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {milestone.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(milestone.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      {(milestone as any).classrooms?.name || 'Unknown Classroom'}
                    </div>
                    {milestone.file_name && milestone.file_name !== 'milestone.txt' && (
                      <div className="flex items-center gap-2">
                        <Download className="h-3 w-3" />
                        <a 
                          href={milestone.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {milestone.file_name}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Milestone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this milestone document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMilestone}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
