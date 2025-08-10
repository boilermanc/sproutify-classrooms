import { useEffect, useMemo, useState } from "react";
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
      setUserId(session?.user?.id ?? null);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.session?.user?.id ?? null);
    }).finally(() => setLoading(false));

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    loadClassrooms();
  }, [userId]);

  const loadClassrooms = async () => {
    const { data, error } = await sb
      .from("classrooms")
      .select("id,name,kiosk_pin,created_at")
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Error", description: error.message });
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
      toast({ title: "Could not create", description: error.message });
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
      toast({ title: "Error", description: error.message });
      return null;
    }
    return data?.[0] ?? null;
  };

  const generateJoinCode = async (classroomId: string) => {
    const code = nanoid();
    // Disable existing active codes first (if any)
    const { error: updErr } = await sb
      .from("join_codes")
      .update({ is_active: false })
      .eq("classroom_id", classroomId)
      .eq("is_active", true);
    if (updErr) {
      toast({ title: "Error", description: updErr.message });
      return;
    }

    const { error: insErr } = await sb
      .from("join_codes")
      .insert({ classroom_id: classroomId, code, is_active: true });
    if (insErr) {
      toast({ title: "Error", description: insErr.message });
      return;
    }
    toast({ title: "Join code generated", description: code });
  };

  const disableActiveCode = async (classroomId: string) => {
    const { error } = await sb
      .from("join_codes")
      .update({ is_active: false })
      .eq("classroom_id", classroomId)
      .eq("is_active", true);
    if (error) {
      toast({ title: "Error", description: error.message });
      return;
    }
    toast({ title: "Join code disabled" });
  };

  const copy = async (text?: string | null) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard" });
    } catch (e) {
      toast({ title: "Copy failed" });
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
            fetchActive={() => fetchActiveCode(c.id)}
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
  classroom,
  onGenerate,
  onDisable,
  onCopy,
  fetchActive,
}: {
  classroom: Classroom;
  onGenerate: () => void;
  onDisable: () => void;
  onCopy: (text?: string | null) => void;
  fetchActive: () => Promise<JoinCode | null>;
}) {
  const [active, setActive] = useState<JoinCode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchActive().then((c) => {
      if (!mounted) return;
      setActive(c);
    }).finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [classroom.id]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{classroom.name}</CardTitle>
          <Button asChild variant="outline">
            <Link to="/app/kiosk">Kiosk for this class</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div>
            <Label>Kiosk PIN</Label>
            <p className="font-mono">{classroom.kiosk_pin}</p>
          </div>
          <div>
            <Label>Active Join Code</Label>
            <p className="font-mono">{active?.code ?? (loading ? "Loading..." : "None")}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onGenerate}>Generate</Button>
            <Button variant="outline" onClick={() => onCopy(active?.code)} disabled={!active?.code}>Copy</Button>
            <Button variant="secondary" onClick={onDisable} disabled={!active?.code}>Disable</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
