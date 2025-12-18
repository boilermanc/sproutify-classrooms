// src/components/classrooms/ClassroomRow.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, Copy, Clock, Network, Sprout, RefreshCw } from "lucide-react";
import { useAppStore } from "@/context/AppStore";

export interface Classroom {
  id: string;
  name: string;
  kiosk_pin: string;
  created_at: string;
  teacher_id?: string;
  is_selected_for_network?: boolean;
}

export interface Student {
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

interface ClassroomRowProps {
  classroom: Classroom;
  onReload: () => void;
  userId: string | null;
}

export function ClassroomRow({ classroom, onReload, userId }: ClassroomRowProps) {
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

  const isSelectedForNetwork = classroom.is_selected_for_network === true;

  // Load students for this classroom
  const loadStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
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
        toast({
          title: "Error loading students",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setStudents(data || []);
    } catch (error) {
      // Silently handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [classroom.id]);

  const selectClassroomForNetwork = async () => {
    setSelecting(true);
    try {
      const newSelectionState = !isSelectedForNetwork;

      const { error } = await supabase
        .from('classrooms')
        .update({ is_selected_for_network: newSelectionState })
        .eq('id', classroom.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update classroom selection. Please try again.",
          variant: "destructive"
        });
        return;
      }

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

      onReload();

    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSelecting(false);
    }
  };

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
      let newPin;
      let attempts = 0;
      const maxAttempts = 100;

      do {
        newPin = Math.floor(1000 + Math.random() * 9000).toString();
        attempts++;

        const { data: existingClassroom } = await supabase
          .from("classrooms")
          .select("id")
          .eq("kiosk_pin", newPin)
          .neq("id", classroom.id)
          .maybeSingle();

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

      onReload();
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

  const validateStudentInput = (name: string, pin: string): boolean => {
    if (!name.trim()) {
      toast({ title: "Name required", description: "Please enter the student's name." });
      return false;
    }

    if (!pin.trim()) {
      toast({ title: "PIN required", description: "Please enter a student PIN." });
      return false;
    }

    if (!/^\d{4,6}$/.test(pin)) {
      toast({ title: "Invalid PIN", description: "Student PIN must be 4-6 digits." });
      return false;
    }

    return true;
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const name = newStudentName.trim();
    const pin = newStudentPin.trim();

    if (!validateStudentInput(name, pin)) {
      setSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
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
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", student.id);

      if (error) {
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

    if (!validateStudentInput(name, pin)) {
      setSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
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
