// src/pages/classrooms/Classrooms.tsx - Updated with multi-classroom Garden Network selection

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, Copy, Clock, Network, Sprout, RefreshCw } from "lucide-react";
import { useAppStore } from "@/context/AppStore";

// Updated interfaces for the new system
interface Classroom {
  id: string;
  name: string;
  kiosk_pin: string;
  created_at: string;
  teacher_id?: string;
  is_selected_for_network?: boolean;
}

interface Student {
  id: string;
  display_name: string;
  student_id?: string | null;
  student_pin?: string | null;
  grade_level?: string | null;
  has_logged_in: boolean;
  first_login_at?: string | null;
  last_login_at?: string | null;
  created_at: string;
}

export default function Classrooms() {
  const { toast } = useToast();
  const { dispatch } = useAppStore();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  // Form state
  const [name, setName] = useState("");

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (mounted) {
        setUserId(session?.user?.id ?? null);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.session?.user?.id ?? null);
    }).finally(() => setLoading(false));

    return () => {
        mounted = false;
        subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (userId) {
      loadClassrooms();
    }
  }, [userId]);

  const loadClassrooms = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("classrooms")
      .select("id,name,kiosk_pin,created_at,teacher_id,is_selected_for_network")
      .eq("teacher_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    
    setClassrooms(data || []);
    
    // Update AppStore with all selected classrooms (you might want to store an array)
    const selectedClassrooms = data?.filter((c: Classroom) => c.is_selected_for_network);
    if (selectedClassrooms && selectedClassrooms.length > 0) {
      // For now, we'll keep the existing single classroom approach
      // but you could update your AppStore to handle multiple selected classrooms
      dispatch({
        type: "SET_SELECTED_CLASSROOM",
        payload: selectedClassrooms[0] // Or handle multiple classrooms differently
      });
    }
  };

  const createClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast({ title: "Please sign in", description: "You must be logged in to create a classroom." });
      return;
    }
    if (!name) {
      toast({ title: "Missing info", description: "Enter a class name." });
      return;
    }
    // Generate a temporary PIN - the database trigger should replace it with a unique one
    const tempPin = Math.floor(1000 + Math.random() * 9000).toString();
    
    const { data, error } = await supabase.from("classrooms").insert({
      name,
      teacher_id: userId,
      kiosk_pin: tempPin, // Temporary value, database trigger should replace with unique PIN
      educational_package: "base", // Default educational package
      is_selected_for_network: false, // Default to not selected for network
    }).select("kiosk_pin").single();
    
    if (error) {
      toast({ title: "Could not create", description: error.message, variant: "destructive" });
      return;
    }
    
    setName("");
    const finalPin = data?.kiosk_pin || tempPin;
    toast({ 
      title: "Classroom created!", 
      description: `PIN: ${finalPin}` 
    });
    loadClassrooms();
  };

  return (
    <div className="container max-w-5xl py-8">
      <SEO title="Classrooms | Sproutify School" description="Manage classrooms and students." canonical="/app/classrooms" />

      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Classrooms</h1>
        <Button asChild variant="outline">
          <Link to="/app/help#student-management">How to manage students</Link>
        </Button>
      </header>

      {!userId && !loading && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
          </CardHeader>
          <CardContent>
            Please sign in to manage classrooms and students.
          </CardContent>
        </Card>
      )}

      <section className="grid md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Create a classroom</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={createClassroom}>
              <div className="space-y-2">
                <Label htmlFor="name">Class name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 5th Grade Science" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">Kiosk PIN</Label>
                <Input 
                  id="pin" 
                  value="Auto-generated" 
                  disabled 
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                  placeholder="Will be generated automatically"
                />
                <p className="text-xs text-muted-foreground">A unique PIN will be generated automatically for your classroom</p>
              </div>
              <Button type="submit">Create</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Login System</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Students log in with their <strong>name</strong> + <strong>classroom PIN</strong>. 
              No more temporary join codes needed!
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Add students to your class list</p>
              <p>• Share your classroom PIN with students</p>
              <p>• Track which students are participating</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/app/kiosk">Open Kiosk</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className="grid md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5 text-primary" />
              Seeding Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure educational approaches for seed tracking and plant monitoring. 
              Choose from different learning styles tailored to your grade level.
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Select appropriate learning mode for your grade</p>
              <p>• Track germination and growth progress</p>
              <p>• Engage students with age-appropriate activities</p>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Available after creating a classroom
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Garden Network</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with other classrooms, share experiences, and participate in challenges.
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Connect with other classrooms</p>
              <p>• Share harvest data and photos</p>
              <p>• Participate in friendly competitions</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link to="/app/network">Explore Network</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      <Separator className="my-8" />

      <section className="grid gap-4">
        {classrooms.map((classroom) => (
          <ClassroomRow key={classroom.id} classroom={classroom} onReload={loadClassrooms} userId={userId} />
        ))}
        {classrooms.length === 0 && (
          <p className="text-muted-foreground">No classrooms yet. Create one above.</p>
        )}
      </section>
    </div>
  );
}

