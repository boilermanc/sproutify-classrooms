import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Users, FlaskConical, Microscope } from 'lucide-react';
import { useEducationalPackage, PACKAGE_DEFINITIONS, EducationalPackageType } from '@/context/EducationalPackageContext';
import { useToast } from '@/components/ui/use-toast';

interface ExperienceSelectorProps {
  classroomId: string;
  onExperienceSelected?: (packageType: EducationalPackageType) => void;
}

const packageIcons = {
  base: Users,
  elementary: Star,
  middle_school: FlaskConical,
  high_school: Microscope,
  advanced_stem: Microscope,
};

export default function ExperienceSelector({ classroomId, onExperienceSelected }: ExperienceSelectorProps) {
  const { currentPackage, updatePackage } = useEducationalPackage();
  const [isUpdating, setIsUpdating] = useState<EducationalPackageType | null>(null);
  const { toast } = useToast();

  const handlePackageSelect = async (packageType: EducationalPackageType) => {
    if (packageType === currentPackage) return;
    
    try {
      setIsUpdating(packageType);
      await updatePackage(packageType, classroomId);
      
      toast({
        title: "Learning style updated!",
        description: `Your classroom is now using ${PACKAGE_DEFINITIONS[packageType].name} mode.`,
      });
      
      onExperienceSelected?.(packageType);
    } catch (error) {
      console.error('Failed to update package:', error);
      toast({
        title: "Update failed",
        description: "Could not update learning style. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary">Choose Your Learning Style</h2>
        <p className="text-muted-foreground">
          Select the educational approach that best fits your classroom's learning objectives
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(PACKAGE_DEFINITIONS).map((pkg) => {
          const Icon = packageIcons[pkg.type];
          const isSelected = currentPackage === pkg.type;
          const isLoading = isUpdating === pkg.type;
          
          return (
            <Card 
              key={pkg.type}
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handlePackageSelect(pkg.type)}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-sm">
                    {pkg.targetGrade}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  {pkg.description}
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Features included:</h4>
                  <ul className="text-xs space-y-1">
                    {Object.entries(pkg.features)
                      .filter(([_, enabled]) => enabled)
                      .map(([feature, _]) => (
                        <li key={feature} className="flex items-center text-muted-foreground">
                          <Check className="h-3 w-3 text-primary mr-2 flex-shrink-0" />
                          {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </li>
                      ))
                    }
                  </ul>
                </div>

                <Button 
                  className="w-full" 
                  variant={isSelected ? "default" : "outline"}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Updating..."
                  ) : isSelected ? (
                    "Current Mode"
                  ) : (
                    "Use This Mode"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
