import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  Shield, 
  Users, 
  Trophy, 
  Settings,
  MessageSquare,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'privacy' | 'connections' | 'challenges' | 'troubleshooting';
  icon: React.ReactNode;
}

interface GardenNetworkFAQProps {
  className?: string;
  category?: string;
}

export function GardenNetworkFAQ({ className, category }: GardenNetworkFAQProps) {
  const faqs: FAQItem[] = [
    // General Questions
    {
      question: "What is the Garden Network?",
      answer: "The Garden Network is a global community where educators can connect their classrooms to share growing experiences, participate in competitions, and learn from each other. It enhances the educational value of aeroponic gardening by creating meaningful connections between classrooms worldwide.",
      category: 'general',
      icon: <HelpCircle className="h-4 w-4" />
    },
    {
      question: "How do I join the Garden Network?",
      answer: "Go to Garden Network → Settings, toggle 'Join the Garden Network' to ON, fill out your classroom profile with a display name and description, choose your privacy settings, and click 'Save Settings'.",
      category: 'general',
      icon: <Settings className="h-4 w-4" />
    },
    {
      question: "Is the Garden Network free to use?",
      answer: "Yes, the Garden Network is included with your Sproutify Classrooms subscription. There are no additional fees for network participation.",
      category: 'general',
      icon: <CheckCircle className="h-4 w-4" />
    },

    // Privacy Questions
    {
      question: "What information is shared on the network?",
      answer: "Only classroom-level data is shared: total harvest weights, plant counts, classroom profile information, and optional photos. Individual student information is never shared.",
      category: 'privacy',
      icon: <Shield className="h-4 w-4" />
    },
    {
      question: "Can I control what data is shared?",
      answer: "Yes, you have complete control over data sharing. You can choose to share harvest data, photos, and growth tips, or disable any of these options. You can also change these settings anytime.",
      category: 'privacy',
      icon: <Shield className="h-4 w-4" />
    },
    {
      question: "What are the different privacy levels?",
      answer: "Public: Discoverable by all network members. Invite Only: Accept connection requests but not searchable. Connected Only: Only visible to classrooms you're already connected with.",
      category: 'privacy',
      icon: <Shield className="h-4 w-4" />
    },

    // Connection Questions
    {
      question: "How do I find other classrooms to connect with?",
      answer: "Use the Discover Classrooms page to search by name, region, grade level, or school type. You can also filter results to find classrooms that match your interests.",
      category: 'connections',
      icon: <Users className="h-4 w-4" />
    },
    {
      question: "What types of connections can I make?",
      answer: "You can choose from three connection types: Competition (friendly rivalry), Collaboration (sharing tips), or Mentorship (learning from experienced classrooms).",
      category: 'connections',
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      question: "How do I respond to connection requests?",
      answer: "Go to My Connections → Incoming tab to see pending requests. You can Accept (creates active connection), Decline (politely declines), or Block (prevents future requests).",
      category: 'connections',
      icon: <Users className="h-4 w-4" />
    },

    // Challenge Questions
    {
      question: "What types of challenges are available?",
      answer: "There are three main types: Harvest Challenges (compete for heaviest harvest), Growth Challenges (track plant development), and Innovation Challenges (creative growing methods).",
      category: 'challenges',
      icon: <Trophy className="h-4 w-4" />
    },
    {
      question: "How do I join a challenge?",
      answer: "Visit Challenge Center, browse active challenges, read the description and requirements, check rewards and end dates, then click 'Join Challenge' to participate.",
      category: 'challenges',
      icon: <Trophy className="h-4 w-4" />
    },
    {
      question: "Can I leave a challenge after joining?",
      answer: "Yes, you can leave a challenge anytime by clicking 'Leave Challenge' on the challenge page. However, you won't be able to rejoin the same challenge.",
      category: 'challenges',
      icon: <Trophy className="h-4 w-4" />
    },

    // Troubleshooting Questions
    {
      question: "I can't find any classrooms to connect with",
      answer: "Check your visibility settings - you might be set to 'Connected Only'. Try different search terms, adjust filters, or ensure you're properly connected to the network.",
      category: 'troubleshooting',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      question: "My connection requests aren't being sent",
      answer: "Verify that network participation is enabled in settings, check that the target classroom accepts requests, and ensure you haven't been blocked by that classroom.",
      category: 'troubleshooting',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      question: "My data isn't appearing on leaderboards",
      answer: "Confirm that harvest data sharing is enabled in your network settings, check that you have logged harvest data, and verify your classroom is participating in the network.",
      category: 'troubleshooting',
      icon: <AlertTriangle className="h-4 w-4" />
    }
  ];

  const filteredFAQs = category ? faqs.filter(faq => faq.category === category) : faqs;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-blue-100 text-blue-700';
      case 'privacy': return 'bg-green-100 text-green-700';
      case 'connections': return 'bg-purple-100 text-purple-700';
      case 'challenges': return 'bg-yellow-100 text-yellow-700';
      case 'troubleshooting': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return <HelpCircle className="h-4 w-4" />;
      case 'privacy': return <Shield className="h-4 w-4" />;
      case 'connections': return <Users className="h-4 w-4" />;
      case 'challenges': return <Trophy className="h-4 w-4" />;
      case 'troubleshooting': return <AlertTriangle className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Garden Network FAQ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredFAQs.map((faq, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getCategoryColor(faq.category)}`}>
                {faq.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-sm">{faq.question}</h4>
                  <Badge variant="outline" className={`text-xs ${getCategoryColor(faq.category)}`}>
                    {faq.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        ))}

        {filteredFAQs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No FAQs found for the selected category.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
