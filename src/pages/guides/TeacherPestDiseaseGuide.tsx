// src/pages/guides/TeacherPestDiseaseGuide.tsx

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { PestIdentificationModal } from "@/components/scouting/PestIdentificationModal";
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Download, 
  Share2,
  CheckCircle,
  Bug,
  Leaf,
  PlayCircle,
  ArrowRight
} from "lucide-react";

// Mock pest catalog data for now - in real app this would come from database
const mockPestCatalog = [
  {
    id: '1',
    name: 'Spider Mites',
    scientific_name: 'Tetranychidae',
    type: 'insect' as const,
    description: 'Microscopic arachnids that feed by piercing leaves and sucking out cell contents.',
    appearance_details: 'Very small, difficult to see with naked eye. Fine webbing on leaves is telltale sign.',
    identification_tips: ['Fine silky webbing', 'Stippling on leaves', 'Reddish-brown coloration'],
    symptoms: ['Yellow/white spots on leaves', 'Bronzing appearance', 'Fine webbing'],
    damage_caused: ['Stippling on leaf surfaces', 'Bronzing appearance', 'Plant death if untreated'],
    omri_remedies: ['Insecticidal soap', 'Neem oil', 'Rosemary oil', 'Beneficial predatory mites'],
    management_strategies: ['Water spray', 'Increase humidity', 'Apply treatments during cool periods'],
    prevention_methods: ['Maintain humidity', 'Regular inspection', 'Quarantine new plants'],
    severity_levels: [
      { level: 1, description: "Light stippling", color: "yellow", action: "Monitor closely" },
      { level: 2, description: "Moderate damage", color: "orange", action: "Apply treatment" },
      { level: 3, description: "Heavy infestation", color: "red", action: "Multiple treatments" }
    ],
    treatment_options: [],
    prevention_tips: ['Regular inspection', 'Maintain humidity', 'Encourage beneficial insects'],
    video_url: 'https://cqrjesmpwaqvmssrdeoc.supabase.co/storage/v1/object/public/pest-videos/spider-mites-identification-management.mp4'
  }
];

export default function TeacherPestDiseaseGuide() {
  const [showGuideModal, setShowGuideModal] = useState(false);

  const features = [
    {
      icon: BookOpen,
      title: "Interactive Educational Guide",
      description: "Comprehensive identification guide with OMRI-approved organic solutions and detailed management strategies"
    },
    {
      icon: Users,
      title: "Student Learning Tool",
      description: "Students can access the same guide for independent learning and pest identification practice"
    },
    {
      icon: PlayCircle,
      title: "Video Integration",
      description: "Educational MP4 videos demonstrate identification techniques and treatment applications"
    },
    {
      icon: TrendingUp,
      title: "Data Quality Enhancement",
      description: "Structured identification improves consistency and educational value of pest logging"
    }
  ];

  const teachingTips = [
    {
      title: "Pre-Activity Setup",
      tips: [
        "Review the pest guide with students before tower observations",
        "Explain the difference between beneficial and harmful insects",
        "Demonstrate proper observation techniques with magnifying glasses",
        "Set expectations for detailed scientific descriptions"
      ]
    },
    {
      title: "During Observations",
      tips: [
        "Encourage students to use magnifying glasses or phone cameras for close inspection",
        "Have students work in pairs for collaborative identification and verification",
        "Guide students to look for key identifying features outlined in the guide",
        "Remind students to check multiple areas and plant types in the tower"
      ]
    },
    {
      title: "Post-Activity Learning",
      tips: [
        "Review student submissions and discuss findings as a class",
        "Compare different organic pest management strategies and their effectiveness",
        "Discuss the role of beneficial insects and integrated pest management",
        "Track pest trends over time and discuss seasonal patterns and prevention"
      ]
    }
  ];

  return (
    <div className="container py-8 space-y-8">
      <SEO title="Pest & Disease Guide - Teacher Resources | Sproutify School" />
      
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Pest & Disease Guide</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Comprehensive educational resources for teaching organic pest identification, disease management, and integrated pest management strategies
        </p>
        <Button 
          onClick={() => setShowGuideModal(true)}
          size="lg" 
          className="mt-6"
        >
          <Bug className="mr-2 h-5 w-5" />
          Open Interactive Guide
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Quick Stats/Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Teaching Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teaching Tips & Classroom Integration
          </CardTitle>
          <CardDescription>
            How to effectively use the pest and disease guide in your classroom
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {teachingTips.map((section, index) => (
              <div key={index}>
                <h3 className="font-medium mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Downloadable Resources</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Download className="mr-2 h-4 w-4" />
              Pest Identification Worksheet (PDF)
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="mr-2 h-4 w-4" />
              OMRI Approved Treatment Guide (PDF)
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="mr-2 h-4 w-4" />
              Seasonal Pest Calendar (PDF)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Share2 className="h-5 w-5" />
              <span>Share with Students</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Student Guide Link</h4>
              <div className="text-sm text-muted-foreground mb-3">
                Students can access the learning guide directly from their dashboard:
              </div>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2 bg-background rounded text-xs">
                  https://school.sproutify.app/student/pest-disease-guide
                </code>
                <Button size="sm" variant="outline">Copy</Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Integration Options:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Reference in lesson plans and garden activities</li>
                <li>• Assign as homework for pest identification practice</li>
                <li>• Use for pre-activity preparation and post-activity review</li>
                <li>• Integrate with science curriculum on ecosystems and plant health</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guide Modal */}
      <PestIdentificationModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        onSelectPest={() => {}} // No selection functionality in standalone mode
        pestCatalog={mockPestCatalog}
        towerLocation="indoor" // Default for guide browsing
      />
    </div>
  );
}