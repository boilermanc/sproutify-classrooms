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
import { customAlphabet } from "nanoid";
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
import { Trash2 } from "lucide-react";

interface Classroom {
  id: string;
  name: string;
  kiosk_pin: string;
  created_at: string;
}

interface JoinCode {
  id: string;
  classroom_id: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

interface Student {
  id: string;
  display_name: string;
}

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No confusing chars
const nanoid = customAlphabet(alphabet, 6);

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
    // SECURITY FIX: Only select classrooms belonging to the current teacher
    const { data, error } = await sb
      .from("classrooms")
      .select("id,name,kiosk_pin,created_at")
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

  const fetchActiveCode = async (classroomId: string): Promise<JoinCode | null> => {
    const { data, error } = await sb
      .from("join_codes")
      .select("id,classroom_id,code,is_active,created_at")
      .eq("classroom_id", classroomId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) {
      toast({ title: "Error fetching code", description: error.message, variant: "destructive" });
      return null;
    }
    return data?.[0] ?? null;
  };

  const generateJoinCode = async (classroomId: string) => {
    const code = nanoid();
    await sb.from("join_codes").update({ is_active: false }).eq("classroom_id", classroomId);
    const { error } = await sb.from("join_codes").insert({ classroom_id: classroomId, code, is_active: true });
    if (error) {
      toast({ title: "Error generating code", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Join code generated", description: code });
    }
  };

  const disableActiveCode = async (classroomId: string) => {
    const { error } = await sb.from("join_codes").update({ is_active: false }).eq("classroom_id", classroomId).eq("is_active", true);
    if (error) {
      toast({ title: "Error disabling code", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Join code disabled" });
    }
  };

  const copy = async (text?: string | null) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard!" });
    } catch (e) {
      toast({ title: "Copy failed", description: "Could not copy to clipboard.", variant: "destructive" });
    }
  };

  const fetchStudents = async (classroomId: string): Promise<Student[]> => {
    const { data, error } = await sb
      .from("students")
      .select("id, display_name")
      .eq("classroom_id", classroomId)
      .order("created_at", { ascending: true });
    if (error) {
      toast({ title: "Error fetching students", description: error.message, variant: "destructive" });
      return [];
    }
    return data || [];
  };

  const deleteStudent = async (studentId: string) => {
    const { error } = await sb.from("students").delete().eq("id", studentId);
    if (error) {
      toast({ title: "Error removing student", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Student removed" });
    }
  };

  return (
    <div className="container max-w-5xl py-8">
      <SEO title="Classrooms | Sproutify School" description="Manage classrooms and student join codes." canonical="/app/classrooms" />

      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Classrooms</h1>
        <Button asChild variant="outline">
          <Link to="/app/help#invite-students">How to invite students</Link>
        </Button>
      </header>

      {!userId && !loading && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
          </CardHeader>
          <CardContent>
            Please sign in to manage classrooms and join codes.
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
              </div>
              <Button type="submit">Create</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Kiosk Mode</CardTitle>
          </CardHeader>
          <CardContent>
            Use Kiosk Mode on a shared device for students to join using a code.
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
        {classrooms.map((c) => (
          <ClassroomRow
            key={c.id}
            classroom={c}
            onGenerate={() => generateJoinCode(c.id)}
            onDisable={() => disableActiveCode(c.id)}
            onCopy={copy}
            fetchActiveCode={() => fetchActiveCode(c.id)}
            fetchStudents={() => fetchStudents(c.id)}
            onDeleteStudent={(studentId) => deleteStudent(studentId)}
          />
        ))}
        {classrooms.length === 0 && (
          <p className="text-muted-foreground">No classrooms yet. Create one above.</p>
        )}
      </section>
    </div>
  );
}

function ClassroomRow({
  classroom, onGenerate, onDisable, onCopy, fetchActiveCode, fetchStudents, onDeleteStudent
}: {
  classroom: Classroom;
  onGenerate: () => Promise<void>;
  onDisable: () => Promise<void>;
  onCopy: (text?: string | null) => void;
  fetchActiveCode: () => Promise<JoinCode | null>;
  fetchStudents: () => Promise<Student[]>;
  onDeleteStudent: (studentId: string) => Promise<void>;
}) {
  const [activeCode, setActiveCode] = useState<JoinCode | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [code, studentList] = await Promise.all([
        fetchActiveCode(),
        fetchStudents(),
      ]);
      setActiveCode(code);
      setStudents(studentList);
      setLoading(false);
    };
    loadData();
  }, [classroom.id, fetchActiveCode, fetchStudents, refreshKey]);

  const handleGenerate = async () => {
    await onGenerate();
    setRefreshKey(key => key + 1);
  };

  const handleDisable = async () => {
    await onDisable();
    setRefreshKey(key => key + 1);
  };

  const handleDeleteStudent = async (studentId: string) => {
    await onDeleteStudent(studentId);
    setRefreshKey(key => key + 1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{classroom.name}</CardTitle>
          <Button asChild variant="outline">
            <Link to={`/app/kiosk?classId=${classroom.id}`}>Kiosk for this class</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div>
            <Label>Kiosk PIN</Label>
            <p className="font-mono">{classroom.kiosk_pin}</p>
          </div>
          <div>
            <Label>Active Join Code</Label>
            <p className="font-mono">{activeCode?.code ?? (loading ? "..." : "None")}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGenerate}>Generate</Button>
            <Button variant="outline" onClick={() => onCopy(activeCode?.code)} disabled={!activeCode?.code}>Copy</Button>
            <Button variant="secondary" onClick={handleDisable} disabled={!activeCode?.code}>Disable</Button>
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex justify-between items-center">
            <Label>Students ({students.length})</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" disabled={students.length === 0}>Manage</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manage Students in "{classroom.name}"</DialogTitle>
                  <DialogDescription>
                    You can remove students from your class roster here. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-4">
                  {students.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                      <span>{student.display_name}</span>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteStudent(student.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Done</Button>
                    </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading students...</p>
          ) : students.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {students.map(student => (
                <Badge key={student.id} variant="secondary">{student.display_name}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">No students have joined yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
