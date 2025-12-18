// src/components/tower-notebook/ChatPanel.tsx
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { anonymousSupabase } from "@/integrations/supabase/anonymous-client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StudentTowerOverview } from "@/components/towers/StudentTowerOverview";
import {
  User,
  Clock,
  Volume2,
  BarChart3,
  Eye,
  Send,
  FileText,
  Play,
  BookOpen,
  HelpCircle,
  Bot,
  X
} from "lucide-react";
import { GeneratedOutput } from "./types";
import { encodeToBase64 } from "./utils";

interface ChatPanelProps {
  towerName: string;
  selectedSources: string[];
  towerId: string;
  selectedOutput?: GeneratedOutput | null;
  setSelectedOutput?: (output: GeneratedOutput | null) => void;
  onNoteSaved?: () => void;
}

export function ChatPanel({
  towerName,
  selectedSources,
  towerId,
  selectedOutput,
  setSelectedOutput,
  onNoteSaved
}: ChatPanelProps) {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Array<{ id: string, role: 'user' | 'assistant', content: string, timestamp: string }>>([]);
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
          // Silently handle error - use default grade level
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
      const currentTowerId = window.location.pathname.split('/').pop();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          message: chatInput,
          towerId: currentTowerId,
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

  const handleSaveToNote = async () => {
    if (messages.length === 0) return;

    const conversationTitle = `Chat Notes - ${new Date().toLocaleDateString()}`;

    const conversationText = messages.map(msg =>
      `${msg.role === 'user' ? 'Student' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');

    try {
      const teacherId = localStorage.getItem('teacher_id_for_tower');

      if (!teacherId) {
        toast({
          title: "Error",
          description: "No teacher ID found. Please refresh and try again.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await anonymousSupabase
        .from('tower_documents')
        .insert({
          tower_id: towerId,
          teacher_id: teacherId,
          title: conversationTitle,
          description: `Chat conversation saved on ${new Date().toLocaleDateString()}`,
          file_name: `${conversationTitle}.txt`,
          file_path: `chat-notes/${Date.now()}-${Math.random().toString(36).substring(2)}.txt`,
          file_url: `data:text/plain;base64,${encodeToBase64(conversationText)}`,
          file_size: conversationText.length,
          file_type: 'text/plain',
          content: conversationText
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to save chat to note. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Chat conversation saved to your documents",
      });

      onNoteSaved?.();

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save chat to note. Please try again.",
        variant: "destructive",
      });
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
                {renderOutputContent(selectedOutput)}
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
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
            >
              <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
                  }`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                <div className={`rounded-lg p-3 ${message.role === 'user'
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

function renderOutputContent(output: GeneratedOutput) {
  switch (output.type) {
    case 'timeline':
      return (
        <div className="space-y-4">
          <h4 className="font-semibold">Growth Timeline</h4>
          {output.content ? (
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">{output.content}</pre>
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
      );

    case 'study-guide':
      if (output.title.includes('Chat Notes') && output.content) {
        return (
          <div className="space-y-4">
            <h4 className="font-semibold">Saved Chat Conversation</h4>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">{output.content}</pre>
            </div>
          </div>
        );
      }
      return (
        <div className="space-y-4">
          <h4 className="font-semibold">Study Guide</h4>
          {output.content ? (
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">{output.content}</pre>
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
      );

    case 'faq':
      return (
        <div className="space-y-4">
          <h4 className="font-semibold">Frequently Asked Questions</h4>
          {output.content ? (
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">{output.content}</pre>
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
      );

    case 'audio':
      return (
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
      );

    case 'report':
      return (
        <div className="space-y-4">
          <h4 className="font-semibold">Progress Report</h4>
          {output.content ? (
            <div className="bg-muted p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">{output.content}</pre>
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
      );

    case 'visualization':
      return (
        <div className="space-y-4">
          <h4 className="font-semibold">Growth Visualization</h4>
          <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Growth chart visualization would appear here</p>
          </div>
        </div>
      );

    default:
      return null;
  }
}
