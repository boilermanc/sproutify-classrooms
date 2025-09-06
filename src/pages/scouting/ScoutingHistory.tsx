// src/pages/scouting/ScoutingHistory.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/stores/AppStore";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Bug, 
  Search, 
  Filter, 
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Trash2,
  Download,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { ScoutingEntryModal } from "@/components/scouting/ScoutingEntryModal";

interface ScoutingEntry {
  id: string;
  tower_id: string;
  tower_name: string;
  tower_location: string;
  pest: string;
  pest_catalog_id?: string;
  pest_catalog_name?: string;
  pest_type?: string;
  severity?: number;
  location_on_tower?: string;
  affected_plants?: string[];
  notes?: string;
  action?: string;
  treatment_applied?: string[];
  follow_up_needed: boolean;
  follow_up_date?: string;
  resolved: boolean;
  resolved_at?: string;
  observed_at: string;
  created_at: string;
  images?: string[];
}

export default function ScoutingHistory() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAppStore();
  
  // Data state
  const [entries, setEntries] = useState<ScoutingEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<ScoutingEntry[]>([]);
  const [towers, setTowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTower, setSelectedTower] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  
  // UI state
  const [selectedEntry, setSelectedEntry] = useState<ScoutingEntry | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [entries, searchTerm, selectedTower, statusFilter, severityFilter, typeFilter, dateRange]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load towers first
      const { data: towersData, error: towersError } = await supabase
        .from('towers')
        .select('id, name, location')
        .eq('teacher_id', user.id)
        .order('name');

      if (towersError) throw towersError;
      setTowers(towersData || []);

      // Load scouting entries with tower and pest catalog data
      const { data: entriesData, error: entriesError } = await supabase
        .from('pest_logs')
        .select(`
          *,
          towers!inner(name, location),
          pest_catalog(name, type)
        `)
        .eq('teacher_id', user.id)
        .order('observed_at', { ascending: false });

      if (entriesError) throw entriesError;

      // Transform the data
      const transformedEntries = entriesData?.map(entry => ({
        ...entry,
        tower_name: entry.towers.name,
        tower_location: entry.towers.location,
        pest_catalog_name: entry.pest_catalog?.name,
        pest_type: entry.pest_catalog?.type
      })) || [];

      setEntries(transformedEntries);
    } catch (error) {
      console.error('Error loading scouting data:', error);
      toast({
        title: "Error loading data",
        description: "Could not load scouting history. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...entries];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.pest.toLowerCase().includes(term) ||
        entry.tower_name.toLowerCase().includes(term) ||
        entry.notes?.toLowerCase().includes(term) ||
        entry.location_on_tower?.toLowerCase().includes(term) ||
        entry.affected_plants?.some(plant => plant.toLowerCase().includes(term))
      );
    }

    // Tower filter
    if (selectedTower !== "all") {
      filtered = filtered.filter(entry => entry.tower_id === selectedTower);
    }

    // Status filter
    if (statusFilter !== "all") {
      switch (statusFilter) {
        case "active":
          filtered = filtered.filter(entry => !entry.resolved && !entry.follow_up_needed);
          break;
        case "follow-up":
          filtered = filtered.filter(entry => entry.follow_up_needed && !entry.resolved);
          break;
        case "resolved":
          filtered = filtered.filter(entry => entry.resolved);
          break;
      }
    }

    // Severity filter
    if (severityFilter !== "all") {
      const severity = parseInt(severityFilter);
      filtered = filtered.filter(entry => entry.severity === severity);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(entry => entry.pest_type === typeFilter);
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      const cutoff = new Date();
      
      switch (dateRange) {
        case "week":
          cutoff.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoff.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          cutoff.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(entry => new Date(entry.observed_at) >= cutoff);
    }

    setFilteredEntries(filtered);
  };

  const handleViewEntry = (entry: ScoutingEntry) => {
    setSelectedEntry(entry);
    setEditMode(false);
    setShowEntryModal(true);
  };

  const handleEditEntry = (entry: ScoutingEntry) => {
    setSelectedEntry(entry);
    setEditMode(true);
    setShowEntryModal(true);
  };

  const handleDeleteEntry = async (entry: ScoutingEntry) => {
    if (!confirm(`Are you sure you want to delete this scouting entry for "${entry.pest}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pest_logs')
        .delete()
        .eq('id', entry.id);

      if (error) throw error;

      toast({
        title: "Entry deleted",
        description: "Scouting entry has been removed successfully."
      });

      // Refresh data
      await loadData();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: "Error deleting entry",
        description: "Could not delete scouting entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleResolveEntry = async (entry: ScoutingEntry) => {
    try {
      const { error } = await supabase
        .from('pest_logs')
        .update({ 
          resolved: !entry.resolved,
          resolved_at: entry.resolved ? null : new Date().toISOString()
        })
        .eq('id', entry.id);

      if (error) throw error;

      toast({
        title: entry.resolved ? "Entry reopened" : "Entry resolved",
        description: entry.resolved 
          ? "Scouting entry has been marked as active again."
          : "Scouting entry has been marked as resolved."
      });

      // Refresh data
      await loadData();
    } catch (error) {
      console.error('Error updating entry:', error);
      toast({
        title: "Error updating entry",
        description: "Could not update scouting entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (entry: ScoutingEntry) => {
    if (entry.resolved) {
      return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
    } else if (entry.follow_up_needed) {
      const isOverdue = entry.follow_up_date && new Date(entry.follow_up_date) < new Date();
      return (
        <Badge className={isOverdue ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}>
          {isOverdue ? "Follow-up Overdue" : "Follow-up Needed"}
        </Badge>
      );
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
    }
  };

  const getSeverityBadge = (severity?: number) => {
    if (!severity) return null;
    
    const colors = {
      1: "bg-green-100 text-green-800",
      2: "bg-yellow-100 text-yellow-800", 
      3: "bg-red-100 text-red-800"
    };
    
    return <Badge className={colors[severity as keyof typeof colors]}>Level {severity}</Badge>;
  };

  const exportData = () => {
    const csvContent = [
      ["Date", "Tower", "Issue", "Type", "Severity", "Location", "Status", "Action Taken", "Notes"].join(","),
      ...filteredEntries.map(entry => [
        format(new Date(entry.observed_at), 'yyyy-MM-dd'),
        entry.tower_name,
        entry.pest,
        entry.pest_type || "Custom",
        entry.severity || "",
        entry.location_on_tower || "",
        entry.resolved ? "Resolved" : (entry.follow_up_needed ? "Follow-up" : "Active"),
        entry.action || "",
        entry.notes || ""
      ].map(field => `"${field}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scouting-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container py-8 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Scouting History | Sproutify School"
        description="View and manage all scouting observations across your aeroponic towers"
      />
      
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bug className="h-8 w-8" />
              Scouting History
            </h1>
            <p className="text-muted-foreground">
              Track and manage all pest observations across your towers
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => navigate('/towers')}>
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bug className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                  <p className="text-2xl font-bold">{entries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Need Follow-up</p>
                  <p className="text-2xl font-bold">
                    {entries.filter(e => e.follow_up_needed && !e.resolved).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold">
                    {entries.filter(e => e.resolved).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Issues</p>
                  <p className="text-2xl font-bold">
                    {entries.filter(e => !e.resolved && !e.follow_up_needed).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedTower} onValueChange={setSelectedTower}>
                <SelectTrigger>
                  <SelectValue placeholder="All Towers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Towers</SelectItem>
                  {towers.map(tower => (
                    <SelectItem key={tower.id} value={tower.id}>
                      {tower.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="follow-up">Follow-up Needed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="1">Level 1</SelectItem>
                  <SelectItem value="2">Level 2</SelectItem>
                  <SelectItem value="3">Level 3</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="insect">Insect</SelectItem>
                  <SelectItem value="disease">Disease</SelectItem>
                  <SelectItem value="nutrient">Nutrient</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                  <SelectItem value="quarter">Past 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bug className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No scouting entries found</h3>
              <p className="text-muted-foreground mb-4">
                {entries.length === 0 
                  ? "You haven't recorded any scouting observations yet."
                  : "No entries match your current filters."
                }
              </p>
              <Button onClick={() => navigate('/towers')}>
                <Plus className="h-4 w-4 mr-2" />
                Record First Observation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Showing {filteredEntries.length} of {entries.length} entries
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredEntries.map((entry) => (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium">{entry.pest}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>{entry.tower_name}</span>
                              {entry.location_on_tower && (
                                <span>• {entry.location_on_tower}</span>
                              )}
                              <Calendar className="h-4 w-4 ml-2" />
                              <span>{format(new Date(entry.observed_at), 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            {getStatusBadge(entry)}
                            {getSeverityBadge(entry.severity)}
                            {entry.pest_type && (
                              <Badge variant="outline">{entry.pest_type}</Badge>
                            )}
                          </div>
                        </div>

                        {entry.notes && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {entry.notes}
                          </p>
                        )}

                        {entry.affected_plants && entry.affected_plants.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            <span className="text-xs text-muted-foreground">Affected:</span>
                            {entry.affected_plants.map((plant, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {plant}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {entry.follow_up_needed && entry.follow_up_date && (
                          <Alert className="mt-3">
                            <Clock className="h-4 w-4" />
                            <AlertDescription>
                              Follow-up scheduled for {format(new Date(entry.follow_up_date), 'MMM d, yyyy')}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>

                    <Separator className="mb-4" />

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewEntry(entry)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          onClick={() => handleEditEntry(entry)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleResolveEntry(entry)}
                          variant="outline"
                          size="sm"
                          className={entry.resolved ? "text-yellow-600" : "text-green-600"}
                        >
                          {entry.resolved ? (
                            <>
                              <Clock className="h-4 w-4 mr-2" />
                              Reopen
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Resolve
                            </>
                          )}
                        </Button>
                      </div>
                      <Button
                        onClick={() => handleDeleteEntry(entry)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Entry Detail/Edit Modal */}
      {selectedEntry && (
        <ScoutingEntryModal
          isOpen={showEntryModal}
          onClose={() => {
            setShowEntryModal(false);
            setSelectedEntry(null);
            setEditMode(false);
          }}
          entry={selectedEntry}
          editMode={editMode}
          onSave={() => {
            loadData();
            setShowEntryModal(false);
            setSelectedEntry(null);
            setEditMode(false);
          }}
        />
      )}
    </>
  );
}