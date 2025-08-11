import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { toast } from "@/hooks/use-toast";

export default function Profile() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("");
  const [district, setDistrict] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [schoolImageUrl, setSchoolImageUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }
      // Load or create profile
      const { data: prof, error } = await supabase
        .from("profiles")
        .select("full_name, bio, phone, timezone, district, school_name, avatar_url, school_image_url")
        .eq("id", uid)
        .maybeSingle();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      if (!prof) {
        // Create blank profile row
        const { error: insErr } = await supabase.from("profiles").insert({ id: uid });
        if (insErr) console.error(insErr);
        setLoading(false);
        return;
      }

      setFullName(prof.full_name ?? "");
      setBio(prof.bio ?? "");
      setPhone(prof.phone ?? "");
      setTimezone(prof.timezone ?? "");
      setDistrict(prof.district ?? "");
      setSchoolName(prof.school_name ?? "");
      setAvatarUrl(prof.avatar_url ?? null);
      setSchoolImageUrl(prof.school_image_url ?? null);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, bio, phone, timezone, district, school_name: schoolName, avatar_url: avatarUrl, school_image_url: schoolImageUrl })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      console.error(error);
      toast({ title: "Failed to save" });
    } else {
      toast({ title: "Profile updated" });
    }
  };

  const upload = async (file: File, bucket: string, key: string): Promise<string | null> => {
    if (!userId) return null;
    const path = `${userId}/${key}`;
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      console.error(upErr);
      toast({ title: "Upload failed" });
      return null;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await upload(f, "avatars", `avatar.${f.name.split(".").pop() || "jpg"}`);
    if (url) setAvatarUrl(url);
  };

  const onSchoolImgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await upload(f, "school-logos", `school.${f.name.split(".").pop() || "jpg"}`);
    if (url) setSchoolImageUrl(url);
  };

  return (
    <div className="space-y-4">
      <SEO title="Profile | Sproutify" description="Manage your profile, school details and images" canonical={window.location.href} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <Button onClick={save} disabled={saving || loading}>{saving ? "Saving..." : "Save"}</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Your info</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input value={fullName} onChange={(e)=>setFullName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="(555) 555-5555" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Bio</Label>
            <Textarea value={bio} onChange={(e)=>setBio(e.target.value)} placeholder="Tell us about your classroom..." />
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Input value={timezone} onChange={(e)=>setTimezone(e.target.value)} placeholder="America/Chicago" />
          </div>
          <div className="space-y-2">
            <Label>District</Label>
            <Input value={district} onChange={(e)=>setDistrict(e.target.value)} placeholder="Springfield Public Schools" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Images</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Avatar</Label>
            {avatarUrl && <img src={avatarUrl} alt="Profile avatar" className="h-24 w-24 rounded-full object-cover" />}
            <Input type="file" accept="image/*" onChange={onAvatarChange} />
          </div>
          <div className="space-y-2">
            <Label>School image</Label>
            {schoolImageUrl && <img src={schoolImageUrl} alt="School" className="h-24 w-24 rounded-md object-cover" />}
            <Input type="file" accept="image/*" onChange={onSchoolImgChange} />
          </div>
          <div className="space-y-2">
            <Label>School name</Label>
            <Input value={schoolName} onChange={(e)=>setSchoolName(e.target.value)} placeholder="Roosevelt Elementary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
