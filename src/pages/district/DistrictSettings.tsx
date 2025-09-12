import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

async function getDistrictId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: p } = await supabase.from("profiles").select("district_id").eq("id", data.user.id).single();
  return p?.district_id ?? null;
}

async function fetchDistrict(district_id: string | number) {
  const { data, error } = await supabase.from("districts").select("id, name, contact_email, contact_phone, address, street_address, city, state, postal_code, country").eq("id", district_id).single();
  if (error) throw error;
  return data;
}

export default function DistrictSettings() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: districtId } = useQuery({ queryKey: ["me", "district_id"], queryFn: getDistrictId });

  const districtQ = useQuery({
    queryKey: ["district_settings", districtId],
    queryFn: () => fetchDistrict(districtId!),
    enabled: !!districtId,
  });

  const [form, setForm] = useState<any>({ 
    name: "", 
    contact_email: "", 
    contact_phone: "", 
    address: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "United States"
  });
  useEffect(() => { if (districtQ.data) setForm(districtQ.data); }, [districtQ.data]);

  const save = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase.from("districts").update(payload).eq("id", districtId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["district_settings", districtId] });
      toast({ title: "Settings saved" });
    },
    onError: (e: any) => toast({ title: "Save failed", description: String(e.message ?? e), variant: "destructive" }),
  });

  return (
    <div className="space-y-6 p-1">
      <h1 className="text-2xl font-semibold">District Settings</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input value={form.name || ""} onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Contact Email</Label>
            <Input type="email" value={form.contact_email || ""} onChange={(e) => setForm((f: any) => ({ ...f, contact_email: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Phone</Label>
            <Input value={form.contact_phone || ""} onChange={(e) => setForm((f: any) => ({ ...f, contact_phone: e.target.value }))} />
          </div>
          <div className="grid gap-2">
            <Label>Street Address</Label>
            <Input 
              value={form.street_address || ""} 
              onChange={(e) => setForm((f: any) => ({ ...f, street_address: e.target.value }))} 
              placeholder="123 Main Street"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>City</Label>
              <Input 
                value={form.city || ""} 
                onChange={(e) => setForm((f: any) => ({ ...f, city: e.target.value }))} 
                placeholder="Anytown"
              />
            </div>
            <div className="grid gap-2">
              <Label>State</Label>
              <Input 
                value={form.state || ""} 
                onChange={(e) => setForm((f: any) => ({ ...f, state: e.target.value }))} 
                placeholder="CA"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Postal Code</Label>
              <Input 
                value={form.postal_code || ""} 
                onChange={(e) => setForm((f: any) => ({ ...f, postal_code: e.target.value }))} 
                placeholder="12345"
              />
            </div>
            <div className="grid gap-2">
              <Label>Country</Label>
              <Input 
                value={form.country || "United States"} 
                onChange={(e) => setForm((f: any) => ({ ...f, country: e.target.value }))} 
                placeholder="United States"
              />
            </div>
          </div>
          <Button onClick={() => save.mutate(form)} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save Changes"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
