// src/pages/guides/StudentPestDiseaseGuide.tsx

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { PestIdentificationModal } from "@/components/scouting/PestIdentificationModal";
import { 
  BookOpen, 
  Bug,
  Leaf,
  Eye,
  PlayCircle,
  ArrowRight,
  GraduationCap,
  Search,
  Video
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

export default function StudentPestDiseaseGuide() {
  const [showGuideModal, setShowGuideModal] = useState(false);

  const learningGoals = [
    {
      icon: Eye,
      title: "Observation Skills",
      description: "Practice careful observation and develop scientific description abilities"
    },
    {
      icon: Bug,
      title: "Pest Identification",
      description: "Learn to identify common garden pests and distinguish beneficial insects"
    },
    {
      icon: Leaf,
      title: "Plant Health",
      description: "Understand how pests and diseases affect plant growth and development"
    },
    {
      icon: GraduationCap,
      title: "Organic Solutions",
      description: "Discover safe, organic pest management methods approved for school use"
    }
  ];

  return (
    <div className="container py-8 space-y-8">
      <SEO title="Learning Guide - Pest & Disease Identification | Sproutify School" />
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="bg-green-100 p-3 rounded-lg">
            <Leaf className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Garden Learning Guide</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Learn to identify and understand common garden pests and diseases
            </p>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowGuideModal(true)}
          size="lg" 
          className="mt-6"
        >
          <Search className="mr-2 h-5 w-5" />
          Start Learning
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Learning Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            What You'll Learn
          </CardTitle>
          <CardDescription>
            Educational goals and skills you'll develop using this guide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {learningGoals.map((goal, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <goal.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{goal.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {goal.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How to Use the Guide */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use This Guide</CardTitle>
          <CardDescription>
            Step-by-step instructions for getting the most out of your learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              <div className="bg-blue-100 text-blue-600 rounded-full p-2 text-sm font-medium">1</div>
              <div>
                <h4 className="font-medium">Browse & Search</h4>
                <p className="text-sm text-muted-foreground">Use the search function to find specific pests or browse by category</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              <div className="bg-blue-100 text-blue-600 rounded-full p-2 text-sm font-medium">2</div>
              <div>
                <h4 className="font-medium">Study the Details</h4>
                <p className="text-sm text-muted-foreground">Explore identification, damage, remedies, and prevention tabs</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              <div className="bg-blue-100 text-blue-600 rounded-full p-2 text-sm font-medium">3</div>
              <div>
                <h4 className="font-medium">Watch Educational Videos</h4>
                <p className="text-sm text-muted-foreground">Learn through video demonstrations when available</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
              <div className="bg-blue-100 text-blue-600 rounded-full p-2 text-sm font-medium">4</div>
              <div>
                <h4 className="font-medium">Apply Your Knowledge</h4>
                <p className="text-sm text-muted-foreground">Use what you learn during tower observations and pest logging</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Features */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="p-6">
            <Bug className="h-8 w-8 mx-auto mb-3 text-red-500" />
            <h3 className="font-semibold mb-2">Pest Identification</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Learn about common insects that can affect tower plants
            </p>
            <Button variant="outline" onClick={() => setShowGuideModal(true)}>
              Browse Pests
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Leaf className="h-8 w-8 mx-auto mb-3 text-orange-500" />
            <h3 className="font-semibold mb-2">Disease Recognition</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Identify plant diseases and understand their treatments
            </p>
            <Button variant="outline" onClick={() => setShowGuideModal(true)}>
              Browse Diseases
            </Button>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <Video className="h-8 w-8 mx-auto mb-3 text-blue-500" />
            <h3 className="font-semibold mb-2">Video Learning</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Watch educational videos for visual learning
            </p>
            <Button variant="outline" onClick={() => setShowGuideModal(true)}>
              Watch Videos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Educational Note */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <GraduationCap className="h-6 w-6 text-green-600 mt-1" />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">Remember!</h3>
              <p className="text-sm text-green-800">
                Always ask your teacher for guidance before taking any action on pests or diseases. 
                This guide is for learning and identification - your teacher will help decide on the best treatments for your classroom towers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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