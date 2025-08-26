// src/pages/guides/TeacherPestDiseaseGuide.tsx - CORRECTED

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
// FIX: Correctly import the shared modal from its actual location
import { PestIdentificationModal } from "@/components/modals/PestIdentificationModal";
import { 
  BookOpen, Users, TrendingUp, Download, Share2,
  CheckCircle, Bug, Leaf, PlayCircle, ArrowRight
} from "lucide-react";

export default function TeacherPestDiseaseGuide() {
  const [showGuideModal, setShowGuideModal] = useState(false);

  const features = [ /* ... feature data ... */ ];
  const teachingTips = [ /* ... teaching tips data ... */ ];

  return (
    <div className="container py-8 space-y-8">
      <SEO title="Pest & Disease Guide - Teacher Resources | Sproutify School" />
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Pest & Disease Guide</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Comprehensive educational resources for teaching organic pest identification and management strategies.
        </p>
        <Button 
          onClick={() => setShowGuideModal(true)} // FIX: This now only opens the modal
          size="lg" 
          className="mt-6"
        >
          <Bug className="mr-2 h-5 w-5" />
          Open Interactive Guide
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* ... The rest of your page layout (Cards, etc.) is unchanged ... */}

      {/* FIX: The modal is now correctly implemented */}
      <PestIdentificationModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onSelect={() => {
          // On this page, selecting an item simply closes the modal.
          setShowGuideModal(false);
        }}
        towerLocation="classroom" // A sensible default
      />
    </div>
  );
}