// src/components/tower-notebook/CreatePanel.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { anonymousSupabase } from "@/integrations/supabase/anonymous-client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  HelpCircle,
  Clock,
  Volume2,
  BarChart3,
  Eye,
  Play,
  MoreHorizontal,
  FileText,
} from "lucide-react";
import { GeneratedOutput } from "./types";
import {
  encodeToBase64,
  getOutputTitle,
  generateTimelineContent,
  generateStudyGuideContent,
  generateFAQContent,
  generateReportContent
} from "./utils";

interface CreatePanelProps {
  towerId: string;
  onOutputSelected?: (output: GeneratedOutput) => void;
  refreshTrigger?: number;
}

export function CreatePanel({ towerId, onOutputSelected, refreshTrigger }: CreatePanelProps) {
  const [outputs, setOutputs] = useState<GeneratedOutput[]>([]);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [selectedOutput, setSelectedOutput] = useState<GeneratedOutput | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOutputs = async () => {
      try {
        if (!towerId) return;

        const { data: documents, error } = await anonymousSupabase
          .from('tower_documents')
          .select('id, title, description, created_at, file_type, content, document_type, milestone_type')
          .eq('tower_id', towerId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          return;
        }

        const documentOutputs: GeneratedOutput[] = documents?.map(doc => {
          let outputType: GeneratedOutput['type'] = 'study-guide';

          if (doc.document_type === 'milestone') {
            outputType = 'report';
          } else if (doc.document_type === 'timeline') {
            outputType = 'timeline';
          } else if (doc.document_type === 'study-guide') {
            outputType = 'study-guide';
          } else if (doc.document_type === 'faq') {
            outputType = 'faq';
          } else if (doc.document_type === 'report') {
            outputType = 'report';
          } else if (doc.document_type === 'generated') {
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

        setOutputs(documentOutputs);
      } catch (error) {
        // Silently handle error
      }
    };

    fetchOutputs();
  }, [towerId, refreshTrigger]);

  const generateSpecificTitle = async (type: GeneratedOutput['type'], towerId: string): Promise<string> => {
    try {
      const { data: towerData } = await supabase
        .from('towers')
        .select('name')
        .eq('id', towerId)
        .single();

      const towerName = towerData?.name || 'Tower';

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
      return getOutputTitle(type);
    }
  };

  const handleCreateOutput = async (type: GeneratedOutput['type']) => {
    setIsGenerating(type);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const title = await generateSpecificTitle(type, towerId);

      const teacherId = localStorage.getItem('teacher_id_for_tower');

      if (!teacherId) {
        toast({
          title: "Error",
          description: "No teacher ID found. Please refresh and try again.",
          variant: "destructive",
        });
        return;
      }

      let content = '';
      let documentType = 'generated';

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

      const { data: savedDoc, error } = await anonymousSupabase
        .from('tower_documents')
        .insert(documentData)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: `Failed to save ${type}: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      const newOutput: GeneratedOutput = {
        id: savedDoc.id,
        type: type,
        title: title,
        date: 'Just now',
        status: 'completed',
        content: content,
        documentType: documentType
      };

      setOutputs(prev => [newOutput, ...prev]);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create output. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(null);
    }
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
                className={`flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors ${selectedOutput?.id === output.id ? 'bg-muted/50 border-primary' : ''
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
