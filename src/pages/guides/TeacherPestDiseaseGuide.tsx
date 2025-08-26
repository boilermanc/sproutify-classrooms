// src/pages/guides/TeacherPestDiseaseGuide.tsx - CORRECTED

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
// FIX: Import the shared modal from its correct, actual location
import { PestIdentificationModal } from "@/components/scouting/PestIdentificationModal"; 
import { 
  BookOpen, Users, TrendingUp, Download, Share2,
  CheckCircle, Bug, ArrowRight
} from "lucide-react";

export default function TeacherPestDiseaseGuide() {
  const [showGuideModal, setShowGuideModal] = useState(false);

  const features = [ /* ... */ ];
  const teachingTips = [ /* ... */ ];

  return (
    <div className="container py-8 space-y-8">
      <SEO title="Pest & Disease Guide - Teacher Resources | Sproutify School" />
      
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Pest & Disease Guide</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Comprehensive educational resources for teaching organic pest identification and management.
        </p>
        <Button onClick={() => setShowGuideModal(true)} size="lg" className="mt-6">
          <Bug className="mr-2 h-5 w-5" />
          Open Interactive Guide
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* ... Other page content (Cards, etc.) ... */}

      <PestIdentificationModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onSelect={() => {
          setShowGuideModal(false);
        }}
        towerLocation="classroom"
      />
    </div>
  );
}