// Updated ClassroomRow component with multi-classroom Garden Network selection
function ClassroomRow({ classroom, onReload, userId }: { classroom: Classroom; onReload: () => void; userId: string | null }) {
  const { toast } = useToast();
  const { dispatch } = useAppStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  
  // Add student form state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentId, setNewStudentId] = useState("");
  const [newStudentPin, setNewStudentPin] = useState("");
  const [newGradeLevel, setNewGradeLevel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [generatingPin, setGeneratingPin] = useState(false);

  // UPDATED: Toggle classroom network selection (allows multiple classrooms per teacher)
  const selectClassroomForNetwork = async () => {
    setSelecting(true);
    try {
      // Toggle the selection: if currently selected, deselect it; if not selected, select it
      const newSelectionState = !isSelectedForNetwork;
      
      const { error } = await sb
        .from('classrooms')
        .update({ is_selected_for_network: newSelectionState })
        .eq('id', classroom.id);

      if (error) {
        console.error('Error updating classroom selection:', error);
        toast({ 
          title: "Error", 
          description: "Failed to update classroom selection. Please try again.", 
          variant: "destructive" 
        });
        return;
      }

      // Update AppStore if needed (you might want to track all selected classrooms)
      dispatch({
        type: "SET_SELECTED_CLASSROOM",
        payload: { ...classroom, is_selected_for_network: newSelectionState }
      });

      toast({ 
        title: newSelectionState ? "Classroom added to network" : "Classroom removed from network", 
        description: newSelectionState 
          ? `${classroom.name} is now active on Garden Network.`
          : `${classroom.name} has been removed from Garden Network.`,
        duration: 3000
      });

      // Reload all classrooms to update the UI
      onReload();

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({ 
        title: "Error", 
        description: "Something went wrong. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setSelecting(false);
    }
  };

  // Check if this classroom is currently selected
  const isSelectedForNetwork = classroom.is_selected_for_network === true;

  // Load students for this classroom
  const loadStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await sb
        .from("students")
        .select(`
          id,
          display_name,
          student_id,
          student_pin,
          grade_level,
          has_logged_in,
          first_login_at,
          last_login_at,
          created_at
        `)
        .eq("classroom_id", classroom.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching students:", error);
        toast({ 
          title: "Error loading students", 
          description: error.message, 
          variant: "destructive" 
        });
        return;
      }

      setStudents(data || []);
    } catch (error) {
      console.error("Unexpected error loading students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [classroom.id]);

  const copyKioskPin = async () => {
    try {
      await navigator.clipboard.writeText(classroom.kiosk_pin);
      toast({ title: "Copied!", description: "Kiosk PIN copied to clipboard" });
    } catch (e) {
      toast({ 
        title: "Copy failed", 
        description: "Could not copy to clipboard.", 
        variant: "destructive" 
      });
    }
  };

  const generateNewPin = async () => {
    setGeneratingPin(true);
    try {
      // Generate a new unique PIN
      let newPin;
      let attempts = 0;
      const maxAttempts = 100;
      
      do {
        newPin = Math.floor(1000 + Math.random() * 9000).toString();
        attempts++;
        
        // Check if this PIN already exists
        const { data: existingClassroom } = await supabase
          .from("classrooms")
          .select("id")
          .eq("kiosk_pin", newPin)
          .neq("id", classroom.id)
          .single();
          
        if (!existingClassroom) break;
        
      } while (attempts < maxAttempts);
      
      if (attempts >= maxAttempts) {
        toast({ 
          title: "Error", 
          description: "Could not generate unique PIN after multiple attempts", 
          variant: "destructive" 
        });
        return;
      }
      
      const { error } = await supabase
        .from("classrooms")
        .update({ kiosk_pin: newPin })
        .eq("id", classroom.id);

      if (error) {
        toast({ 
          title: "Error", 
          description: "Could not generate new PIN: " + error.message, 
          variant: "destructive" 
        });
        return;
      }

      toast({ 
        title: "New PIN Generated!", 
        description: `New PIN: ${newPin}` 
      });
      
      // Refresh the classroom list to show the new PIN
      loadClassrooms();
    } catch (e) {
      toast({ 
        title: "Error", 
        description: "Could not generate new PIN", 
        variant: "destructive" 
      });
    } finally {
      setGeneratingPin(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const name = newStudentName.trim();
    const pin = newStudentPin.trim();
    
    if (!name) {
      toast({ title: "Name required", description: "Please enter the student's name." });
      setSubmitting(false);
      return;
    }

    if (!pin) {
      toast({ title: "PIN required", description: "Please enter a student PIN." });
      setSubmitting(false);
      return;
    }

    if (!/^\d{4,6}$/.test(pin)) {
      toast({ title: "Invalid PIN", description: "Student PIN must be 4-6 digits." });
      setSubmitting(false);
      return;
    }

    try {
      const { error } = await sb
        .from("students")
        .insert({
          classroom_id: classroom.id,
          display_name: name,
          student_id: newStudentId.trim() || null,
          student_pin: pin,
          grade_level: newGradeLevel.trim() || null,
          has_logged_in: false
        });

      if (error) {
        if (error.code === "23505" && error.message.includes("students_unique_name_per_classroom")) {
          toast({ 
            title: "Duplicate name", 
            description: `"${name}" is already in this class. Please use their full name or add a middle initial.`,
            variant: "destructive"
          });
        } else {
          console.error("Error adding student:", error);
          toast({ 
            title: "Could not add student", 
            description: error.message,
            variant: "destructive"
          });
        }
        setSubmitting(false);
        return;
      }

      toast({ title: "Student added", description: `${name} has been added to ${classroom.name}.` });
      
      setNewStudentName("");
      setNewStudentId("");
      setNewStudentPin("");
      setNewGradeLevel("");
      setShowAddDialog(false);
      
      loadStudents();
      
    } catch (error) {
      console.error("Unexpected error adding student:", error);
      toast({ 
        title: "Error", 
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    try {
      const { error } = await sb
        .from("students")
        .delete()
        .eq("id", student.id);

      if (error) {
        console.error("Error deleting student:", error);
        toast({ 
          title: "Could not remove student", 
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({ title: "Student removed", description: `${student.display_name} has been removed from the class.` });
      loadStudents();
    } catch (error) {
      console.error("Unexpected error deleting student:", error);
      toast({ 
        title: "Error", 
        description: "Could not remove student. Please try again.",
        variant: "destructive"
      });
    }
  };

  const startEditing = (student: Student) => {
    setEditingStudent(student);
    setNewStudentName(student.display_name);
    setNewStudentId(student.student_id || "");
    setNewStudentPin(student.student_pin || "");
    setNewGradeLevel(student.grade_level || "");
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    
    setSubmitting(true);

    const name = newStudentName.trim();
    const pin = newStudentPin.trim();

    if (!name) {
      toast({ title: "Name required", description: "Please enter the student's name." });
      setSubmitting(false);
      return;
    }

    if (!pin) {
      toast({ title: "PIN required", description: "Please enter a student PIN." });
      setSubmitting(false);
      return;
    }

    if (!/^\d{4,6}$/.test(pin)) {
      toast({ title: "Invalid PIN", description: "Student PIN must be 4-6 digits." });
      setSubmitting(false);
      return;
    }

    try {
      const { error } = await sb
        .from("students")
        .update({
          display_name: name,
          student_id: newStudentId.trim() || null,
          student_pin: pin,
          grade_level: newGradeLevel.trim() || null
        })
        .eq("id", editingStudent.id);

      if (error) {
        if (error.code === "23505" && error.message.includes("students_unique_name_per_classroom")) {
          toast({ 
            title: "Duplicate name", 
            description: "That name is already in use in this class.",
            variant: "destructive"
          });
        } else {
          console.error("Error updating student:", error);
          toast({ 
            title: "Could not update student", 
            description: error.message,
            variant: "destructive"
          });
        }
        setSubmitting(false);
        return;
      }

      toast({ title: "Student updated", description: "Student information has been saved." });
      setEditingStudent(null);
      loadStudents();
      
    } catch (error) {
      console.error("Unexpected error updating student:", error);
      toast({ 
        title: "Error", 
        description: "Could not update student. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatLastLogin = (dateString?: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const activeStudentCount = students.filter(s => s.has_logged_in).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {classroom.name}
              <Badge variant="outline">
                {students.length} students
              </Badge>
              {activeStudentCount > 0 && (
                <Badge variant="default">
                  {activeStudentCount} active
                </Badge>
              )}
              {isSelectedForNetwork && (
                <Badge className="bg-green-600 hover:bg-green-600 text-white border-green-600">
                  <Network className="h-3 w-3 mr-1" />
                  On Network
                </Badge>
              )}
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={selectClassroomForNetwork}
              variant={isSelectedForNetwork ? "default" : "outline"}
              size="sm"
              className={
                isSelectedForNetwork 
                  ? "bg-green-600 hover:bg-green-700 border-green-600 text-white" 
                  : "hover:bg-green-50 hover:border-green-300"
              }
              disabled={selecting}
            >
              <Network className="h-4 w-4 mr-2" />
              {selecting 
                ? "Updating..." 
                : isSelectedForNetwork 
                  ? "Remove from Network" 
                  : "Add to Network"
              }
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={`/app/seeding/${classroom.id}`}>
                <Sprout className="h-4 w-4 mr-2" />
                Seeding
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to={`/app/kiosk?classId=${classroom.id}`}>
                Open Kiosk
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {isSelectedForNetwork && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Network className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                On Garden Network
              </span>
            </div>
            <p className="text-xs text-green-700">
              This classroom is participating in Garden Network features. 
              <Link to="/app/network" className="font-medium hover:underline ml-1">
                Go to Garden Network →
              </Link>
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Classroom PIN</Label>
            <div className="flex items-center space-x-2">
              <code className="bg-muted px-2 py-1 rounded font-mono text-sm">
                {classroom.kiosk_pin}
              </code>
              <Button variant="outline" size="sm" onClick={copyKioskPin}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={generateNewPin} disabled={generatingPin}>
                <RefreshCw className={`h-4 w-4 ${generatingPin ? 'animate-spin' : ''}`} />
                {generatingPin ? "Generating..." : "Generate New"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this PIN with students for kiosk access
            </p>
          </div>
          <div className="space-y-2">
            <Label>Student Access</Label>
            <p className="text-sm text-muted-foreground">
              Students log in with their <strong>name</strong> + <strong>PIN</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              No more temporary join codes needed!
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="flex items-center gap-2">
              Students ({students.length})
              {activeStudentCount > 0 && (
                <Badge variant="secondary">
                  {activeStudentCount} active
                </Badge>
              )}
            </Label>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading students...</p>
          ) : students.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No students added yet. Click "Add Student" to create your class list.
            </p>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium">{student.display_name}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {student.student_id && <span>ID: {student.student_id}</span>}
                        {student.grade_level && <span>Grade: {student.grade_level}</span>}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last login: {formatLastLogin(student.last_login_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={student.has_logged_in ? "default" : "secondary"}>
                      {student.has_logged_in ? "Active" : "Not logged in"}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => startEditing(student)}>
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteStudent(student)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {students.length > 0 && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{students.length}</p>
              <p className="text-xs text-muted-foreground">Total Students</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{activeStudentCount}</p>
              <p className="text-xs text-muted-foreground">Have Logged In</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{students.length - activeStudentCount}</p>
              <p className="text-xs text-muted-foreground">Never Logged In</p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Add Student Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student to {classroom.name}</DialogTitle>
            <DialogDescription>
              Add a new student to your classroom. They'll be able to log in using their name and the classroom PIN.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStudent}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Student Name *</Label>
                <Input
                  id="studentName"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Full name (e.g., Sarah Johnson)"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use their full name - this is what they'll type to log in.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID (optional)</Label>
                <Input
                  id="studentId"
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  placeholder="School ID number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentPin">Student PIN (required)</Label>
                <Input
                  id="studentPin"
                  value={newStudentPin}
                  onChange={(e) => setNewStudentPin(e.target.value)}
                  placeholder="4-6 digit PIN"
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Students will use this PIN along with their name to log in.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Grade Level (optional)</Label>
                <Input
                  id="gradeLevel"
                  value={newGradeLevel}
                  onChange={(e) => setNewGradeLevel(e.target.value)}
                  placeholder="e.g., 5th Grade, Grade 10"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Adding..." : "Add Student"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={editingStudent !== null} onOpenChange={() => setEditingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information. Note: Login tracking data cannot be modified.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditStudent}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editStudentName">Student Name *</Label>
                <Input
                  id="editStudentName"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStudentId">Student ID</Label>
                <Input
                  id="editStudentId"
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  placeholder="School ID number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStudentPin">Student PIN</Label>
                <Input
                  id="editStudentPin"
                  value={newStudentPin}
                  onChange={(e) => setNewStudentPin(e.target.value)}
                  placeholder="4-6 digit PIN"
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Students use this PIN along with their name to log in.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editGradeLevel">Grade Level</Label>
                <Input
                  id="editGradeLevel"
                  value={newGradeLevel}
                  onChange={(e) => setNewGradeLevel(e.target.value)}
                  placeholder="e.g., 5th Grade"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}