// src/pages/kiosk/StudentKioskAI.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { SEO } from '@/components/SEO';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  BookOpen,
  Calendar,
  Droplets,
  Camera,
  Bug,
  Trash2,
  Wheat
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sourcesUsed?: number;
}

interface TowerSource {
  id: string;
  type: 'vital' | 'planting' | 'harvest' | 'photo' | 'pest' | 'waste';
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
}

export default function StudentKioskAI() {
  const { id: towerId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [towerData, setTowerData] = useState<any>(null);
  const [sources, setSources] = useState<TowerSource[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [studentName, setStudentName] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState<string>('3-5');
  const [isInitialized, setIsInitialized] = useState(false);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize component
  useEffect(() => {
    initializeComponent();
  }, [towerId]);

  const initializeComponent = async () => {
    try {
      // Get student info from localStorage
      const storedStudentName = localStorage.getItem('student_name');
      const storedClassroomId = localStorage.getItem('student_classroom_id');
      
      if (!storedStudentName || !storedClassroomId) {
        toast({
          title: "Access Denied",
          description: "Please log in as a student to access AI research.",
          variant: "destructive"
        });
        navigate('/student/dashboard');
        return;
      }

      setStudentName(storedStudentName);

      // Get classroom grade level
      const { data: classroom } = await supabase
        .from('classrooms')
        .select('grade_level')
        .eq('id', storedClassroomId)
        .single();

      if (classroom?.grade_level) {
        setGradeLevel(classroom.grade_level);
      }

      // Load tower data and sources
      await loadTowerData();
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize:', error);
      toast({
        title: "Error",
        description: "Failed to load tower data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const loadTowerData = async () => {
    if (!towerId) return;

    try {
      // Get tower resources using existing function
      const { data: towerResources, error } = await supabase
        .rpc('get_tower_resources', { p_tower_id: towerId });

      if (error) {
        throw error;
      }

      setTowerData(towerResources);

      // Build sources array
      const sourcesList: TowerSource[] = [];

      // Add vitals
      towerResources.tower_vitals?.forEach((vital: any) => {
        sourcesList.push({
          id: `vital-${vital.id}`,
          type: 'vital',
          title: `pH: ${vital.ph || 'N/A'}, EC: ${vital.ec || 'N/A'}`,
          description: `Recorded on ${new Date(vital.recorded_at).toLocaleDateString()}`,
          date: vital.recorded_at,
          icon: <Droplets className="h-4 w-4" />
        });
      });

      // Add plantings
      towerResources.plantings?.forEach((planting: any) => {
        sourcesList.push({
          id: `planting-${planting.id}`,
          type: 'planting',
          title: planting.name,
          description: `Planted on ${new Date(planting.planted_at).toLocaleDateString()}`,
          date: planting.planted_at,
          icon: <Wheat className="h-4 w-4" />
        });
      });

      // Add harvests
      towerResources.harvests?.forEach((harvest: any) => {
        sourcesList.push({
          id: `harvest-${harvest.id}`,
          type: 'harvest',
          title: `${harvest.plant_name} - ${harvest.weight_grams}g`,
          description: `Harvested on ${new Date(harvest.harvested_at).toLocaleDateString()}`,
          date: harvest.harvested_at,
          icon: <CheckCircle2 className="h-4 w-4" />
        });
      });

      // Add photos
      towerResources.tower_photos?.forEach((photo: any) => {
        sourcesList.push({
          id: `photo-${photo.id}`,
          type: 'photo',
          title: photo.caption || 'Tower Photo',
          description: `Taken by ${photo.student_name} on ${new Date(photo.taken_at).toLocaleDateString()}`,
          date: photo.taken_at,
          icon: <Camera className="h-4 w-4" />
        });
      });

      // Add pest logs
      towerResources.pest_logs?.forEach((pest: any) => {
        sourcesList.push({
          id: `pest-${pest.id}`,
          type: 'pest',
          title: pest.pest,
          description: `Observed on ${new Date(pest.observed_at).toLocaleDateString()}`,
          date: pest.observed_at,
          icon: <Bug className="h-4 w-4" />
        });
      });

      // Add waste logs
      towerResources.waste_logs?.forEach((waste: any) => {
        sourcesList.push({
          id: `waste-${waste.id}`,
          type: 'waste',
          title: `${waste.grams}g waste`,
          description: `Logged on ${new Date(waste.logged_at).toLocaleDateString()}`,
          date: waste.logged_at,
          icon: <Trash2 className="h-4 w-4" />
        });
      });

      // Sort by date (newest first)
      sourcesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setSources(sourcesList);

      // Auto-select recent sources (last 10)
      setSelectedSources(sourcesList.slice(0, 10).map(s => s.id));

    } catch (error) {
      console.error('Failed to load tower data:', error);
      throw error;
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !towerId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          message: inputMessage,
          towerId,
          studentName,
          selectedSources,
          gradeLevel
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        sourcesUsed: data.context?.sourcesUsed || 0
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  if (!isInitialized) {
    return (
      <div className="container py-8 space-y-6">
        <SEO title="AI Research Assistant" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <SEO title="AI Research Assistant" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Research Assistant</h1>
          <p className="text-muted-foreground">
            Ask questions about your tower: {towerData?.tower_name || 'Loading...'}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate(`/student/tower/${towerId}`)}
        >
          Back to Tower
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sources Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Select which data to include in your research:
              </p>
              
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {sources.map((source) => (
                    <div
                      key={source.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSources.includes(source.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleSource(source.id)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          {source.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {source.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {source.description}
                          </p>
                        </div>
                        {selectedSources.includes(source.id) && (
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="text-xs text-muted-foreground">
                {selectedSources.length} of {sources.length} sources selected
              </div>
            </CardContent>
          </Card>

          {/* Quick Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "What's the health of my plants?",
                "When should I harvest?",
                "Are there any problems I should watch for?",
                "What can I learn from my data?"
              ].map((question) => (
                <Button
                  key={question}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-2"
                  onClick={() => setInputMessage(question)}
                >
                  {question}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Research Chat
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Ask me anything about your tower data!</p>
                      <p className="text-sm">I can help you understand patterns, predict harvests, and learn about hydroponics.</p>
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className={`flex gap-3 max-w-[80%] ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        
                        <div className={`rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          {message.sourcesUsed && (
                            <p className="text-xs opacity-70 mt-2">
                              Used {message.sourcesUsed} data sources
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <Separator />
              
              {/* Input */}
              <div className="p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your tower data..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={isLoading || !inputMessage.trim()}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {selectedSources.length === 0 && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Select some data sources to get better answers!
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
