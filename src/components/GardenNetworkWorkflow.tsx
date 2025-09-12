import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Network, 
  Settings, 
  Search, 
  Users, 
  Trophy, 
  ArrowRight,
  CheckCircle,
  Circle
} from "lucide-react";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'upcoming';
}

interface GardenNetworkWorkflowProps {
  currentStep?: string;
  className?: string;
}

export function GardenNetworkWorkflow({ currentStep, className }: GardenNetworkWorkflowProps) {
  const steps: WorkflowStep[] = [
    {
      id: 'setup',
      title: 'Setup Network',
      description: 'Enable network participation and configure settings',
      icon: <Settings className="h-5 w-5" />,
      status: currentStep === 'setup' ? 'current' : 'upcoming'
    },
    {
      id: 'discover',
      title: 'Discover Classrooms',
      description: 'Find and connect with other classrooms',
      icon: <Search className="h-5 w-5" />,
      status: currentStep === 'discover' ? 'current' : 'upcoming'
    },
    {
      id: 'connect',
      title: 'Manage Connections',
      description: 'Accept requests and build your network',
      icon: <Users className="h-5 w-5" />,
      status: currentStep === 'connect' ? 'current' : 'upcoming'
    },
    {
      id: 'compete',
      title: 'Join Challenges',
      description: 'Participate in competitions and track progress',
      icon: <Trophy className="h-5 w-5" />,
      status: currentStep === 'compete' ? 'current' : 'upcoming'
    }
  ];

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'current': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-400 bg-gray-100';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'current': return <Circle className="h-4 w-4 fill-current" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Garden Network Workflow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4">
              {/* Step Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getStepColor(step.status)}`}>
                {getStepIcon(step.status)}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{step.title}</h4>
                  {step.status === 'current' && (
                    <Badge variant="default" className="text-xs">Current</Badge>
                  )}
                  {step.status === 'completed' && (
                    <Badge variant="secondary" className="text-xs">Complete</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>

              {/* Arrow */}
              {index < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Visual Flow */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="text-sm font-medium mb-3">Complete Workflow:</div>
          <div className="text-xs font-mono text-muted-foreground">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Settings → Enable Network → Configure Profile</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Discover → Search → Filter → Send Requests</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Connections → Accept/Decline → Manage Network</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Challenges → Join → Compete → Track Progress</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
