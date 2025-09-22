// src/pages/kiosk/StudentTowerNotebook.tsx - NotebookLM-style Tower Interface
import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { anonymousSupabase } from "@/integrations/supabase/anonymous-client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import { StudentTowerOverview } from "@/components/towers/StudentTowerOverview";
import { SourceDetailModal } from "@/components/modals/SourceDetailModal";
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
  FileText,
  Play,
  MoreHorizontal,
  Edit,
  ArrowLeft,
  Building2,
  Bot,
  X
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
  content?: string;
  documentType?: string;
  milestoneType?: string;
};

// Left Panel - Sources Component
function SourcesPanel({ towerId, selectedSources, setSelectedSources }: { 
  towerId: string; 
  selectedSources: string[]; 
  setSelectedSources: (sources: string[]) => void;
}) {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('');

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
        
        // Auto-select all sources by default so AI has access to all data
        setSelectedSources(sources.map(s => s.id));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching sources:', err);
        setLoading(false);
      }
    };

    fetchSources();
  }, [towerId]);

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

  const handleSourceClick = (source: SourceItem) => {
    setSelectedSourceId(source.id);
    setSelectedSourceType(source.type);
    setShowDetailModal(true);
  };

  return (
    <div className="w-80 min-w-80 bg-background border-r border-border h-full flex flex-col">
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
                <Link to={`/student/pest-disease?towerId=${towerId}`}>
                  <Bug className="h-4 w-4 mr-2" />
                  Pest and Disease
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
            onCheckedChange={(checked) => {
              if (checked) {
                setSelectedSources(sources.map(s => s.id));
              } else {
                setSelectedSources([]);
              }
            }}
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
              <div key={source.id} className={`flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 group ${selectedSources.includes(source.id) ? 'bg-green-50' : ''}`}>
                <Checkbox 
                  checked={selectedSources.includes(source.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedSources(prev => [...prev, source.id]);
                    } else {
                      setSelectedSources(prev => prev.filter(id => id !== source.id));
                    }
                  }}
                />
                <div 
                  className="flex items-center space-x-2 flex-1 min-w-0 cursor-pointer hover:bg-muted/30 rounded p-1 -m-1"
                  onClick={() => handleSourceClick(source)}
                >
                  {getSourceIcon(source.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{source.title}</p>
                      <Eye className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-muted-foreground">{source.date}</p>
                    {source.description && (
                      <p className="text-xs text-muted-foreground truncate">{source.description}</p>
                    )}
                  </div>
                </div>
                {source.type === 'photo' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to tower detail photos tab
                      window.open(`/app/towers/${towerId}?tab=photos`, '_blank');
                    }}
                  >
                    <Camera className="h-3 w-3 mr-1" />
                    Gallery
                  </Button>
                )}
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
      
      {/* Source Detail Modal */}
      <SourceDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        sourceId={selectedSourceId}
        sourceType={selectedSourceType}
        towerId={towerId}
      />
    </div>
  );
}

