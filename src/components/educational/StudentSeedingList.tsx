import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEducationalPackage } from '@/context/EducationalPackageContext';
import { 
  Sprout, 
  Calendar, 
  Camera, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Plus
} from 'lucide-react';

interface StudentSeedingListProps {
  studentId: string;
  classroomId: string;
  onStartNewSeeding?: () => void;
}

interface SeedingRecord {
  id: string;
  name: string;
  quantity: number;
  seeded_at: string;
  planted_at?: string;
  expected_harvest_date?: string;
  status: string;
  port_number?: number;
  tower_id?: string;
  outcome?: string;
  plant_catalog?: {
    id: string;
    name: string;
    category?: string;
    germination_days?: number;
    harvest_days?: number;
  };
}

export default function StudentSeedingList({ studentId, classroomId, onStartNewSeeding }: StudentSeedingListProps) {
  const { hasFeature } = useEducationalPackage();
  const { toast } = useToast();
  
  const [seedings, setSeedings] = useState<SeedingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [towers, setTowers] = useState<{id: string, name: string}[]>([]);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    germination_status: '',
    transplant_date: '',
    tower_id: '',
    port_number: '',
    notes: ''
  });

  useEffect(() => {
    fetchSeedings();
    fetchTowers();
  }, [studentId]);

  const fetchSeedings = async () => {
    try {
      setLoading(true);
      
      // Get the current user (teacher) to query plantings
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Authentication required");
      }
      
      const { data, error } = await supabase
        .from('plantings')
        .select(`
          id,
          name,
          quantity,
          seeded_at,
          planted_at,
          expected_harvest_date,
          status,
          port_number,
          tower_id,
          outcome,
          plant_catalog (
            id,
            name,
            category,
            germination_days,
            harvest_days
          )
        `)
        .eq('teacher_id', user.id) // Use teacher's ID
        .not('seeded_at', 'is', null) // Only get records that have been seeded
        .order('seeded_at', { ascending: false });

      if (error) throw error;
      
      // Filter by student_id stored in outcome field
      const studentSeedings = (data || []).filter(seeding => {
        try {
          if (seeding.outcome) {
            const outcomeData = JSON.parse(seeding.outcome);
            return outcomeData.student_id === studentId;
          }
        } catch (e) {
          // If parsing fails, skip this record
        }
        return false;
      });
      
      setSeedings(studentSeedings);
    } catch (error) {
      console.error('Error fetching seedings:', error);
      toast({
        title: "Error",
        description: "Failed to load seeding records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTowers = async () => {
    try {
      // Get the current user (teacher) to query towers
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Authentication required");
      }
      
      const { data, error } = await supabase
        .from('towers')
        .select('id, name')
        .eq('teacher_id', user.id); // Use teacher's ID

      if (error) throw error;
      setTowers(data || []);
    } catch (error) {
      console.error('Error fetching towers:', error);
    }
  };

  const getStatusBadge = (seeding: SeedingRecord) => {
    if (seeding.planted_at) {
      return <Badge className="bg-green-100 text-green-800">Transplanted</Badge>;
    } else if (seeding.seeded_at) {
      const daysSinceSeeding = Math.floor(
        (new Date().getTime() - new Date(seeding.seeded_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      const germinationDays = seeding.plant_catalog?.germination_days || 7;
      
      if (daysSinceSeeding >= germinationDays) {
        return <Badge className="bg-yellow-100 text-yellow-800">Ready to Transplant</Badge>;
      } else {
        return <Badge className="bg-blue-100 text-blue-800">Germinating</Badge>;
      }
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>;
    }
  };

  const getDaysUntilGermination = (seeding: SeedingRecord) => {
    if (!seeding.seeded_at) return null;
    
    const germinationDays = seeding.plant_catalog?.germination_days || 7;
    const daysSinceSeeding = Math.floor(
      (new Date().getTime() - new Date(seeding.seeded_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const daysRemaining = germinationDays - daysSinceSeeding;
    return daysRemaining > 0 ? daysRemaining : 0;
  };

  const handleEdit = (seeding: SeedingRecord) => {
    setEditingId(seeding.id);
    
    // Parse the outcome field to get seeding notes
    let seedingNotes = '';
    try {
      if (seeding.outcome) {
        const outcomeData = JSON.parse(seeding.outcome);
        seedingNotes = outcomeData.seeding_notes || '';
      }
    } catch (e) {
      // If parsing fails, treat outcome as plain text
      seedingNotes = seeding.outcome || '';
    }
    
    setEditForm({
      germination_status: seeding.planted_at ? 'transplanted' : 'germinating',
      transplant_date: seeding.planted_at || '',
      tower_id: seeding.tower_id || '',
      port_number: seeding.port_number?.toString() || '',
      notes: seedingNotes
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const updates: any = {};
      
      if (editForm.transplant_date && editForm.tower_id) {
        updates.planted_at = editForm.transplant_date;
        updates.tower_id = editForm.tower_id;
        updates.port_number = editForm.port_number ? parseInt(editForm.port_number) : null;
        updates.status = 'active';
      }

      if (editForm.notes) {
        // Update the outcome field with the notes
        const currentSeeding = seedings.find(s => s.id === editingId);
        let outcomeData = {};
        
        try {
          if (currentSeeding?.outcome) {
            outcomeData = JSON.parse(currentSeeding.outcome);
          }
        } catch (e) {
          // If parsing fails, start with empty object
        }
        
        outcomeData = {
          ...outcomeData,
          seeding_notes: editForm.notes
        };
        
        updates.outcome = JSON.stringify(outcomeData);
      }

      const { error } = await supabase
        .from('plantings')
        .update(updates)
        .eq('id', editingId);

      if (error) throw error;

      toast({
        title: "Updated",
        description: "Seeding record updated successfully"
      });

      setEditingId(null);
      fetchSeedings();
    } catch (error) {
      console.error('Error updating seeding:', error);
      toast({
        title: "Error",
        description: "Failed to update seeding record",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this seeding record?')) return;

    try {
      const { error } = await supabase
        .from('plantings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Seeding record deleted successfully"
      });

      fetchSeedings();
    } catch (error) {
      console.error('Error deleting seeding:', error);
      toast({
        title: "Error",
        description: "Failed to delete seeding record",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            My Seeding Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Track your rockwool seedings from germination to tower transplant
          </p>
        </CardContent>
      </Card>

      {/* Seeding Records */}
      {seedings.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Seeding Records Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start your first rockwool seeding session to track your plants' journey!
            </p>
            <Button onClick={onStartNewSeeding}>
              <Plus className="h-4 w-4 mr-2" />
              Start New Seeding
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {seedings.map((seeding) => (
            <Card key={seeding.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{seeding.name}</h4>
                      {getStatusBadge(seeding)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Seeds Planted</Label>
                        <p className="font-medium">{seeding.quantity}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Seeded Date</Label>
                        <p className="font-medium">
                          {seeding.seeded_at ? new Date(seeding.seeded_at).toLocaleDateString() : 'Not started'}
                        </p>
                      </div>
                      {seeding.planted_at && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Transplanted</Label>
                          <p className="font-medium">{new Date(seeding.planted_at).toLocaleDateString()}</p>
                        </div>
                      )}
                      {seeding.port_number && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Tower Port</Label>
                          <p className="font-medium">#{seeding.port_number}</p>
                        </div>
                      )}
                    </div>

                    {/* Germination Progress */}
                    {seeding.seeded_at && !seeding.planted_at && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <Label className="text-sm font-medium">Germination Progress</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const daysRemaining = getDaysUntilGermination(seeding);
                            const germinationDays = seeding.plant_catalog?.germination_days || 7;
                            const daysSinceSeeding = Math.floor(
                              (new Date().getTime() - new Date(seeding.seeded_at).getTime()) / (1000 * 60 * 60 * 24)
                            );
                            
                            if (daysRemaining === null) return null;
                            
                            if (daysRemaining === 0) {
                              return (
                                <div className="flex items-center gap-2 text-yellow-600">
                                  <AlertCircle className="h-4 w-4" />
                                  <span className="text-sm font-medium">Ready to check germination!</span>
                                </div>
                              );
                            } else {
                              return (
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-muted rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${Math.min(100, (daysSinceSeeding / germinationDays) * 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {daysRemaining} days remaining
                                  </span>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Plant Information */}
                    {seeding.plant_catalog && (
                      <div className="mb-3 p-3 bg-muted rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          {seeding.plant_catalog.category && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Category</Label>
                              <p className="font-medium">{seeding.plant_catalog.category}</p>
                            </div>
                          )}
                          {seeding.plant_catalog.germination_days && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Germination Time</Label>
                              <p className="font-medium">{seeding.plant_catalog.germination_days} days</p>
                            </div>
                          )}
                          {seeding.plant_catalog.harvest_days && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Time to Harvest</Label>
                              <p className="font-medium">{seeding.plant_catalog.harvest_days} days</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Seeding Details */}
                    {seeding.outcome && (
                      <div className="mb-3">
                        <Label className="text-sm font-medium">Seeding Details</Label>
                        <div className="text-sm text-muted-foreground mt-1 space-y-1">
                          {(() => {
                            try {
                              const outcomeData = JSON.parse(seeding.outcome);
                              const details = [];
                              
                              if (outcomeData.seeding_notes) {
                                details.push(`Notes: ${outcomeData.seeding_notes}`);
                              }
                              if (outcomeData.predictions) {
                                details.push(`Predictions: ${outcomeData.predictions}`);
                              }
                              if (outcomeData.observations) {
                                details.push(`Observations: ${outcomeData.observations}`);
                              }
                              if (outcomeData.hypothesis) {
                                details.push(`Hypothesis: ${outcomeData.hypothesis}`);
                              }
                              if (outcomeData.photos_count > 0) {
                                details.push(`Photos: ${outcomeData.photos_count}`);
                              }
                              
                              return details.length > 0 ? details.join(' • ') : 'No additional details recorded';
                            } catch (e) {
                              return 'Invalid data format';
                            }
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Edit Form */}
                    {editingId === seeding.id ? (
                      <div className="border-t pt-4 mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Transplant Date</Label>
                            <Input
                              type="date"
                              value={editForm.transplant_date}
                              onChange={(e) => setEditForm(prev => ({ ...prev, transplant_date: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Tower</Label>
                            <Select value={editForm.tower_id} onValueChange={(value) => setEditForm(prev => ({ ...prev, tower_id: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select tower..." />
                              </SelectTrigger>
                              <SelectContent>
                                {towers.map((tower) => (
                                  <SelectItem key={tower.id} value={tower.id}>
                                    {tower.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Port Number</Label>
                          <Input
                            type="number"
                            min="1"
                            max="32"
                            value={editForm.port_number}
                            onChange={(e) => setEditForm(prev => ({ ...prev, port_number: e.target.value }))}
                            placeholder="1-32"
                          />
                        </div>
                        <div>
                          <Label>Additional Notes</Label>
                          <Textarea
                            value={editForm.notes}
                            onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Any observations or updates..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveEdit} size="sm">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setEditingId(null)} 
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(seeding)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Update Progress
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(seeding.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
