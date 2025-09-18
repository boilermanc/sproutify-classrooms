import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Users, MapPin, GraduationCap, School, Send, Eye, EyeOff } from 'lucide-react';
import { NetworkService, ClassroomWithProfile } from '@/services/networkService';
import { useAppStore } from '@/context/AppStore';
import { toast } from 'sonner';

export default function ClassroomDiscovery() {
  const navigate = useNavigate();
  const { state } = useAppStore();
  
  const [classrooms, setClassrooms] = useState<ClassroomWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    region: '',
    grade_level: '',
    school_type: '',
    exclude_connected: false
  });

  useEffect(() => {
    if (state.selectedClassroom?.id) {
      loadClassrooms();
    }
  }, [state.selectedClassroom?.id, filters, searchTerm]);

  const loadClassrooms = async () => {
    if (!state.selectedClassroom?.id) return;
    
    setLoading(true);
    try {
      const discovered = await NetworkService.discoverClassrooms(
        state.selectedClassroom.id,
        {
          ...filters,
          grade_level: filters.grade_level === 'any' ? '' : filters.grade_level,
          school_type: filters.school_type === 'any' ? '' : filters.school_type,
          search: searchTerm || undefined
        }
      );
      setClassrooms(discovered);
    } catch (error) {
      console.error('Failed to load classrooms:', error);
      toast.error('Failed to load classrooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSendConnectionRequest = async (targetClassroomId: string, classroomName: string) => {
    if (!state.selectedClassroom?.id) return;
    
    try {
      await NetworkService.sendConnectionRequest(
        state.selectedClassroom.id,
        targetClassroomId,
        'collaboration',
        `Hello! I'd like to connect our classrooms to share growing experiences.`
      );
      toast.success(`Connection request sent to ${classroomName}`);
      loadClassrooms(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to send connection request:', error);
      toast.error(error.message || 'Failed to send connection request');
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Eye className="h-4 w-4 text-green-500" />;
      case 'invite_only': return <EyeOff className="h-4 w-4 text-yellow-500" />;
      default: return <Users className="h-4 w-4 text-blue-500" />;
    }
  };

  const getVisibilityText = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'Public';
      case 'invite_only': return 'Invite Only';
      default: return 'Connected Only';
    }
  };

  if (!state.selectedClassroom) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Discover Classrooms</h1>
          <p className="text-muted-foreground">
            Find and connect with other classrooms in the Garden Network.
          </p>
        </div>
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Select a Classroom</h3>
          <p className="text-muted-foreground mb-4">
            Please select a classroom to discover other classrooms in the network.
          </p>
          <Button onClick={() => navigate('/app/classrooms')}>
            Go to Classrooms
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Discover Classrooms</h1>
          <p className="text-muted-foreground">
            Find and connect with other classrooms in the Garden Network.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/app/network')}>
          Back to Network
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Classrooms</Label>
              <Input
                id="search"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                placeholder="e.g. California, UK, Ontario"
                value={filters.region}
                onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade-level">Grade Level</Label>
              <Select value={filters.grade_level} onValueChange={(value) => setFilters(prev => ({ ...prev, grade_level: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any grade level</SelectItem>
                  <SelectItem value="K-2">K-2 (Ages 5-8)</SelectItem>
                  <SelectItem value="3-5">3-5 (Ages 8-11)</SelectItem>
                  <SelectItem value="6-8">6-8 (Ages 11-14)</SelectItem>
                  <SelectItem value="9-12">9-12 (Ages 14-18)</SelectItem>
                  <SelectItem value="College">College/University</SelectItem>
                  <SelectItem value="Adult">Adult Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="school-type">School Type</Label>
              <Select value={filters.school_type} onValueChange={(value) => setFilters(prev => ({ ...prev, school_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any school type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any school type</SelectItem>
                  <SelectItem value="elementary">Elementary School</SelectItem>
                  <SelectItem value="middle">Middle School</SelectItem>
                  <SelectItem value="high">High School</SelectItem>
                  <SelectItem value="college">College/University</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exclude-connected">Filter</Label>
              <Select value={filters.exclude_connected ? 'exclude' : 'include'} onValueChange={(value) => setFilters(prev => ({ ...prev, exclude_connected: value === 'exclude' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="include">Show all classrooms</SelectItem>
                  <SelectItem value="exclude">Hide connected classrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {loading ? 'Searching...' : `${classrooms.length} Classrooms Found`}
          </h2>
          {classrooms.length > 0 && (
            <Button variant="outline" size="sm" onClick={loadClassrooms}>
              Refresh Results
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : classrooms.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Classrooms Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters to find more classrooms.
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setFilters({ region: '', grade_level: '', school_type: '', exclude_connected: false });
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map((classroom) => (
              <Card key={classroom.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{classroom.network_settings?.display_name || classroom.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{classroom.name}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getVisibilityIcon(classroom.network_settings?.visibility_level || 'invite_only')}
                      <Badge variant="secondary" className="text-xs">
                        {getVisibilityText(classroom.network_settings?.visibility_level || 'invite_only')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {classroom.network_settings?.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {classroom.network_settings.bio}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {classroom.network_settings?.region && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{classroom.network_settings.region}</span>
                      </div>
                    )}
                    {classroom.network_settings?.grade_level && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <GraduationCap className="h-3 w-3" />
                        <span>{classroom.network_settings.grade_level}</span>
                      </div>
                    )}
                    {classroom.teacher?.schools?.name && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <School className="h-3 w-3" />
                        <span>{classroom.teacher.schools.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleSendConnectionRequest(classroom.id, classroom.network_settings?.display_name || classroom.name)}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Connect
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/app/network/profile/${classroom.id}`)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}