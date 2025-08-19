// src/pages/kiosk/StudentVitalsForm.tsx

import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ColorNumberInput } from "@/components/ui/color-number-input";
import { Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function StudentVitalsForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const towerId = searchParams.get("towerId");
  const teacherId = localStorage.getItem("teacher_id_for_tower"); 

  const [ph, setPh] = useState<number | undefined>();
  const [ec, setEc] = useState<number | undefined>();
  const [light, setLight] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!towerId || !teacherId) {
      toast({ title: "Error", description: "Missing tower or class information. Please log in again.", variant: "destructive" });
      return;
    }
    setLoading(true);

    // This calls the Edge Function you deployed earlier
    const { data, error } = await supabase.functions.invoke('student-log-vitals', {
      body: { towerId, teacherId, ph, ec, light },
    });

    setLoading(false);
    if (error) {
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success!", description: "Vitals have been saved." });
      navigate("/student/dashboard"); // Go back to the dashboard on success
    }
  };

  return (
    <div className="container py-8">
      <SEO title="Log Vitals | Sproutify School" />
      <Card className="max-w-2xl mx-auto">
        <CardHeader><CardTitle>Log Vitals</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <ColorNumberInput type="ph" label="pH" value={ph} onChange={setPh} placeholder="e.g. 5.5" />
            <ColorNumberInput type="ec" label="EC (mS/cm)" value={ec} onChange={setEc} placeholder="e.g. 1.6" />
            <div className="space-y-2">
              <Label>Light hours/day</Label>
              <Input inputMode="numeric" value={light ?? ""} onChange={(e) => setLight(Number(e.target.value))} placeholder="e.g. 12" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Vitals"}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/student/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
