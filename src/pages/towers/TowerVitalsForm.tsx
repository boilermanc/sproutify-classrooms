// src/pages/towers/TowerVitalsForm.tsx

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ColorNumberInput } from "@/components/ui/color-number-input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  const saveVitals = async () => {
    if (!towerId || !teacherId) return;
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
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>pH / EC / Lighting</CardTitle></CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-4">
        <ColorNumberInput type="ph" label="pH" value={ph} onChange={setPh} placeholder="e.g. 6.5" />
        <ColorNumberInput type="ec" label="EC (mS/cm)" value={ec} onChange={setEc} placeholder="e.g. 1.6" />
        <div className="space-y-2">
          <Label>Light hours/day</Label>
          <Input inputMode="numeric" value={light ?? ""} onChange={(e) => setLight(Number(e.target.value))} placeholder="e.g. 12" />
        </div>
        <div className="md:col-span-3">
          <Button onClick={saveVitals}> Save vitals </Button>
        </div>
      </CardContent>
    </Card>
  );
}
