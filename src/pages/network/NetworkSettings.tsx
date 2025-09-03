import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, Shield, Users, Globe } from 'lucide-react';

import { NetworkService } from '@/services/networkService';
import { NetworkSettings as NetworkSettingsType } from '@/integrations/supabase/types';
import { useAppStore } from '@/context/AppStore';
import { toast } from 'sonner';

const NONE = 'none'; // sentinel for "Not specified" options

export default function NetworkSettingsPage() {
  const { state } = useAppStore();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<NetworkSettingsType>({
    classroom_id: state.selectedClassroom?.id || '',
    is_network_enabled: false,
    visibility_level: 'invite_only',
    share_harvest_data: true,
    share_photos: false,
    share_growth_tips: true,
    display_name: null,
    bio: null,
    region: null,
    grade_level: null,
    school_type: null,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Keep classroom_id synced once the classroom appears
  useEffect(() => {
    if (state.selectedClassroom?.id && settings.classroom_id !== state.selectedClassroom.id) {
      setSettings(prev => ({ ...prev, classroom_id: state.selectedClassroom!.id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedClassroom?.id]);

  useEffect(() => {
    if (state.selectedClassroom?.id) void loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedClassroom?.id]);

  const loadSettings = async () => {
    try {
      const existing = await NetworkService.getNetworkSettings(state.selectedClassroom!.id);
      if (existing) {
        setSettings(existing);
      } else {
        // default display name when first enabling
        setSettings(prev => ({
          ...prev,
          classroom_id: state.selectedClassroom!.id,
          display_name: state.selectedClassroom?.name || null,
        }));
      }
    } catch (err) {
      console.error('Failed to load network settings:', err);
      toast.error('Failed to load network settings');
    } finally {
      setInitialLoad(false);
    }
  };

  const handleNetworkToggle = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      is_network_enabled: enabled,
      display_name: enabled && !prev.display_name ? (state.selectedClassroom?.name || '') : prev.display_name,
    }));
  };

  // validation: when enabled, display_name is required
  const isValid = !settings.is_network_enabled || !!settings.display_name?.trim();

  const handleSave = async () => {
    if (!isValid) {
      toast.error('Display name is required to join the network');
      return;
    }
    setLoading(true);
    try {
      const saved = await NetworkService.upsertNetworkSettings(settings);
      toast.success('Network settings saved successfully!');
      if (saved.is_network_enabled) navigate('/app/network');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (!state.selectedClassroom) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold">Select a Classroom</h2>
            <p className="text-muted-foreground">
              Please select a classroom to configure network settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (initialLoad) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Plain function instead of useMemo (avoids hook order issues)
  const getVisibilityInfo = (level: string) => {
    switch (level) {
      case 'public':
        return {
          icon: <Globe className="h-4 w-4" />,
          description: 'Your classroom will be discoverable by all Garden Network members',
          privacy: 'Most open',
        };
      case 'network_only':
        return {
          icon: <Users className="h-4 w-4" />,
          description: "Only visible to classrooms you're already connected with",
          privacy: 'More private',
        };
      default: // invite_only
        return {
          icon: <Shield className="h-4 w-4" />,
          description:
            "Others can send you connection requests, but you won't appear in public searches",
          privacy: 'Balanced',
        };
    }
  };
  const visibilityInfo = getVisibilityInfo(settings.visibility_level);

  // helpers to map nullable DB values <-> Select (which forbids empty string)
  const toOpt = (v: string | null | undefined) => (v ?? NONE);
  const fromOpt = (v: string) => (v === NONE ? null : v);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Garden Network Settings</h1>
          <p className="text-muted-foreground">
            Connect with other classrooms to compete, collaborate, and share growing experiences.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/app/network')}>
          Back to Network
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Network Participation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="network-enabled" className="text-base font-medium">
                Join the Garden Network
              </Label>
              <p className="text-sm text-muted-foreground">Connect with educators and students worldwide</p>
            </div>
            <Switch id="network-enabled" checked={settings.is_network_enabled} onCheckedChange={handleNetworkToggle} />
          </div>

          {settings.is_network_enabled && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Welcome to the Garden Network! Your classroom can connect with others, participate in challenges,
                and share growing experiences.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {settings.is_network_enabled && (
        <>
          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Classroom Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">
                    Display Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="display-name"
                    value={settings.display_name ?? ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder={`${state.selectedClassroom.name}`}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">How your classroom appears to others in the network</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Classroom Description</Label>
                  <Textarea
                    id="bio"
                    value={settings.bio ?? ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell other classrooms about your growing goals, experience level, and what you hope to achieve..."
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">{(settings.bio?.length ?? 0)}/500 characters</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">Region/Location</Label>
                    <Input
                      id="region"
                      value={settings.region ?? ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, region: e.target.value }))}
                      placeholder="e.g. California, UK, Ontario"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade-level">Grade Level</Label>
                    <Select
                      value={toOpt(settings.grade_level)}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, grade_level: fromOpt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>Not specified</SelectItem>
                        <SelectItem value="K-2">K-2 (Ages 5-8)</SelectItem>
                        <SelectItem value="3-5">3-5 (Ages 8-11)</SelectItem>
                        <SelectItem value="6-8">6-8 (Ages 11-14)</SelectItem>
                        <SelectItem value="9-12">9-12 (Ages 14-18)</SelectItem>
                        <SelectItem value="College">College/University</SelectItem>
                        <SelectItem value="Adult">Adult Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="school-type">School Type</Label>
                    <Select
                      value={toOpt(settings.school_type)}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, school_type: fromOpt(value_
