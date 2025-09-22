import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Building2, 
  BarChart3, 
  Settings, 
  ArrowRight,
  CheckCircle,
  Sparkles,
  Crown,
  UserPlus,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  subscription_plan: string | null;
  subscription_status: string | null;
  onboarding_completed?: boolean;
  schools: {
    name: string;
  } | null;
}

interface SchoolAdminWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
}

const SchoolAdminWelcomeModal: React.FC<SchoolAdminWelcomeModalProps> = ({ isOpen, onClose, userProfile }) => {
  const navigate = useNavigate();
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateOnboardingStatus = async () => {
    if (dontShowAgain) {
      setIsUpdating(true);
      try {
        // Update the user's profile to mark onboarding as completed
        const { error } = await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', userProfile.id);

        if (error) {
          console.error('Error updating onboarding status:', error);
        }
      } catch (error) {
        console.error('Error updating onboarding status:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleClose = async () => {
    await updateOnboardingStatus();
    onClose();
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Only close without updating database if user clicks X or clicks outside
      onClose();
    }
  };

  const getPlanDisplayName = (plan: string | null) => {
    if (!plan) return 'Free';
    const planName = plan.split('_')[0];
    return planName.charAt(0).toUpperCase() + planName.slice(1);
  };

  const getPlanBadgeVariant = (status: string | null) => {
    switch (status) {
      case 'trial': return 'default';
      case 'active': return 'secondary';
      case 'free': return 'outline';
      default: return 'outline';
    }
  };

  const schoolAdminSteps = [
    {
      icon: <UserPlus className="h-6 w-6 text-blue-600" />,
      title: "Invite Teachers",
      description: "Add teachers to your school and assign them to classrooms.",
      action: "Invite Teachers",
      path: "/app/settings/teachers"
    },
    {
      icon: <Building2 className="h-6 w-6 text-green-600" />,
      title: "Manage Classrooms",
      description: "Create and organize classrooms for your teachers.",
      action: "Manage Classrooms",
      path: "/app/classrooms"
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-purple-600" />,
      title: "View School Analytics",
      description: "Monitor progress across all classrooms and teachers.",
      action: "View Analytics",
      path: "/app/analytics"
    },
    {
      icon: <Settings className="h-6 w-6 text-orange-600" />,
      title: "Configure School Settings",
      description: "Set up school-wide policies and preferences.",
      action: "School Settings",
      path: "/app/settings"
    }
  ];

  const schoolAdminFeatures = [
    {
      icon: <Shield className="h-5 w-5 text-blue-600" />,
      title: "Teacher Management",
      description: "Invite, manage, and monitor all teachers in your school"
    },
    {
      icon: <Users className="h-5 w-5 text-green-600" />,
      title: "Student Oversight",
      description: "Track student progress across all classrooms"
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-purple-600" />,
      title: "School Analytics",
      description: "Comprehensive reporting and insights for your school"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <img 
                src="/lovable-uploads/689a7eca-ef5f-4820-8baa-d048f50e2773.png" 
                alt="Sproutify School Logo" 
                className="h-20 w-auto object-contain"
              />
              <Crown className="h-6 w-6 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>
          <DialogTitle className="text-3xl font-bold text-center">
            Welcome to Sproutify School Admin!
          </DialogTitle>
          <DialogDescription className="text-lg text-center">
            Hi {userProfile.first_name}! You're now the School Administrator for {userProfile.schools?.name || 'your school'}.
          </DialogDescription>
          
          {/* Plan Status */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant={getPlanBadgeVariant(userProfile.subscription_status)} className="text-sm">
              {getPlanDisplayName(userProfile.subscription_plan)} Plan
            </Badge>
            {userProfile.subscription_status === 'trial' && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                7-Day Free Trial
              </Badge>
            )}
            <Badge variant="secondary" className="text-sm">
              School Administrator
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Quick Start Guide */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                School Administrator Quick Start
              </CardTitle>
              <CardDescription>
                Follow these steps to set up your school's aeroponic garden management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {schoolAdminSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg border bg-background">
                    <div className="flex-shrink-0 mt-1">
                      {step.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{step.description}</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs"
                        onClick={() => {
                          navigate(step.path);
                          handleClose();
                        }}
                      >
                        {step.action}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card>
            <CardHeader>
              <CardTitle>School Administrator Features</CardTitle>
              <CardDescription>
                Discover the powerful administrative tools available in your School plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {schoolAdminFeatures.map((feature, index) => (
                  <div key={index} className="text-center p-4">
                    <div className="flex justify-center mb-3">
                      {feature.icon}
                    </div>
                    <h4 className="font-semibold text-sm mb-2">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* School Information */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold text-blue-900 mb-2">
                  School: {userProfile.schools?.name || "Unknown"}
                </h3>
                <p className="text-sm text-blue-700">
                  As School Administrator, you can manage all teachers, classrooms, and garden activities across your school.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
                <Checkbox
                  id="dont-show-again"
                  checked={dontShowAgain}
                  onCheckedChange={setDontShowAgain}
                />
              <label 
                htmlFor="dont-show-again" 
                className="text-sm text-muted-foreground cursor-pointer flex items-center gap-2"
              >
                <span>Don't show this again</span>
                {dontShowAgain && (
                  <span className="text-xs text-green-600 font-medium">
                    ✓ Will be saved
                  </span>
                )}
              </label>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleClose}
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Get Started"}
              </Button>
              <Button 
                onClick={() => {
                  // Navigate immediately, don't wait for database update
                  navigate('/app');
                  // Handle database update in background
                  updateOnboardingStatus();
                  onClose();
                }}
                disabled={isUpdating}
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolAdminWelcomeModal;
