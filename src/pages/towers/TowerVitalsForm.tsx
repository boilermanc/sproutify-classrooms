import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // 1. Import CardDescription
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ColorNumberInput } from "@/components/ui/color-number-input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface TowerVitalsFormProps {
  towerId: string;
  teacherId: string;
  onVitalsSaved?: () => void;
}

export default function TowerVitalsForm({ towerId, teacherId, onVitalsSaved }: TowerVitalsFormProps) {
  const { toast } = useToast();
  const [ph, setPh] = useState<number | undefined>();
  const [ec, setEc] = useState<number | undefined>();
  const [light, setLight] = useState<number | undefined>();
  const [saving, setSaving] = useState(false);

  const saveVitals = async () => {
    if (!towerId || !teacherId) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('tower_vitals').insert({
        tower_id: towerId,
        teacher_id: teacherId,
        ph: ph || null,
        ec: ec || null,
        light_lux: light ? Math.round(light * 1000) : null
      });

      if (error) throw error;
      
      toast({ title: "Vitals saved", description: "Tower vitals have been recorded successfully." });
      
      // Clear the form
      setPh(undefined);
      setEc(undefined);
      setLight(undefined);

      // Notify the parent to refresh history
      if (onVitalsSaved) onVitalsSaved();

    } catch (error) {
      console.error('Error saving vitals:', error);
      toast({ title: "Error saving vitals", description: "Failed to save tower vitals. Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Tower Vitals</CardTitle>
        {/* 2. THIS IS THE SMALL, VISIBLE CHANGE */}
        <CardDescription>Enter the latest readings for pH, EC, and lighting.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-4">
        <ColorNumberInput type="ph" label="pH" value={ph} onChange={setPh} placeholder="e.g. 5.5" />
        <ColorNumberInput type="ec" label="EC (mS/cm)" value={ec} onChange={setEc} placeholder="e.g. 1.6" />
        <div className="space-y-2">
          <Label>Light hours/day</Label>
          <Input inputMode="numeric" value={light ?? ""} onChange={(e) => setLight(Number(e.target.value))} placeholder="e.g. 12" />
        </div>
        
        <div className="md:col-span-3">
          <Button onClick={saveVitals} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Vitals"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}