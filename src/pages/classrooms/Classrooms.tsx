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
import { Network, Sprout, RefreshCw } from "lucide-react";
import { useAppStore } from "@/context/AppStore";
import { ClassroomRow, Classroom } from "@/components/classrooms";

export default function Classrooms() {
  const { toast } = useToast();
  const { dispatch } = useAppStore();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);

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

    const selectedClassrooms = data?.filter((c: Classroom) => c.is_selected_for_network);
    if (selectedClassrooms && selectedClassrooms.length > 0) {
      dispatch({
        type: "SET_SELECTED_CLASSROOM",
        payload: selectedClassrooms[0]
      });
    }
  };

  const generatePinForForm = async () => {
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

      setGeneratedPin(newPin);
      toast({
        title: "PIN Generated!",
        description: `New PIN: ${newPin}`
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "Could not generate PIN",
        variant: "destructive"
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
    if (!generatedPin) {
      toast({ title: "Missing PIN", description: "Please generate a PIN first." });
      return;
    }

    const { data, error } = await supabase.from("classrooms").insert({
      name,
      teacher_id: userId,
      kiosk_pin: generatedPin,
      educational_package: "base",
      is_selected_for_network: false,
    }).select("kiosk_pin").single();

    if (error) {
      toast({ title: "Could not create", description: error.message, variant: "destructive" });
      return;
    }

    setName("");
    setGeneratedPin(null);
    const finalPin = data?.kiosk_pin || generatedPin;
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
                <div className="flex items-center space-x-2">
                  <Input
                    id="pin"
                    value={generatedPin || ""}
                    disabled
                    className="bg-muted text-muted-foreground cursor-not-allowed font-mono"
                    placeholder="Click 'Generate PIN' to create a unique PIN"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generatePinForForm}
                    disabled={!!generatedPin}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Generate PIN
                  </Button>
                  {generatedPin && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setGeneratedPin(null)}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {generatedPin
                    ? `PIN: ${generatedPin} - Ready to create classroom!`
                    : "Generate a unique PIN for your classroom"
                  }
                </p>
              </div>
              <Button type="submit" disabled={!generatedPin || !name}>
                Create Classroom
              </Button>
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
