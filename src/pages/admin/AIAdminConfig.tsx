// src/pages/admin/AIAdminConfig.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { SEO } from '@/components/SEO';
import { Bot, Settings, Save, AlertCircle } from 'lucide-react';

interface AIConfig {
  id?: string;
  classroom_id: string;
  active_model: string;
  max_requests_per_day: number;
  is_enabled: boolean;
}

export default function AIAdminConfig() {
  const { toast } = useToast();
  const [config, setConfig] = useState<AIConfig>({
    classroom_id: '',
    active_model: 'gemini-1.5-flash',
    max_requests_per_day: 50,
    is_enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get classrooms for this teacher
      const { data: classroomData, error: classroomError } = await supabase
        .from('classrooms')
        .select('id, name')
        .eq('teacher_id', user.id);

      if (classroomError) throw classroomError;
      setClassrooms(classroomData || []);

      // Get AI config if it exists
      if (classroomData && classroomData.length > 0) {
        const { data: configData, error: configError } = await supabase
          .from('ai_config')
          .select('*')
          .eq('classroom_id', classroomData[0].id)
          .single();

        if (configError && configError.code !== 'PGRST116') {
          throw configError;
        }

        if (configData) {
          setConfig(configData);
        } else {
          setConfig(prev => ({ ...prev, classroom_id: classroomData[0].id }));
        }
      }

    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error",
        description: "Failed to load AI configuration.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config.classroom_id) {
      toast({
        title: "Error",
        description: "Please select a classroom.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('ai_config')
        .upsert({
          classroom_id: config.classroom_id,
          active_model: config.active_model,
          max_requests_per_day: config.max_requests_per_day,
          is_enabled: config.is_enabled,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "AI configuration saved successfully!",
      });

    } catch (error) {
      console.error('Failed to save config:', error);
      toast({
        title: "Error",
        description: "Failed to save AI configuration.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <SEO title="AI Configuration" />
        <div className="space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-32 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <SEO title="AI Configuration" />
      
      <div className="flex items-center gap-3">
        <Bot className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">AI Configuration</h1>
          <p className="text-muted-foreground">
            Configure AI settings for your classrooms
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Classroom Selection */}
            <div className="space-y-2">
              <Label htmlFor="classroom">Classroom</Label>
              <Select
                value={config.classroom_id}
                onValueChange={(value) => setConfig(prev => ({ ...prev, classroom_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a classroom" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* AI Model */}
            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <Select
                value={config.active_model}
                onValueChange={(value) => setConfig(prev => ({ ...prev, active_model: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash (Free)</SelectItem>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro (Paid)</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Paid)</SelectItem>
                  <SelectItem value="claude-3-haiku">Claude 3 Haiku (Paid)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Daily Request Limit */}
            <div className="space-y-2">
              <Label htmlFor="maxRequests">Daily Request Limit</Label>
              <Input
                id="maxRequests"
                type="number"
                min="1"
                max="1000"
                value={config.max_requests_per_day}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  max_requests_per_day: parseInt(e.target.value) || 50 
                }))}
              />
              <p className="text-sm text-muted-foreground">
                Maximum AI requests per day for this classroom
              </p>
            </div>

            {/* Enable/Disable */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="enabled">Enable AI Research</Label>
                <p className="text-sm text-muted-foreground">
                  Allow students to use AI research mode
                </p>
              </div>
              <Switch
                id="enabled"
                checked={config.is_enabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, is_enabled: checked }))}
              />
            </div>

            <Button onClick={saveConfig} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Usage Information */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Gemini 1.5 Flash</strong> is recommended for starting out. 
                It's free and provides excellent responses for educational content.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h4 className="font-medium">Model Comparison:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Gemini 1.5 Flash:</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Gemini 1.5 Pro:</span>
                  <span className="text-yellow-600">$0.0025/1k tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>GPT-3.5 Turbo:</span>
                  <span className="text-yellow-600">$0.002/1k tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Claude 3 Haiku:</span>
                  <span className="text-yellow-600">$0.00025/1k tokens</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Estimated Daily Usage:</h4>
              <p className="text-sm text-muted-foreground">
                With {config.max_requests_per_day} requests per day:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• ~{config.max_requests_per_day * 500} tokens per day</li>
                <li>• Cost: $0.00 (Gemini Flash) to ~$0.25 (Pro models)</li>
                <li>• Perfect for classroom research activities</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
