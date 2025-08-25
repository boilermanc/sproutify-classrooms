// src/components/scouting/TreatmentRecommendations.tsx

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Lightbulb, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";

interface TreatmentOption {
  method: string;
  safe_for_schools: boolean;
  effectiveness: string;
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

export default function TreatmentRecommendations({ 
  treatments, 
  selectedTreatments, 
  onTreatmentToggle 
}: TreatmentRecommendationsProps) {
  const [expandedTreatments, setExpandedTreatments] = useState<string[]>([]);

  const toggleExpanded = (method: string) => {
    setExpandedTreatments(prev => 
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffectivenessIcon = (effectiveness: string) => {
    switch (effectiveness.toLowerCase()) {
      case 'high': return <CheckCircle2 className="h-3 w-3" />;
      case 'medium': return <AlertTriangle className="h-3 w-3" />;
      case 'low': return <AlertTriangle className="h-3 w-3" />;
      default: return null;
    }
  };

  if (treatments.length === 0) {
    return (
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertDescription>
          No specific treatment recommendations available. Consider consulting with your teacher or a plant specialist.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          Recommended Treatments
          <Badge variant="secondary">{treatments.length} options</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              These treatments are school-safe and suitable for your growing environment. 
              Check the boxes for treatments you plan to apply.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {treatments.map((treatment, index) => {
              const isExpanded = expandedTreatments.includes(treatment.method);
              const isSelected = selectedTreatments.includes(treatment.method);

              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onTreatmentToggle(treatment.method)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{treatment.method}</h3>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={getEffectivenessColor(treatment.effectiveness)}
                          >
                            {getEffectivenessIcon(treatment.effectiveness)}
                            {treatment.effectiveness} effectiveness
                          </Badge>
                          {treatment.safe_for_schools && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              School Safe
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {treatment.instructions}
                      </p>

                      <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(treatment.method)}>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-auto p-1">
                            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            {isExpanded ? 'Hide details' : 'Show details'}
                          </Button>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent className="space-y-3 mt-2">
                          {treatment.materials && treatment.materials.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Materials Needed:</h4>
                              <ul className="text-sm list-disc list-inside text-muted-foreground">
                                {treatment.materials.map((material, idx) => (
                                  <li key={idx}>{material}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {treatment.precautions && treatment.precautions.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-1 text-orange-700">
                                Safety Precautions:
                              </h4>
                              <ul className="text-sm list-disc list-inside text-orange-600">
                                {treatment.precautions.map((precaution, idx) => (
                                  <li key={idx}>{precaution}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div>
                            <h4 className="text-sm font-medium mb-1">Suitable Locations:</h4>
                            <div className="flex flex-wrap gap-1">
                              {treatment.location_suitable.map((location, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {location}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedTreatments.length > 0 && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Selected treatments:</strong> {selectedTreatments.join(', ')}
                <br />
                <small className="text-muted-foreground">
                  Remember to follow all safety instructions and consult your teacher before applying any treatments.
                </small>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}