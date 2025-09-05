import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAppStore, TowerPortConfig } from "@/context/AppStore";
import { supabase } from "@/integrations/supabase/client";

export default function NewTower() {
  const navigate = useNavigate();
  const { dispatch } = useAppStore();
  const [portsStr, setPortsStr] = useState("20");
  const [location, setLocation] = useState("indoor"); // Add location state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement & { name: { value: string } };
    const name = form.name.value.trim();
    const ports = Number(portsStr) as TowerPortConfig;
    
    if (!name || !ports) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error("Authentication required");
      }

      if (!user) {
        throw new Error("You must be logged in to create a tower");
      }

      // Insert tower into Supabase with location
      const { data: tower, error: insertError } = await supabase
        .from('towers')
        .insert({
          name: name,
          ports: ports,
          teacher_id: user.id,
          location: location, // Add location to the insert
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Update local state with the created tower (including the database ID)
      dispatch({ 
        type: "ADD_TOWER", 
        payload: { 
          id: tower.id, // Use the ID from the database
          name: tower.name, 
          ports: tower.ports,
          location: tower.location // Include location in state if needed
        } 
      });

      // Navigate to towers list
      navigate("/app/towers");
      
    } catch (err) {
      console.error('Error creating tower:', err);
      setError(err instanceof Error ? err.message : 'Failed to create tower');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>New Tower</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tower name</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="e.g. Room 204 Tower A" 
                required 
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Port configuration</Label>
              <Select value={portsStr} onValueChange={setPortsStr} disabled={isSubmitting}>
                <SelectTrigger id="ports">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20 ports</SelectItem>
                  <SelectItem value="28">28 ports</SelectItem>
                  <SelectItem value="32">32 ports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Add Location Selection */}
            <div className="space-y-2">
              <Label>Tower location</Label>
              <Select value={location} onValueChange={setLocation} disabled={isSubmitting}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indoor">
                    <div className="flex items-center gap-2">
                      <span>🏠</span>
                      <div>
                        <div>Indoor</div>
                        <div className="text-xs text-muted-foreground">Inside classroom or building</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="greenhouse">
                    <div className="flex items-center gap-2">
                      <span>🏡</span>
                      <div>
                        <div>Greenhouse</div>
                        <div className="text-xs text-muted-foreground">Controlled environment structure</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="outdoor">
                    <div className="flex items-center gap-2">
                      <span>🌳</span>
                      <div>
                        <div>Outdoor</div>
                        <div className="text-xs text-muted-foreground">Outside garden or patio</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Tower...
                </>
              ) : (
                "Create Tower"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}