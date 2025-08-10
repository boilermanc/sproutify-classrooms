import { useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
const sb = supabase as any;
import { Link } from "react-router-dom";

export default function Kiosk() {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successName, setSuccessName] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessName(null);

    const joinCode = code.trim().toUpperCase();

    const { data: codes, error: codeErr } = await sb
      .from("join_codes")
      .select("classroom_id, is_active")
      .eq("code", joinCode)
      .eq("is_active", true)
      .limit(1);

    if (codeErr) {
      toast({ title: "Error", description: codeErr.message });
      setSubmitting(false);
      return;
    }

    const classroomId = codes?.[0]?.classroom_id;
    if (!classroomId) {
      toast({ title: "Invalid code", description: "Ask your teacher for a new code." });
      setSubmitting(false);
      return;
    }

    const name = displayName.trim();
    if (!name) {
      toast({ title: "Enter your name" });
      setSubmitting(false);
      return;
    }

    const { error: insErr } = await sb
      .from("students")
      .insert({ display_name: name, classroom_id: classroomId });

    if (insErr) {
      toast({ title: "Could not join", description: insErr.message });
      setSubmitting(false);
      return;
    }

    setSuccessName(name);
    setDisplayName("");
    setCode("");
    toast({ title: "You're in!", description: "Welcome to the class garden." });
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen container max-w-xl py-8">
      <SEO title="Kiosk Mode | Sproutify School" description="Students join a classroom with a code." canonical="/app/kiosk" />
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kiosk Mode</h1>
        <Button asChild variant="outline"><Link to="/app/help#kiosk-mode">Help</Link></Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Join your class</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Aiden" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Join code</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. ABC123" required className="uppercase" />
            </div>
            <Button type="submit" disabled={submitting}>{submitting ? "Joining..." : "Join"}</Button>
            {successName && (
              <p className="text-sm text-muted-foreground">Success! {successName}, you can hand the device to the next student.</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