// Center Panel - Chat Component
function ChatPanel({ towerName, selectedSources, towerId, selectedOutput, setSelectedOutput, onNoteSaved }: { 
  towerName: string; 
  selectedSources: string[]; 
  towerId: string;
  selectedOutput?: GeneratedOutput | null;
  setSelectedOutput?: (output: GeneratedOutput | null) => void;
  onNoteSaved?: () => void;
}) {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string, timestamp: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [studentName, setStudentName] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState<string>('3-5');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
      
      const response = await fetch(`https://cqrjesmpwaqvmssrdeoc.supabase.co/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcmplc21wd2Fxdm1zc3JkZW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NzUzNjAsImV4cCI6MjA3MDI1MTM2MH0.7dtJ6VOK_i_enstTjvzDuRAyUACNc78dlCldHjsxt58`
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

  // Unicode-safe base64 encoding function
  const encodeToBase64 = (str: string): string => {
    try {
      // First encode to UTF-8 bytes, then to base64
      return btoa(unescape(encodeURIComponent(str)));
    } catch (error) {
      console.error('Error encoding to base64:', error);
      // Fallback: encode each character individually
      return btoa(str.split('').map(char => {
        const code = char.charCodeAt(0);
        return code > 255 ? '?' : char;
      }).join(''));
    }
  };

  const handleSaveToNote = async () => {
    if (messages.length === 0) return;

    // Create a document name based on the conversation
    const conversationTitle = `Chat Notes - ${new Date().toLocaleDateString()}`;
    
    // Combine all messages into a single text
    const conversationText = messages.map(msg => 
      `${msg.role === 'user' ? 'Student' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');

    try {
      // Get teacher ID from localStorage
      const teacherId = localStorage.getItem('teacher_id_for_tower');
      
      if (!teacherId) {
        toast({
          title: "Error",
          description: "No teacher ID found. Please refresh and try again.",
          variant: "destructive",
        });
        return;
      }

      // Create a new document in the tower_documents table using anonymous client
      const { error } = await anonymousSupabase
        .from('tower_documents')
        .insert({
          tower_id: towerId,
          teacher_id: teacherId,
          title: conversationTitle,
          description: `Chat conversation saved on ${new Date().toLocaleDateString()}`,
          file_name: `${conversationTitle}.txt`,
          file_path: `chat-notes/${Date.now()}-${Math.random().toString(36).substring(2)}.txt`,
          file_url: `data:text/plain;base64,${encodeToBase64(conversationText)}`, // Store content as data URL
          file_size: conversationText.length,
          file_type: 'text/plain',
          content: conversationText // Store the actual conversation content
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to save chat to note. Please try again.",
          variant: "destructive",
        });
        console.error('Error saving chat to note:', error);
        return;
      }

      // Show success feedback
      toast({
        title: "Success",
        description: "Chat conversation saved to your documents",
      });
      
      // Trigger refresh of the Recent list
      onNoteSaved?.();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save chat to note. Please try again.",
        variant: "destructive",
      });
      console.error('Failed to save chat to note:', error);
    }
  };

  return (
    <div className="flex-1 bg-background flex flex-col min-w-0">
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Tower Dashboard */}
        <div className="mb-6">
          <StudentTowerOverview towerId={towerId} />

        </div>

        {/* Selected Output Display */}
        {selectedOutput && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedOutput.type === 'timeline' && <Clock className="h-5 w-5 text-blue-600" />}
                    {selectedOutput.type === 'study-guide' && <BookOpen className="h-5 w-5 text-green-600" />}
                    {selectedOutput.type === 'faq' && <HelpCircle className="h-5 w-5 text-purple-600" />}
                    {selectedOutput.type === 'audio' && <Volume2 className="h-5 w-5 text-orange-600" />}
                    {selectedOutput.type === 'report' && <BarChart3 className="h-5 w-5 text-red-600" />}
                    {selectedOutput.type === 'visualization' && <Eye className="h-5 w-5 text-indigo-600" />}
                    <div>
                      <CardTitle className="text-lg">{selectedOutput.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">Created {selectedOutput.date}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedOutput?.(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedOutput.type === 'timeline' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Growth Timeline</h4>
                    {selectedOutput.content ? (
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm font-mono">{selectedOutput.content}</pre>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Week 1-2: Germination</p>
                            <p className="text-sm text-muted-foreground">Seeds sprout and develop first leaves</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Week 3-4: Vegetative Growth</p>
                            <p className="text-sm text-muted-foreground">Rapid leaf development and stem growth</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Week 5-6: Flowering</p>
                            <p className="text-sm text-muted-foreground">First flowers appear and pollination begins</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Week 7-8: Harvest Ready</p>
                            <p className="text-sm text-muted-foreground">Fruits mature and ready for harvest</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {selectedOutput.type === 'study-guide' && selectedOutput.title.includes('Chat Notes') && selectedOutput.content && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Saved Chat Conversation</h4>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm font-mono">{selectedOutput.content}</pre>
                    </div>
                  </div>
                )}
                {selectedOutput.type === 'study-guide' && !selectedOutput.title.includes('Chat Notes') && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Study Guide</h4>
                    {selectedOutput.content ? (
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm font-mono">{selectedOutput.content}</pre>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <h5>Tower Care Basics</h5>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Check pH levels daily (optimal range: 5.5-6.5)</li>
                          <li>Monitor EC levels weekly (1.2-2.0 mS/cm)</li>
                          <li>Ensure adequate lighting (14-16 hours daily)</li>
                          <li>Maintain proper water circulation</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {selectedOutput.type === 'faq' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Frequently Asked Questions</h4>
                    {selectedOutput.content ? (
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm font-mono">{selectedOutput.content}</pre>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium">Q: How often should I check the pH?</p>
                          <p className="text-sm text-muted-foreground">A: Check pH levels daily for optimal plant health.</p>
                        </div>
                        <div>
                          <p className="font-medium">Q: What's the ideal temperature?</p>
                          <p className="text-sm text-muted-foreground">A: Maintain 65-75°F (18-24°C) for best growth.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {selectedOutput.type === 'audio' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Audio Overview</h4>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Button size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Play Audio
                      </Button>
                      <span className="text-sm text-muted-foreground">Duration: 3:45</span>
                    </div>
                  </div>
                )}
                {selectedOutput.type === 'report' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Progress Report</h4>
                    {selectedOutput.content ? (
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm font-mono">{selectedOutput.content}</pre>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="font-medium text-green-800">Growth Rate</p>
                          <p className="text-2xl font-bold text-green-600">+15%</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="font-medium text-blue-800">Health Score</p>
                          <p className="text-2xl font-bold text-blue-600">92%</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {selectedOutput.type === 'visualization' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Growth Visualization</h4>
                    <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Growth chart visualization would appear here</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        {messages.length > 0 && (
          <div className="flex gap-3 mb-6">
            <Button variant="outline" onClick={handleSaveToNote}>
              <FileText className="h-4 w-4 mr-2" />
              Save Chat
            </Button>
          </div>
        )}

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
function CreatePanel({ towerId, onOutputSelected, refreshTrigger }: { 
  towerId: string; 
  onOutputSelected?: (output: GeneratedOutput) => void;
  refreshTrigger?: number;
}) {
  const [outputs, setOutputs] = useState<GeneratedOutput[]>([]);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [selectedOutput, setSelectedOutput] = useState<GeneratedOutput | null>(null);

  useEffect(() => {
    const fetchOutputs = async () => {
      try {
        if (!towerId) return;
        
        // Fetch documents from tower_documents table using anonymous client
        // RLS policy allows anonymous users (students) to view tower documents
        const { data: documents, error } = await anonymousSupabase
          .from('tower_documents')
          .select('id, title, description, created_at, file_type, content, document_type, milestone_type')
          .eq('tower_id', towerId)
          .order('created_at', { ascending: false })
          .limit(10);

        console.log('Debug - Tower ID:', towerId);
        console.log('Debug - Documents found:', documents);
        console.log('Debug - Error:', error);
        console.log('Debug - Documents length:', documents?.length || 0);
        
        // Also check if there are any documents at all in the table
        const { data: allDocs, error: allDocsError } = await anonymousSupabase
          .from('tower_documents')
          .select('id, title, tower_id, created_at')
          .limit(5);
        console.log('Debug - All documents in table:', allDocs);
        console.log('Debug - All docs error:', allDocsError);

        if (error) {
          console.error('Error fetching documents:', error);
          return;
        }

        // Transform documents to GeneratedOutput format
        const documentOutputs: GeneratedOutput[] = documents?.map(doc => {
          // Determine the type based on document_type field
          let outputType: GeneratedOutput['type'] = 'study-guide';
          
          if (doc.document_type === 'milestone') {
            // Milestones should show as documents, not study guides
            outputType = 'report'; // Use report type for milestones to show document icon
          } else if (doc.document_type === 'timeline') {
            outputType = 'timeline';
          } else if (doc.document_type === 'study-guide') {
            outputType = 'study-guide';
          } else if (doc.document_type === 'faq') {
            outputType = 'faq';
          } else if (doc.document_type === 'report') {
            outputType = 'report';
          } else if (doc.document_type === 'generated') {
            // Fallback to title-based detection for 'generated' type
            if (doc.title.toLowerCase().includes('timeline')) {
              outputType = 'timeline';
            } else if (doc.title.toLowerCase().includes('study guide') || doc.title.toLowerCase().includes('care guide')) {
              outputType = 'study-guide';
            } else if (doc.title.toLowerCase().includes('faq')) {
              outputType = 'faq';
            } else if (doc.title.toLowerCase().includes('report')) {
              outputType = 'report';
            }
          } else if (doc.file_type === 'text/plain' && doc.title.includes('Chat Notes')) {
            outputType = 'study-guide';
          }

          return {
            id: doc.id,
            type: outputType,
            title: doc.title,
            date: new Date(doc.created_at).toLocaleDateString(),
            status: 'completed' as const,
            content: doc.content,
            documentType: doc.document_type,
            milestoneType: doc.milestone_type
          };
        }) || [];

        console.log('Debug - Transformed outputs:', documentOutputs);
        setOutputs(documentOutputs);
      } catch (error) {
        console.error('Error fetching outputs:', error);
      }
    };

    fetchOutputs();
  }, [towerId, refreshTrigger]);

  const handleCreateOutput = async (type: GeneratedOutput['type']) => {
    console.log('handleCreateOutput called with type:', type);
    setIsGenerating(type);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate more specific titles based on tower data
      const title = await generateSpecificTitle(type, towerId);
      
      // Get teacher ID from localStorage
      const teacherId = localStorage.getItem('teacher_id_for_tower');
      
      if (!teacherId) {
        console.error('No teacher ID found for saving document');
        return;
      }

      // Generate content based on type
      let content = '';
      let documentType = 'generated'; // Use 'generated' as default
      
      switch (type) {
        case 'timeline':
          content = generateTimelineContent(title);
          documentType = 'timeline';
          break;
        case 'study-guide':
          content = generateStudyGuideContent(title);
          documentType = 'study-guide';
          break;
        case 'faq':
          content = generateFAQContent(title);
          documentType = 'faq';
          break;
        case 'report':
          content = generateReportContent(title);
          documentType = 'report';
          break;
        default:
          content = `Generated ${type} content for ${title}`;
      }

      // Prepare the document data
      const documentData = {
        tower_id: towerId,
        teacher_id: teacherId,
        title: title,
        description: `Generated ${type} document`,
        document_type: documentType,
        content: content,
        file_name: `${title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`,
        file_path: `generated/${Date.now()}-${Math.random().toString(36).substring(2)}.txt`,
        file_url: `data:text/plain;base64,${encodeToBase64(content)}`,
        file_size: content.length,
        file_type: 'text/plain'
      };

      console.log('Attempting to insert document with data:', documentData);

      // Save to database using anonymous client (consistent with other student operations)
      const { data: savedDoc, error } = await anonymousSupabase
        .from('tower_documents')
        .insert(documentData)
        .select()
        .single();

      if (error) {
        console.error('Error saving document to database:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast({
          title: "Error",
          description: `Failed to save ${type}: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Document saved successfully:', savedDoc);
      
      // Create new output with database ID
      const newOutput: GeneratedOutput = {
        id: savedDoc.id,
        type: type,
        title: title,
        date: 'Just now',
        status: 'completed',
        content: content,
        documentType: documentType
      };
      
      // Add to outputs list
      setOutputs(prev => [newOutput, ...prev]);
      
    } catch (error) {
      console.error('Error creating output:', error);
    } finally {
      setIsGenerating(null);
    }
  };

  const generateSpecificTitle = async (type: GeneratedOutput['type'], towerId: string): Promise<string> => {
    try {
      // Fetch tower data to make titles more specific
      const { data: towerData } = await supabase
        .from('towers')
        .select('name')
        .eq('id', towerId)
        .single();

      const towerName = towerData?.name || 'Tower';

      // Fetch recent plantings to make timeline more specific
      const { data: plantings } = await supabase
        .from('plantings')
        .select('name, created_at')
        .eq('tower_id', towerId)
        .order('created_at', { ascending: false })
        .limit(3);

      const plantNames = plantings?.map(p => p.name).join(', ') || 'plants';

      switch (type) {
        case 'timeline':
          return `${towerName} Growth Timeline - ${plantNames}`;
        case 'study-guide':
          return `${towerName} Care Guide - ${plantNames}`;
        case 'faq':
          return `${towerName} FAQ - ${plantNames}`;
        case 'audio':
          return `${towerName} Audio Overview - ${plantNames}`;
        case 'report':
          return `${towerName} Progress Report - ${plantNames}`;
        case 'visualization':
          return `${towerName} Growth Visualization - ${plantNames}`;
        default:
          return `${towerName} Generated Content`;
      }
    } catch (error) {
      console.error('Error generating specific title:', error);
      return getOutputTitle(type);
    }
  };

  const getOutputTitle = (type: GeneratedOutput['type']): string => {
    switch (type) {
      case 'study-guide': return 'Study Guide';
      case 'faq': return 'FAQ';
      case 'timeline': return 'Growth Timeline';
      case 'audio': return 'Audio Overview';
      case 'report': return 'Report';
      case 'visualization': return 'Visualization';
      default: return 'Generated Content';
    }
  };

  const generateTimelineContent = (title: string): string => {
    return `# ${title}

## Growth Timeline Overview

### Week 1-2: Germination Phase
- Seeds sprout and develop first leaves
- Root system begins to establish
- Monitor moisture levels carefully
- Expected growth: 1-2 inches

### Week 3-4: Vegetative Growth
- Rapid leaf development and stem growth
- Plants establish strong root systems
- Monitor pH levels (5.5-6.5 optimal)
- Expected growth: 3-6 inches

### Week 5-6: Flowering Phase
- First flowers appear
- Pollination begins
- Monitor nutrient levels closely
- Expected growth: 6-12 inches

### Week 7-8: Harvest Ready
- Fruits mature and ready for harvest
- Monitor for optimal ripeness
- Prepare for harvest timing
- Expected growth: 12+ inches

## Key Monitoring Points
- Daily pH checks
- Weekly EC monitoring
- Visual inspection for pests
- Growth rate tracking
- Harvest timing optimization

## Success Indicators
- Healthy green foliage
- Strong root development
- Consistent growth rate
- No pest or disease issues
- Optimal harvest timing`;
  };

  const generateStudyGuideContent = (title: string): string => {
    return `# ${title}

## Tower Care Basics

### Essential Daily Tasks
1. **pH Monitoring**
   - Check pH levels daily
   - Optimal range: 5.5-6.5
   - Adjust with pH up/down solutions

2. **Visual Inspection**
   - Look for pest damage
   - Check plant health
   - Monitor growth progress

### Weekly Maintenance
1. **EC Level Testing**
   - Measure electrical conductivity
   - Optimal range: 1.2-2.0 mS/cm
   - Adjust nutrient concentration

2. **System Cleaning**
   - Clean growing medium
   - Check water circulation
   - Inspect pump function

### Monthly Tasks
1. **Deep System Clean**
   - Complete system flush
   - Replace growing medium
   - Sanitize all components

2. **Plant Rotation**
   - Plan next crop cycle
   - Order seeds/plants
   - Prepare growing schedule

## Troubleshooting Guide
- **Yellow leaves**: Check nutrient levels
- **Slow growth**: Verify pH and EC
- **Pest issues**: Implement IPM strategies
- **Root problems**: Check water quality`;
  };

  const generateFAQContent = (title: string): string => {
    return `# ${title}

## Frequently Asked Questions

### General Tower Care
**Q: How often should I check the pH?**
A: Check pH levels daily for optimal plant health. The ideal range is 5.5-6.5.

**Q: What's the ideal temperature for my tower?**
A: Maintain 65-75°F (18-24°C) for best growth results.

**Q: How much light do my plants need?**
A: Provide 14-16 hours of light daily for optimal growth.

### Nutrient Management
**Q: When should I change the nutrient solution?**
A: Change every 2-3 weeks or when EC levels drop significantly.

**Q: What EC level should I maintain?**
A: Keep EC between 1.2-2.0 mS/cm for most plants.

**Q: How do I know if my plants need more nutrients?**
A: Look for yellowing leaves, slow growth, or weak stems.

### Plant Health
**Q: What should I do if I see pests?**
A: Identify the pest type and implement appropriate IPM strategies.

**Q: How can I prevent diseases?**
A: Maintain clean systems, proper air circulation, and avoid overwatering.

**Q: When is the best time to harvest?**
A: Harvest when fruits are fully mature and at peak ripeness.`;
  };

  const generateReportContent = (title: string): string => {
    return `# ${title}

## Tower Performance Report

### Growth Metrics
- **Average Growth Rate**: +15% week over week
- **Plant Health Score**: 92%
- **Harvest Efficiency**: 85%
- **System Uptime**: 98%

### Key Achievements
- Consistent pH maintenance
- Zero pest outbreaks
- Optimal harvest timing
- Efficient nutrient usage

### Areas for Improvement
- Increase harvest frequency
- Optimize nutrient timing
- Enhance growth monitoring
- Improve yield consistency

### Recommendations
1. Continue current pH management
2. Increase monitoring frequency
3. Consider plant variety expansion
4. Implement advanced tracking

### Next Steps
- Plan next crop cycle
- Review growth data trends
- Optimize system settings
- Prepare for scaling up`;
  };

  const createButtons = [
    { type: 'study-guide' as const, label: 'Study Guide', icon: BookOpen },
    { type: 'faq' as const, label: 'FAQ', icon: HelpCircle },
    { type: 'timeline' as const, label: 'Timeline', icon: Clock },
    { type: 'audio' as const, label: 'Audio Overview', icon: Volume2 },
    { type: 'report' as const, label: 'Reports', icon: BarChart3 },
    { type: 'visualization' as const, label: 'Visualization', icon: Eye },
  ];

  const handleOutputClick = (output: GeneratedOutput) => {
    setSelectedOutput(output);
    onOutputSelected?.(output);
  };

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
    <div className="w-80 min-w-80 bg-background border-l border-border h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-4">Create</h2>
        
        <div className="grid grid-cols-2 gap-2">
          {createButtons.map((button) => (
            <Button 
              key={button.type}
              variant="outline" 
              size="sm"
              className="h-auto p-3 flex flex-col items-center gap-2"
              onClick={() => handleCreateOutput(button.type)}
              disabled={isGenerating === button.type}
            >
              {isGenerating === button.type ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <button.icon className="h-4 w-4" />
              )}
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
              <div 
                key={output.id} 
                className={`flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                  selectedOutput?.id === output.id ? 'bg-muted/50 border-primary' : ''
                }`}
                onClick={() => handleOutputClick(output)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getOutputIcon(output.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{output.title}</p>
                    <p className="text-xs text-muted-foreground">{output.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {output.status === 'completed' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOutputClick(output);
                      }}
                    >
                      {/* Show document icon for milestones and reports, play button for others */}
                      {output.type === 'report' || output.documentType === 'milestone' ? (
                        <FileText className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('More options for:', output.title);
                    }}
                  >
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

    </div>
  );
}

// Main Component
export default function StudentTowerNotebook() {
  const { id: towerId } = useParams();
  const [towerName, setTowerName] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutput, setSelectedOutput] = useState<GeneratedOutput | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      <div className="flex-1 flex overflow-hidden min-w-0">
        <SourcesPanel 
          towerId={towerId} 
          selectedSources={selectedSources} 
          setSelectedSources={setSelectedSources} 
        />
        <ChatPanel 
          towerName={towerName} 
          selectedSources={selectedSources} 
          towerId={towerId} 
          selectedOutput={selectedOutput}
          setSelectedOutput={setSelectedOutput}
          onNoteSaved={() => setRefreshTrigger(prev => prev + 1)}
        />
        <CreatePanel 
          towerId={towerId} 
          onOutputSelected={setSelectedOutput}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  );
}
