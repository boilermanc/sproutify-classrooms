import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, FileText, Calendar, Award, Eye, BookOpen, Sprout, Star } from "lucide-react";
import { createMilestoneDocument, CreateMilestoneDocumentData } from "@/lib/milestoneDocuments";

interface MilestoneCreationFormProps {
  classroomId: string;
  onMilestoneCreated?: () => void;
  onCancel?: () => void;
}

const milestoneTypes = [
  { value: 'planting', label: 'Planting Milestone', icon: Sprout, description: 'Seed planting, germination, or transplanting achievements' },
  { value: 'harvest', label: 'Harvest Milestone', icon: Calendar, description: 'Successful harvests and yield achievements' },
  { value: 'observation', label: 'Observation Milestone', icon: Eye, description: 'Notable plant observations and discoveries' },
  { value: 'achievement', label: 'Achievement Milestone', icon: Award, description: 'Student accomplishments and badges earned' },
  { value: 'learning', label: 'Learning Milestone', icon: BookOpen, description: 'Educational milestones and knowledge gained' },
  { value: 'custom', label: 'Custom Milestone', icon: Star, description: 'Any other significant classroom achievement' },
];

export function MilestoneCreationForm({ classroomId, onMilestoneCreated, onCancel }: MilestoneCreationFormProps) {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<CreateMilestoneDocumentData>({
    classroom_id: classroomId,
    title: '',
    description: '',
    milestone_type: 'planting',
    content: '',
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a milestone title.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      await createMilestoneDocument({
        ...formData,
        file: file || undefined,
      });

      toast({
        title: "Milestone created!",
        description: "Your milestone document has been saved and will appear in the recent activity list.",
      });

      // Reset form
      setFormData({
        classroom_id: classroomId,
        title: '',
        description: '',
        milestone_type: 'planting',
        content: '',
      });
      setFile(null);

      // Call callback if provided
      onMilestoneCreated?.();
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast({
        title: "Error creating milestone",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedMilestoneType = milestoneTypes.find(type => type.value === formData.milestone_type);
  const IconComponent = selectedMilestoneType?.icon || Sprout;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className="h-5 w-5 text-primary" />
          Create Milestone Document
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Document a significant achievement or learning moment in your classroom.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Milestone Type */}
          <div className="space-y-2">
            <Label htmlFor="milestone_type">Milestone Type *</Label>
            <Select
              value={formData.milestone_type}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, milestone_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select milestone type" />
              </SelectTrigger>
              <SelectContent>
                {milestoneTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Milestone Title *</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., First Successful Harvest, Germination Discovery, Student Achievement"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Brief Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="A short summary of this milestone..."
              rows={3}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Detailed Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Detailed information about this milestone, what students learned, observations made, etc..."
              rows={6}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Attach File (Optional)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf,.txt,.doc,.docx"
                className="flex-1"
              />
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {file.name}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Supported formats: Images, PDF, Text files (max 10MB)
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Milestone...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Milestone
                </>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
