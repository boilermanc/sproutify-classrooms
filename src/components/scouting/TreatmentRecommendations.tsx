// src/components/scouting/TreatmentRecommendations.tsx

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  ChevronDown,
  ChevronRight,
  Droplets,
  Scissors,
  Fan,
  Users
} from "lucide-react";

interface TreatmentOption {
  method: string;
  safe_for_schools: boolean;
  effectiveness: 'low' | 'medium' | 'high';
  location_suitable: string[];
  instructions: string;
  materials?: string[];
  precautions?: string[];
}

interface TreatmentRecommendationsProps {
  treatments: TreatmentOption[];
  selectedTreatments: string[];
  onTreatmentToggle: (treatment: string) => void;
}

export function TreatmentRecommendations({
  treatments,
  selectedTreatments,
  onTreatmentToggle
}: TreatmentRecommendationsProps) {
  const [expandedTreatments, setExpandedTreatments] = useState<Set<string>>(new Set());

  if (treatments.length === 0) {
    return null;
  }

  const toggleExpanded = (method: string) => {
    setExpandedTreatments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(method)) {
        newSet.delete(method);
      } else {
        newSet.add(method);
      }
      return newSet;
    });
  };

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    const methodLower = method.toLowerCase();
    if (methodLower.includes('spray') || methodLower.includes('water')) {
      return <Droplets className="h-4 w-4" />;
    } else if (methodLower.includes('remove') || methodLower.includes('prune')) {
      return <Scissors className="h-4 w-4" />;
    } else if (methodLower.includes('air') || methodLower.includes('circulation')) {
      return <Fan className="h-4 w-4" />;
    } else {
      return <Droplets className="h-4 w-4" />;
    }
  };

  // Sort treatments by effectiveness (high to low) and safety
  const sortedTreatments = [...treatments].sort((a, b) => {
    const effectivenessOrder = { high: 3, medium: 2, low: 1 };
    const aScore = effectivenessOrder[a.effectiveness];
    const bScore = effectivenessOrder[b.effectiveness];
    if (aScore !== bScore) return bScore - aScore;
    
    // If same effectiveness, prioritize school-safe options
    if (a.safe_for_schools !== b.safe_for_schools) {
      return a.safe_for_schools ? -1 : 1;
    }
    
    return 0;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          Recommended Treatments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            These treatments are safe for school environments and suitable for your growing location.
            Start with the most effective options and progress as needed.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {sortedTreatments.map((treatment, index) => (
            <Card key={treatment.method} className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center space-x-2 pt-1">
                    <Checkbox
                      id={`treatment-${index}`}
                      checked={selectedTreatments.includes(treatment.method)}
                      onCheckedChange={() => onTreatmentToggle(treatment.method)}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Collapsible 
                      open={expandedTreatments.has(treatment.method)}
                      onOpenChange={() => toggleExpanded(treatment.method)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start p-0 h-auto font-medium text-left"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              {getMethodIcon(treatment.method)}
                              <span>{treatment.method}</span>
                              <div className="flex gap-2">
                                <Badge className={getEffectivenessColor(treatment.effectiveness)}>
                                  {treatment.effectiveness} effectiveness
                                </Badge>
                                {treatment.safe_for_schools && (
                                  <Badge variant="outline" className="border-green-500 text-green-700">
                                    <Shield className="h-3 w-3 mr-1" />
                                    School Safe
                                  </Badge>
                                )}
                                {index === 0 && (
                                  <Badge className="bg-blue-100 text-blue-800">
                                    Recommended First
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {expandedTreatments.has(treatment.method) ? 
                              <ChevronDown className="h-4 w-4" /> : 
                              <ChevronRight className="h-4 w-4" />
                            }
                          </div>
                        </Button>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="mt-3 space-y-3">
                        {/* Instructions */}
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Instructions
                          </h4>
                          <p className="text-sm">{treatment.instructions}</p>
                        </div>

                        {/* Materials Needed */}
                        {treatment.materials && treatment.materials.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Materials Needed
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {treatment.materials.map((material, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {material}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Precautions */}
                        {treatment.precautions && treatment.precautions.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              Important Precautions
                            </h4>
                            <ul className="space-y-1">
                              {treatment.precautions.map((precaution, idx) => (
                                <li key={idx} className="flex items-start text-sm">
                                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                  {precaution}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Student Safety Note */}
                        <Alert className="border-green-200 bg-green-50">
                          <Users className="h-4 w-4" />
                          <AlertDescription className="text-green-800">
                            <strong>Student Safety:</strong> This treatment is approved for classroom use. 
                            Always supervise student application and ensure proper ventilation.
                          </AlertDescription>
                        </Alert>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedTreatments.length > 0 && (
          <>
            <Separator />
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Selected Treatments
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedTreatments.map((treatment, idx) => (
                  <Badge key={idx} className="bg-green-100 text-green-800">
                    {treatment}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                These treatments will be recorded with your scouting entry for future reference.
              </p>
            </div>
          </>
        )}

        {/* General Tips */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Treatment Tips:</strong> Start with the least intensive treatment first. 
            Monitor results for 3-5 days before escalating to more intensive methods. 
            Always document what you tried and the results.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}