// src/pages/kiosk/StudentTowerNotebook.tsx - NotebookLM-style Tower Interface
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";
import {
  Share2,
  Settings,
  User,
  ArrowLeft,
  Building2,
} from "lucide-react";
import { SourcesPanel, ChatPanel, CreatePanel, GeneratedOutput } from "@/components/tower-notebook";

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
        // Silently handle error
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
