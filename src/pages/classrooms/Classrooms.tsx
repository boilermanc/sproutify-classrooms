// src/pages/classrooms/Classrooms.tsx - Updated with Garden Network selection

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
const sb = supabase as any;
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
import { Plus, Trash2, Edit2, Copy, Clock, Network } from "lucide-react";
// ADD THIS IMPORT
import { useAppStore } from "@/context/AppStore";

// Updated interfaces for the new system
interface Classroom {
  id: string;
  name: string;
  kiosk_pin: string;
  created_at: string;
  teacher_id?: string; // Add this for AppStore compatibility
}

interface Student {
  id: string;
  display_name: string;
  student_id?: string | null;
  grade_level?: string | null;
  has_logged_in: boolean;
  first_login_at?: string | null;
  last_login_at?: string | null;
  created_at: string;
}

export default function Classrooms() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [kioskPin, setKioskPin] = useState("");

  useEffect(() => {
    let mounted = true;

    // Set up auth listener then get session
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
    const { data, error } = await sb
      .from("classrooms")
      .select("id,name,kiosk_pin,created_at,teacher_id")
      .eq("teacher_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setClassrooms(data || []);
  };

  const createClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast({ title: "Please sign in", description: "You must be logged in to create a classroom." });
      return;
    }
    if (!name || !kioskPin) {
      toast({ title: "Missing info", description: "Enter a class name and kiosk PIN." });
      return;
    }
    const { error } = await sb.from("classrooms").insert({
      name,
      kiosk_pin: kioskPin,
      teacher_id: userId,
    });
    if (error) {
      toast({ title: "Could not create", description: error.message, variant: "destructive" });
      return;
    }
    setName("");
    setKioskPin("");
    toast({ title: "Classroom created" });
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

      <section className="grid md:grid-cols-2 gap-6">
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
                <Input id="pin" value={kioskPin} onChange={(e) => setKioskPin(e.target.value)} placeholder="e.g. 4932" required />
                <p className="text-xs text-muted-foreground">Students will use this PIN to log in</p>
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

      <Separator className="my-8" />

      <section className="grid gap-4">
        {classrooms.map((classroom) => (
          <ClassroomRow key={classroom.id} classroom={classroom} />
        ))}
        {classrooms.length === 0 && (
          <p className="text-muted-foreground">No classrooms yet. Create one above.</p>
        )}
      </section>
    </div>
  );
}

// Updated ClassroomRow component with Garden Network selection
function ClassroomRow({ classroom }: { classroom: Classroom }) {
  const { toast } = useToast();
  const { state, dispatch } = useAppStore(); // ADD THIS LINE
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add student form state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentId, setNewStudentId] = useState("");
  const [newGradeLevel, setNewGradeLevel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ADD THIS FUNCTION for Garden Network selection
  const selectClassroomForNetwork = () => {
    dispatch({ 
      type: "SET_SELECTED_CLASSROOM", 
      payload: classroom 
    });
    toast({ 
      title: "Classroom selected", 
      description: `${classroom.name} is now your active classroom for Garden Network.`,
      duration: 3000
    });
  };

  // Check if this classroom is currently selected
  const isSelectedForNetwork = state.selectedClassroom?.id === classroom.id;

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

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const name = newStudentName.trim();
    if (!name) {
      toast({ title: "Name required", description: "Please enter the student's name." });
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

      // Success
      toast({ title: "Student added", description: `${name} has been added to ${classroom.name}.` });
      
      // Clear form
      setNewStudentName("");
      setNewStudentId("");
      setNewGradeLevel("");
      setShowAddDialog(false);
      
      // Refresh student list
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
    setNewGradeLevel(student.grade_level || "");
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    
    setSubmitting(true);

    try {
      const { error } = await sb
        .from("students")
        .update({
          display_name: newStudentName.trim(),
          student_id: newStudentId.trim() || null,
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
              {/* ADD SELECTED INDICATOR */}
              {isSelectedForNetwork && (
                <Badge variant="default" className="bg-green-600">
                  Network Active
                </Badge>
              )}
            </CardTitle>
          </div>
          {/* UPDATED BUTTON SECTION */}
          <div className="flex gap-2">
            <Button 
              onClick={selectClassroomForNetwork}
              variant={isSelectedForNetwork ? "default" : "outline"}
              size="sm"
              className={isSelectedForNetwork ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Network className="h-4 w-4 mr-2" />
              {isSelectedForNetwork ? "Selected" : "Select for Network"}
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
        
        {/* Garden Network Status Info - ADD THIS SECTION */}
        {isSelectedForNetwork && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Network className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Garden Network Ready
              </span>
            </div>
            <p className="text-xs text-green-700">
              This classroom is selected for Garden Network features. 
              <Link to="/app/network" className="font-medium hover:underline ml-1">
                Go to Garden Network →
              </Link>
            </p>
          </div>
        )}

        {/* Classroom Access Info - Simplified */}
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

        {/* Student Management */}
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

        {/* Quick Stats */}
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