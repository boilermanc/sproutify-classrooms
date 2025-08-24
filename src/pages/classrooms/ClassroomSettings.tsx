// src/pages/classrooms/ClassroomSettings.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Scale, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClassroomSettingsProps {
  classroomId?: string;
  teacherId: string;
}

export default function ClassroomSettings({ classroomId, teacherId }: ClassroomSettingsProps) {
  const { toast } = useToast();
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>(classroomId || "");
  const [weightUnit, setWeightUnit] = useState<'grams' | 'ounces'>('grams');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch classrooms and current settings
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("classrooms")
          .select("id, name, preferred_weight_unit")
          .eq("teacher_id", teacherId)
          .order("name");

        if (error) throw error;
        
        setClassrooms(data || []);
        
        // If no specific classroom ID was provided, use the first one
        if (!classroomId && data && data.length > 0) {
          setSelectedClassroomId(data[0].id);
          setWeightUnit(data[0].preferred_weight_unit || 'grams');
        } else if (classroomId) {
          const selectedClassroom = data?.find(c => c.id === classroomId);
          setWeightUnit(selectedClassroom?.preferred_weight_unit || 'grams');
        }
      } catch (error) {
        console.error("Error fetching classrooms:", error);
        toast({
          title: "Error",
          description: "Could not load classroom settings.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, [classroomId, teacherId, toast]);

  // Handle classroom selection change
  const handleClassroomChange = (newClassroomId: string) => {
    setSelectedClassroomId(newClassroomId);
    const classroom = classrooms.find(c => c.id === newClassroomId);
    setWeightUnit(classroom?.preferred_weight_unit || 'grams');
  };

  // Save weight unit preference
  const handleSave = async () => {
    if (!selectedClassroomId) {
      toast({
        title: "No Classroom Selected",
        description: "Please select a classroom to update settings for.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("classrooms")
        .update({
          preferred_weight_unit: weightUnit,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedClassroomId)
        .eq("teacher_id", teacherId);

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: `Weight unit preference updated to ${weightUnit}.`,
      });

      // Update local state
      setClassrooms(prev => 
        prev.map(c => 
          c.id === selectedClassroomId 
            ? { ...c, preferred_weight_unit: weightUnit }
            : c
        )
      );
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading classroom settings...</div>;
  }

  if (classrooms.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <div className="mb-2">No classrooms found</div>
            <div className="text-sm">Create a classroom first to manage settings.</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedClassroom = classrooms.find(c => c.id === selectedClassroomId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Scale className="h-5 w-5" />
            <CardTitle>Measurement Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Classroom Selection */}
          {!classroomId && classrooms.length > 1 && (
            <div className="space-y-2">
              <Label className="text-base font-medium">Select Classroom</Label>
              <Select value={selectedClassroomId} onValueChange={handleClassroomChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a classroom..." />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{classroom.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {classroom.preferred_weight_unit || 'grams'}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedClassroom && (
            <>
              {/* Current Classroom Display */}
              {classroomId && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-900">{selectedClassroom.name}</div>
                  <div className="text-sm text-blue-700">Classroom Settings</div>
                </div>
              )}

              {/* Weight Unit Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Preferred Weight Unit</Label>
                <Select value={weightUnit} onValueChange={(value) => setWeightUnit(value as 'grams' | 'ounces')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grams">
                      <div className="flex items-center justify-between w-full">
                        <span>Grams (g)</span>
                        <span className="text-xs text-muted-foreground ml-2">Metric</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ounces">
                      <div className="flex items-center justify-between w-full">
                        <span>Ounces (oz)</span>
                        <span className="text-xs text-muted-foreground ml-2">Imperial</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Information Box */}
                <div className="flex items-start space-x-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <Info className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-slate-700">
                    <strong>Consistency Matters:</strong> This setting applies to all harvest and waste forms in this classroom. 
                    All data is stored in grams internally but will be displayed and entered in your preferred unit.
                    <div className="mt-2 text-xs">
                      <strong>Conversion:</strong> 1 ounce = 28.35 grams
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t">
                <Button 
                  onClick={handleSave}
                  disabled={saving || !selectedClassroomId}
                  className="w-full md:w-auto"
                >
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Summary Card */}
      {selectedClassroom && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Settings Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Classroom</Label>
                <div className="text-base">{selectedClassroom.name}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Weight Unit</Label>
                <div className="text-base flex items-center space-x-2">
                  <span>{weightUnit === 'grams' ? 'Grams (g)' : 'Ounces (oz)'}</span>
                  <Badge variant="outline">{weightUnit === 'grams' ? 'Metric' : 'Imperial'}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}