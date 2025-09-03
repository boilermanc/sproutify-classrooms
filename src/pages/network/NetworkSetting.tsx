import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NetworkService, NetworkSettings } from '@/services/networkService';
import { useAppStore } from '@/context/AppStore';
import { toast } from 'sonner';

export default function NetworkSettingsPage() {
  const { state } = useAppStore();
  const [settings, setSettings] = useState<NetworkSettings>({
    classroom_id: state.selectedClassroom?.id || '',
    is_network_enabled: false,
    visibility_level: 'invite_only',
    share_harvest_data: true,
    share_photos: false,
    share_growth_tips: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.selectedClassroom?.id) {
      loadSettings();
    }
  }, [state.selectedClassroom?.id]);

  const loadSettings = async () => {
    try {
      const existing = await NetworkService.getNetworkSettings(state.selectedClassroom!.id);
      if (existing) {
        setSettings(existing);
      }
    } catch (error) {
      console.error('Failed to load network settings:', error);
    }
  };

  const handleSave = async () => {
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

  if (!state.selectedClassroom) {
    return <div>Please select a classroom first.</div>;
  }

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
          <CardTitle>Network Participation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="network-enabled"
              checked={settings.is_network_enabled}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, is_network_enabled: checked }))
              }
            />
            <Label htmlFor="network-enabled" className="text-base">
              Join the Garden Network
            </Label>
          </div>
          
          {settings.is_network_enabled && (
            <div className="space-y-4 pl-6 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility Level</Label>
                <Select 
                  value={settings.visibility_level} 
                  onValueChange={(value: any) => 
                    setSettings(prev => ({ ...prev, visibility_level: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Discoverable by all</SelectItem>
                    <SelectItem value="invite_only">Invite Only - Accept requests only</SelectItem>
                    <SelectItem value="network_only">Connected Only - Visible to connections</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={settings.display_name || ''}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, display_name: e.target.value }))
                  }
                  placeholder={`${state.selectedClassroom.name}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Classroom Description</Label>
                <Textarea
                  id="bio"
                  value={settings.bio || ''}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Tell other classrooms about your growing goals and experience..."
                  rows={3}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {settings.is_network_enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Data Sharing Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="share-harvest"
                checked={settings.share_harvest_data}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, share_harvest_data: checked }))
                }
              />
              <Label htmlFor="share-harvest">Share harvest totals for leaderboards</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="share-photos"
                checked={settings.share_photos}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, share_photos: checked }))
                }
              />
              <Label htmlFor="share-photos">Share tower photos in network gallery</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="share-tips"
                checked={settings.share_growth_tips}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, share_growth_tips: checked }))
                }
              />
              <Label htmlFor="share-tips">Share growing tips and success stories</Label>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
}