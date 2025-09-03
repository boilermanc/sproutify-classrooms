import { useState, useEffect } from 'react';
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

function describeVisibility(level: string) {
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
        description: "Others can send you connection requests, but you won't appear in public searches",
        privacy: 'Balanced',
      };
  }
}

const NONE = 'not_specified'; // sentinel string for shadcn Select (no empty values)

export default function NetworkSettingsPage() {
  const { state } = useAppStore();

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

  // Debug
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('NetworkSettings render:', {
      selectedClassroom: state.selectedClassroom,
      initialLoad,
      loading,
    });
  }, [state.selectedClassroom, initialLoad, loading]);

  // keep classroom_id in sync
  useEffect(() => {
    if (state.selectedClassroom?.id && settings.classroom_id !== state.selectedClassroom.id) {
      setSettings(prev => ({ ...prev, classroom_id: state.selectedClassroom!.id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedClassroom?.id]);

  useEffect(() => {
    const run = async () => {
      if (!state.selectedClassroom?.id) {
        setInitialLoad(false);
        return;
      }
      try {
        const existing = await NetworkService.getNetworkSettings(state.selectedClassroom.id);
        if (existing) {
          setSettings(existing);
        } else {
          setSettings(prev => ({
            ...prev,
            classroom_id: state.selectedClassroom.id,
            display_name: state.selectedClassroom.name || null,
          }));
        }
      } catch (err) {
        console.error('Failed to load network settings:', err);
        toast.error('Failed to load network settings');
      } finally {
        setInitialLoad(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedClassroom?.id]);

  const handleSave = async () => {
    // validate when enabled
    if (settings.is_network_enabled) {
      if (!settings.display_name?.trim()) {
        toast.error('Display name is required when joining the network');
        return;
      }
      if (settings.display_name.length > 100) {
        toast.error('Display name must be less than 100 characters');
        return;
      }
      if (settings.bio && settings.bio.length > 500) {
        toast.error('Bio must be less than 500 characters');
        return;
      }
    }

    setLoading(true);
    try {
      await NetworkService.upsertNetworkSettings(settings);
      toast.success('Network settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNetworkToggle = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      is_network_enabled: enabled,
      display_name: enabled && !prev.display_name ? (state.selectedClassroom?.name || '') : prev.display_name,
    }));
  };

  // ---- Early returns (no hooks below) ----
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const visibilityInfo = describeVisibility(settings.visibility_level);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Garden Network Settings</h1>
        <p className="text-muted-foreground">
          Connect with other classrooms to compete, collaborate, and share growing experiences.
        </p>
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
            <Switch
              id="network-enabled"
              checked={settings.is_network_enabled}
              onCheckedChange={handleNetworkToggle}
            />
          </div>

          {settings.is_network_enabled && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Welcome to the Garden Network! Your classroom will be able to connect with others,
                participate in challenges, and share growing experiences.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {settings.is_network_enabled && (
        <>
          {/* Profile Information */}
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
                    value={settings.display_name || ''}
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
                    value={settings.bio || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell other classrooms about your growing goals, experience level, and what you hope to achieve..."
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">{settings.bio?.length || 0}/500 characters</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">Region/Location</Label>
                    <Input
                      id="region"
                      value={settings.region || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, region: e.target.value }))}
                      placeholder="e.g. California, UK, Ontario"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade-level">Grade Level</Label>
                    <Select
                      // never pass '' to shadcn Select; use sentinel
                      value={settings.grade_level ?? NONE}
                      onValueChange={(value) =>
                        setSettings(prev => ({ ...prev, grade_level: value === NONE ? null : value }))
                      }
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
                      value={settings.school_type ?? NONE}
                      onValueChange={(value) =>
                        setSettings(prev => ({ ...prev, school_type: (value === NONE ? null : (value as any)) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select school type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>Not specified</SelectItem>
                        <SelectItem value="elementary">Elementary School</SelectItem>
                        <SelectItem value="middle">Middle School</SelectItem>
                        <SelectItem value="high">High School</SelectItem>
                        <SelectItem value="college">College/University</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visibility Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {settings.visibility_level === 'public' ? <Globe className="h-5 w-5" /> :
                 settings.visibility_level === 'network_only' ? <Users className="h-5 w-5" /> :
                 <Shield className="h-5 w-5" />}
                Visibility & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="visibility">Who can discover your classroom?</Label>
                  <Select
                    value={settings.visibility_level}
                    onValueChange={(value: any) => setSettings(prev => ({ ...prev, visibility_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>Public - Discoverable by all</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="invite_only">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          <span>Invite Only - Accept requests only</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="network_only">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Connected Only - Visible to connections</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    {describeVisibility(settings.visibility_level).icon}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {describeVisibility(settings.visibility_level).description}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {describeVisibility(settings.visibility_level).privacy}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {settings.is_network_enabled
            ? 'Your classroom is part of the Garden Network'
            : 'Network participation is currently disabled'}
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
