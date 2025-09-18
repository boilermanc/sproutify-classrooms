// src/pages/kiosk/StudentTowerNotebook.tsx - NotebookLM-style Tower Interface
import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Share2,
  Settings,
  User,
  Leaf,
  Activity,
  Wheat,
  Trash2,
  Bug,
  Camera,
  BookOpen,
  HelpCircle,
  Clock,
  Volume2,
  BarChart3,
  Eye,
  ChevronDown,
  Send,
  Pin,
  FileText,
  Play,
  MoreHorizontal,
  Edit,
  ArrowLeft,
  Building2,
  Bot,
  User
} from "lucide-react";

// Types
type TowerData = {
  id: string;
  name: string;
  ports: number;
};

type SourceItem = {
  id: string;
  type: 'plant' | 'vitals' | 'harvest' | 'waste' | 'pest' | 'photo';
  title: string;
  date: string;
  description?: string;
};

type GeneratedOutput = {
  id: string;
  type: 'study-guide' | 'faq' | 'timeline' | 'audio' | 'report' | 'visualization';
  title: string;
  date: string;
  status: 'completed' | 'generating';
};

// Left Panel - Sources Component
function SourcesPanel({ towerId, selectedSources, setSelectedSources }: { 
  towerId: string; 
  selectedSources: string[]; 
  setSelectedSources: (sources: string[]) => void;
}) {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        if (!towerId) return;
        
        const teacherId = localStorage.getItem("teacher_id_for_tower");
        if (!teacherId) return;

        // Fetch sources from individual tables as fallback
        const sources: SourceItem[] = [];

        // Fetch plantings
        const { data: plantings } = await supabase
          .from('plantings')
          .select('id, name, created_at, port_number')
          .eq('tower_id', towerId);

        if (plantings) {
          plantings.forEach(planting => {
            sources.push({
              id: `plant-${planting.id}`,
              type: 'plant',
              title: planting.name,
              date: new Date(planting.created_at).toLocaleDateString(),
              description: planting.port_number ? `Port ${planting.port_number}` : undefined
            });
          });
        }

        // Fetch vitals
        const { data: vitals } = await supabase
          .from('tower_vitals')
          .select('id, ph, ec, created_at')
          .eq('tower_id', towerId);

        if (vitals) {
          vitals.forEach(vital => {
            sources.push({
              id: `vital-${vital.id}`,
              type: 'vitals',
              title: 'pH & EC Reading',
              date: new Date(vital.created_at).toLocaleDateString(),
              description: `pH: ${vital.ph}, EC: ${vital.ec}`
            });
          });
        }

        // Fetch harvests
        const { data: harvests } = await supabase
          .from('harvests')
          .select('id, plant_name, weight_grams, destination, created_at')
          .eq('tower_id', towerId);

        if (harvests) {
          harvests.forEach(harvest => {
            sources.push({
              id: `harvest-${harvest.id}`,
              type: 'harvest',
              title: `${harvest.plant_name || 'Plant'} Harvest`,
              date: new Date(harvest.created_at).toLocaleDateString(),
              description: `${harvest.weight_grams}g${harvest.destination ? ` → ${harvest.destination}` : ''}`
            });
          });
        }

        // Fetch waste logs
        const { data: wasteLogs } = await supabase
          .from('waste_logs')
          .select('id, plant_name, grams, notes, created_at')
          .eq('tower_id', towerId);

        if (wasteLogs) {
          wasteLogs.forEach(waste => {
            sources.push({
              id: `waste-${waste.id}`,
              type: 'waste',
              title: `${waste.plant_name || 'Plant'} Waste`,
              date: new Date(waste.created_at).toLocaleDateString(),
              description: `${waste.grams}g - ${waste.notes || 'No notes'}`
            });
          });
        }

        // Fetch pest logs
        const { data: pestLogs } = await supabase
          .from('pest_logs')
          .select('id, pest, created_at')
          .eq('tower_id', towerId);

        if (pestLogs) {
          pestLogs.forEach(pest => {
            sources.push({
              id: `pest-${pest.id}`,
              type: 'pest',
              title: 'Pest Observation',
              date: new Date(pest.created_at).toLocaleDateString(),
              description: pest.pest.length > 50 ? `${pest.pest.substring(0, 50)}...` : pest.pest
            });
          });
        }

        // Fetch photos
        const { data: photos } = await supabase
          .from('tower_photos')
          .select('id, caption, created_at')
          .eq('tower_id', towerId);

        if (photos) {
          photos.forEach(photo => {
            sources.push({
              id: `photo-${photo.id}`,
              type: 'photo',
              title: 'Tower Photo',
              date: new Date(photo.created_at).toLocaleDateString(),
              description: photo.caption || 'No description'
            });
          });
        }

        // Sort by date (newest first)
        sources.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setSources(sources);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching sources:', err);
        setLoading(false);
      }
    };

    fetchSources();
  }, [towerId]);

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSources.length === sources.length) {
      setSelectedSources([]);
    } else {
      setSelectedSources(sources.map(s => s.id));
    }
  };

  const getSourceIcon = (type: SourceItem['type']) => {
    switch (type) {
      case 'plant': return <Leaf className="h-4 w-4" />;
      case 'vitals': return <Activity className="h-4 w-4" />;
      case 'harvest': return <Wheat className="h-4 w-4" />;
      case 'waste': return <Trash2 className="h-4 w-4" />;
      case 'pest': return <Bug className="h-4 w-4" />;
      case 'photo': return <Camera className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-80 bg-background border-r border-border h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-4">Sources</h2>
        
        <div className="flex gap-2 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link to={`/student/add-plant?towerId=${towerId}`}>
                  <Leaf className="h-4 w-4 mr-2" />
                  Add Plant
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/student/vitals?towerId=${towerId}`}>
                  <Activity className="h-4 w-4 mr-2" />
                  Log Vitals
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/student/harvest?towerId=${towerId}`}>
                  <Wheat className="h-4 w-4 mr-2" />
                  Log Harvest
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/student/waste?towerId=${towerId}`}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Log Waste
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/student/pests?towerId=${towerId}`}>
                  <Bug className="h-4 w-4 mr-2" />
                  Log Pest
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/student/photos?towerId=${towerId}`}>
                  <Camera className="h-4 w-4 mr-2" />
                  Add Photo
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/student/documents?towerId=${towerId}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Add Document
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link to="/student/pest-disease-guide">
              <BookOpen className="h-4 w-4 mr-2" />
              Learning Guide
            </Link>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="select-all"
            checked={selectedSources.length === sources.length && sources.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm font-medium">
            Select all sources
          </label>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-4" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : sources.length > 0 ? (
          <div className="space-y-3">
            {sources.map((source) => (
              <div key={source.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50">
                <Checkbox 
                  checked={selectedSources.includes(source.id)}
                  onCheckedChange={() => handleSourceToggle(source.id)}
                />
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getSourceIcon(source.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{source.title}</p>
                    <p className="text-xs text-muted-foreground">{source.date}</p>
                    {source.description && (
                      <p className="text-xs text-muted-foreground truncate">{source.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Leaf className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No sources yet</p>
            <p className="text-xs text-muted-foreground">Add some data to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Center Panel - Chat Component
function ChatPanel({ towerName, selectedSources }: { towerName: string; selectedSources: string[] }) {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [studentName, setStudentName] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState<string>('3-5');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "How is my tower performing overall?",
    "What should I focus on this week?",
    "Are there any issues I should be aware of?"
  ];

  // Initialize student info
  useEffect(() => {
    const storedStudentName = localStorage.getItem('student_name');
    const storedClassroomId = localStorage.getItem('student_classroom_id');
    
    if (storedStudentName) {
      setStudentName(storedStudentName);
    }

    // Get grade level
    const getGradeLevel = async () => {
      if (storedClassroomId) {
        try {
          const { data: classroom } = await supabase
            .from('classrooms')
            .select('grade_level')
            .eq('id', storedClassroomId)
            .single();
          
          if (classroom?.grade_level) {
            setGradeLevel(classroom.grade_level);
          }
        } catch (error) {
          console.error('Failed to get grade level:', error);
        }
      }
    };
    
    getGradeLevel();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: chatInput,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);

    try {
      // Get tower ID from URL params
      const towerId = window.location.pathname.split('/').pop();
      
      const response = await fetch(`http://127.0.0.1:54321/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`
        },
        body: JSON.stringify({
          message: chatInput,
          towerId: towerId,
          studentName: studentName,
          selectedSources: selectedSources,
          gradeLevel: gradeLevel
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
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

  return (
    <div className="flex-1 bg-background flex flex-col">
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Tower Summary */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Leaf className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{towerName}</h1>
              <p className="text-sm text-muted-foreground">{selectedSources.length} sources</p>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              <em className="text-xs text-muted-foreground">[AI-generated summary will appear here]</em><br/><br/>
              Your tower is currently growing <strong>3 active plants</strong> with 
              <strong> healthy growth patterns</strong>. Recent pH readings show 
              <strong> optimal levels</strong> at 6.2, and EC measurements indicate 
              <strong> good nutrient balance</strong>. No pest issues have been detected 
              in the last week. Your next harvest is scheduled for 
              <strong> February 15th</strong>.
            </p>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm">
              <Pin className="h-4 w-4 mr-2" />
              Save to note
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Add note
          </Button>
        </div>

        {/* Chat Messages */}
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-6 border-t border-border">
        <div className="flex gap-2 mb-3">
          {suggestedQuestions.map((question, index) => (
            <Button 
              key={index} 
              variant="outline" 
              size="sm"
              className="text-xs"
              onClick={() => setChatInput(question)}
            >
              {question}
            </Button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Ask about your tower data..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            size="sm" 
            onClick={sendMessage}
            disabled={isLoading || !chatInput.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Right Panel - Create Component
function CreatePanel({ towerId }: { towerId: string }) {
  const [outputs, setOutputs] = useState<GeneratedOutput[]>([]);

  useEffect(() => {
    // Mock data for generated outputs
    const mockOutputs: GeneratedOutput[] = [
      {
        id: '1',
        type: 'study-guide',
        title: 'Tower Care Basics',
        date: '2d ago',
        status: 'completed'
      },
      {
        id: '2',
        type: 'timeline',
        title: 'Growth Timeline',
        date: '1w ago',
        status: 'completed'
      }
    ];
    setOutputs(mockOutputs);
  }, [towerId]);

  const createButtons = [
    { type: 'study-guide' as const, label: 'Study Guide', icon: BookOpen },
    { type: 'faq' as const, label: 'FAQ', icon: HelpCircle },
    { type: 'timeline' as const, label: 'Timeline', icon: Clock },
    { type: 'audio' as const, label: 'Audio Overview', icon: Volume2 },
    { type: 'report' as const, label: 'Reports', icon: BarChart3 },
    { type: 'visualization' as const, label: 'Visualization', icon: Eye },
  ];

  const getOutputIcon = (type: GeneratedOutput['type']) => {
    switch (type) {
      case 'study-guide': return <BookOpen className="h-4 w-4" />;
      case 'faq': return <HelpCircle className="h-4 w-4" />;
      case 'timeline': return <Clock className="h-4 w-4" />;
      case 'audio': return <Volume2 className="h-4 w-4" />;
      case 'report': return <BarChart3 className="h-4 w-4" />;
      case 'visualization': return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-80 bg-background border-l border-border h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-4">Create</h2>
        
        <div className="grid grid-cols-2 gap-2">
          {createButtons.map((button) => (
            <Button 
              key={button.type}
              variant="outline" 
              size="sm"
              className="h-auto p-3 flex flex-col items-center gap-2"
            >
              <button.icon className="h-4 w-4" />
              <span className="text-xs">{button.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-sm font-medium mb-3">Recent</h3>
        
        {outputs.length > 0 ? (
          <div className="space-y-3">
            {outputs.map((output) => (
              <div key={output.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getOutputIcon(output.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{output.title}</p>
                    <p className="text-xs text-muted-foreground">{output.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {output.status === 'completed' && (
                    <Button variant="ghost" size="sm">
                      <Play className="h-3 w-3" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No outputs yet</p>
            <p className="text-xs text-muted-foreground">Create your first study guide or report</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <Button className="w-full">
          <Edit className="h-4 w-4 mr-2" />
          Add note
        </Button>
      </div>
    </div>
  );
}

// Main Component
export default function StudentTowerNotebook() {
  const { id: towerId } = useParams();
  const [towerName, setTowerName] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTowerName = async () => {
      if (!towerId) return;
      try {
        const { data } = await supabase.from("towers").select("name").eq("id", towerId).single();
        if (data) setTowerName(data.name);
      } catch (error) {
        console.error('Error fetching tower name:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTowerName();
  }, [towerId]);

  if (!towerId) {
    return (
      <div className="container py-8">
        <p className="text-muted-foreground">Error: Missing tower information. Please go back and try again.</p>
        <Button variant="outline" asChild className="mt-4">
          <Link to="/student/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <SEO title={`${towerName || 'Tower'} | Sproutify School`} />
      
      {/* Top Bar */}
      <div className="h-16 border-b border-border bg-background flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/student/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
            <h1 className="text-xl font-semibold">{towerName || "Tower"}</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <SourcesPanel 
          towerId={towerId} 
          selectedSources={selectedSources} 
          setSelectedSources={setSelectedSources} 
        />
        <ChatPanel towerName={towerName} selectedSources={selectedSources} />
        <CreatePanel towerId={towerId} />
      </div>
    </div>
  );
}
