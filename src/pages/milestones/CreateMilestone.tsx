import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus } from "lucide-react";
import { MilestoneCreationForm } from "@/components/milestones/MilestoneCreationForm";

interface Classroom {
  id: string;
  name: string;
}

export default function CreateMilestone() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          toast({
            title: "Authentication required",
            description: "Please sign in to create milestones.",
            variant: "destructive"
          });
          navigate("/app");
          return;
        }

        const { data, error } = await supabase
          .from("classrooms")
          .select("id, name")
          .eq("teacher_id", user.id)
          .order("name");

        if (error) {
          throw error;
        }

        setClassrooms(data || []);
        
        // Auto-select first classroom if only one exists
        if (data && data.length === 1) {
          setSelectedClassroomId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching classrooms:", error);
        toast({
          title: "Error",
          description: "Could not load classrooms. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, [navigate, toast]);

  const handleMilestoneCreated = () => {
    toast({
      title: "Milestone created successfully!",
      description: "Your milestone document has been saved and will appear in recent activity.",
    });
    
    // Navigate back to the main app or to a milestones list
    navigate("/app");
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <SEO title="Create Milestone | Sproutify School" description="Create milestone documents for your classroom." canonical="/app/milestones/create" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading classrooms...</p>
          </div>
        </div>
      </div>
    );
  }

  if (classrooms.length === 0) {
    return (
      <div className="container max-w-4xl py-8">
        <SEO title="Create Milestone | Sproutify School" description="Create milestone documents for your classroom." canonical="/app/milestones/create" />
        
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/app")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No Classrooms Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You need to create a classroom before you can create milestone documents.
            </p>
            <Button asChild>
              <a href="/app/classrooms">
                <Plus className="h-4 w-4 mr-2" />
                Create Classroom
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <SEO title="Create Milestone | Sproutify School" description="Create milestone documents for your classroom." canonical="/app/milestones/create" />
      
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/app")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold">Create Milestone Document</h1>
        <p className="text-muted-foreground mt-2">
          Document significant achievements and learning moments in your classroom.
        </p>
      </div>

      {classrooms.length > 1 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Classroom</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="classroom">Choose the classroom for this milestone</Label>
              <Select
                value={selectedClassroomId}
                onValueChange={setSelectedClassroomId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a classroom" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedClassroomId && (
        <MilestoneCreationForm
          classroomId={selectedClassroomId}
          onMilestoneCreated={handleMilestoneCreated}
        />
      )}
    </div>
  );
}
