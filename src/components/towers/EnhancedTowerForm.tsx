// CREATE: src/components/towers/EnhancedTowerForm.tsx

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/stores/AppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building, Leaf, Sun, Info } from "lucide-react";

interface EnhancedTowerFormProps {
  onTowerCreated?: () => void;
  editingTower?: {
    id: string;
    name: string;
    ports: number;
    location?: string;
  };
  onTowerUpdated?: () => void;
  onCancel?: () => void;
}

export function EnhancedTowerForm({ 
  onTowerCreated, 
  editingTower, 
  onTowerUpdated, 
  onCancel 
}: EnhancedTowerFormProps) {
  const { toast } = useToast();
  const { user } = useAppStore();
  
  const [name, setName] = useState(editingTower?.name || "");
  const [ports, setPorts] = useState(editingTower?.ports?.toString() || "");
  const [location, setLocation] = useState<string>(editingTower?.location || "indoor");
  const [submitting, setSubmitting] = useState(false);

  const locationInfo = {
    indoor: {
      icon: <Building className="h-4 w-4" />,
      title: "Indoor/Classroom",
      description: "Controlled environment with artificial lighting. Best for year-round growing with consistent conditions.",
      considerations: [
        "Limited natural light - may need grow lights",
        "Controlled temperature and humidity",
        "Easier pest management",
        "Suitable for most leafy greens and herbs"
      ],
      color: "bg-blue-100 text-blue-800 border-blue-200"
    },
    greenhouse: {
      icon: <Leaf className="h-4 w-4" />,
      title: "Greenhouse",
      description: "Semi-controlled environment with natural light and protection from weather.",
      considerations: [
        "Excellent natural light availability",
        "Temperature can be controlled but varies",
        "Some protection from pests",
        "Great for larger plants and longer growing seasons"
      ],
      color: "bg-green-100 text-green-800 border-green-200"
    },
    outdoor: {
      icon: <Sun className="h-4 w-4" />,
      title: "Outdoor",
      description: "Natural environment with full sunlight but exposure to weather and pests.",
      considerations: [
        "Full natural sunlight available",
        "Subject to weather conditions", 
        "Higher risk of pest issues",
        "Seasonal growing limitations",
        "May need protection from strong winds"
      ],
      color: "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a tower.",
        variant: "destructive"
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your tower.",
        variant: "destructive"
      });
      return;
    }

    const portsNum = parseInt(ports);
    if (isNaN(portsNum) || portsNum < 1 || portsNum > 100) {
      toast({
        title: "Invalid port number",
        description: "Please enter a valid number of ports (1-100).",
        variant: "destructive"
      });
      return;
    }

    if (!location) {
      toast({
        title: "Location required", 
        description: "Please select where your tower is located.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const towerData = {
        name: name.trim(),
        ports: portsNum,
        location: location,
        teacher_id: user.id
      };

      if (editingTower) {
        // Update existing tower
        const { error } = await supabase
          .from('towers')
          .update(towerData)
          .eq('id', editingTower.id);

        if (error) throw error;

        toast({
          title: "Tower updated",
          description: `${name} has been updated successfully.`
        });

        onTowerUpdated?.();
      } else {
        // Create new tower
        const { error } = await supabase
          .from('towers')
          .insert(towerData);

        if (error) throw error;

        toast({
          title: "Tower created",
          description: `${name} has been created successfully.`
        });

        // Reset form
        setName("");
        setPorts("");
        setLocation("indoor");

        onTowerCreated?.();
      }
    } catch (error: any) {
      console.error('Error saving tower:', error);
      toast({
        title: "Error saving tower",
        description: error.message || "Failed to save tower. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedLocationInfo = locationInfo[location as keyof typeof locationInfo];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingTower ? 'Edit Tower' : 'Create New Tower'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tower Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tower Name *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Main Classroom Tower, Science Lab Tower"
              required
            />
          </div>

          {/* Number of Ports */}
          <div className="space-y-2">
            <Label htmlFor="ports">Number of Ports *</Label>
            <Input
              id="ports"
              type="number"
              min="1"
              max="100"
              value={ports}
              onChange={(e) => setPorts(e.target.value)}
              placeholder="e.g., 12, 24, 36"
              required
            />
            <p className="text-xs text-muted-foreground">
              How many growing ports/holes does this tower have?
            </p>
          </div>

          {/* Location Selection */}
          <div className="space-y-3">
            <Label>Growing Location *</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select where this tower is located" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(locationInfo).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      {info.icon}
                      {info.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This helps provide appropriate growing tips and pest management recommendations.
            </p>
          </div>

          {/* Location Information */}
          {selectedLocationInfo && (
            <Alert className={selectedLocationInfo.color}>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    {selectedLocationInfo.icon}
                    {selectedLocationInfo.title}
                  </div>
                  <p className="text-sm">{selectedLocationInfo.description}</p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Key Considerations:</p>
                    <ul className="text-xs space-y-1">
                      {selectedLocationInfo.considerations.map((consideration, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-1 h-1 rounded-full bg-current mt-2 mr-2 flex-shrink-0"></span>
                          {consideration}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            {(editingTower || onCancel) && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingTower ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingTower ? 'Update Tower' : 'Create Tower'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Growing Tips Based on Location */}
      {selectedLocationInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedLocationInfo.icon}
              Growing Tips for {selectedLocationInfo.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              {location === 'indoor' && (
                <div className="space-y-2">
                  <h4 className="font-medium">Lighting Recommendations:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• LED grow lights should provide 14-16 hours of light daily</li>
                    <li>• Position lights 12-24 inches above the plants</li>
                    <li>• Use full spectrum lights for best growth</li>
                  </ul>
                  
                  <h4 className="font-medium">Environment Control:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Maintain 65-75°F temperature</li>
                    <li>• Ensure good air circulation with fans</li>
                    <li>• Monitor humidity levels (40-60% is ideal)</li>
                  </ul>
                </div>
              )}

              {location === 'greenhouse' && (
                <div className="space-y-2">
                  <h4 className="font-medium">Temperature Management:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Use shade cloth during hot summer months</li>
                    <li>• Consider heating for winter growing</li>
                    <li>• Install ventilation for air circulation</li>
                  </ul>
                  
                  <h4 className="font-medium">Pest Prevention:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Install screens on vents to exclude pests</li>
                    <li>• Monitor for aphids and whiteflies regularly</li>
                    <li>• Keep area clean and remove plant debris</li>
                  </ul>
                </div>
              )}

              {location === 'outdoor' && (
                <div className="space-y-2">
                  <h4 className="font-medium">Weather Protection:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Provide wind protection with screens or barriers</li>
                    <li>• Consider shade during extreme heat</li>
                    <li>• Plan for seasonal growing limitations</li>
                  </ul>
                  
                  <h4 className="font-medium">Pest Management:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Inspect plants weekly for pest issues</li>
                    <li>• Encourage beneficial insects with companion plants</li>
                    <li>• Use row covers when needed</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  );
}