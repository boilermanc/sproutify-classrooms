import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  School,
  Plus,
  Users,
  Building2,
  Calendar,
  MapPin
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

interface SchoolData {
  id: string;
  name: string;
  district?: string;
  timezone?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  district_id?: string;
  district_name?: string;
  teachers_count?: number;
  classrooms_count?: number;
}

export default function SchoolManagement() {
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<SchoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [districts, setDistricts] = useState<{id: string, name: string}[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterSchools();
  }, [schools, searchTerm, districtFilter]);

  const fetchData = async () => {
    try {
      // Get all schools with district info
      const { data: schoolsData, error: schoolsError } = await supabase
        .from("schools")
        .select(`
          id,
          name,
          district,
          timezone,
          image_url,
          created_at,
          updated_at,
          district_id,
          districts(name)
        `)
        .order("created_at", { ascending: false });

      if (schoolsError) {
        console.error("Error fetching schools:", schoolsError);
        toast({
          title: "Error",
          description: "Failed to fetch schools",
          variant: "destructive",
        });
        return;
      }

      // Get districts for filter
      const { data: districtsData, error: districtsError } = await supabase
        .from("districts")
        .select("id, name")
        .order("name");

      if (districtsError) {
        console.error("Error fetching districts:", districtsError);
      } else {
        setDistricts(districtsData || []);
      }

      // Get counts for each school
      const schoolsWithCounts = await Promise.all(
        schoolsData.map(async (school) => {
          // Get teachers count
          const { count: teachersCount } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("school_id", school.id);

          // Get classrooms count
          const { count: classroomsCount } = await supabase
            .from("classrooms")
            .select("*", { count: "exact", head: true })
            .eq("school_id", school.id);

          return {
            ...school,
            district_name: school.districts?.name,
            teachers_count: teachersCount || 0,
            classrooms_count: classroomsCount || 0,
          };
        })
      );

      setSchools(schoolsWithCounts);
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast({
        title: "Error",
        description: "Failed to fetch schools",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterSchools = () => {
    let filtered = schools;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(school =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.district_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.district?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // District filter
    if (districtFilter !== "all") {
      filtered = filtered.filter(school => school.district_id === districtFilter);
    }

    setFilteredSchools(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getDistrictBadge = (districtName?: string) => {
    if (!districtName) {
      return <Badge variant="outline">No District</Badge>;
    }
    
    return (
      <Badge variant="secondary">
        {districtName}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SEO title="School Management" description="Manage schools and school admins" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading schools...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SEO title="School Management" description="Manage schools and school admins" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">School Management</h1>
          <p className="text-muted-foreground">
            Manage schools, teachers, and school administrators
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add School
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schools.length}</div>
            <p className="text-xs text-muted-foreground">
              {schools.filter(s => s.district_id).length} with districts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schools.reduce((sum, s) => sum + (s.teachers_count || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all schools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classrooms</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schools.reduce((sum, s) => sum + (s.classrooms_count || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all schools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Districts</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{districts.length}</div>
            <p className="text-xs text-muted-foreground">
              Active districts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search schools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by district" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                <SelectItem value="no-district">No District</SelectItem>
                {districts.map((district) => (
                  <SelectItem key={district.id} value={district.id}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Schools Table */}
      <Card>
        <CardHeader>
          <CardTitle>Schools ({filteredSchools.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Timezone</TableHead>
                <TableHead>Teachers</TableHead>
                <TableHead>Classrooms</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {school.image_url ? (
                        <img 
                          src={school.image_url} 
                          alt={school.name}
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                          <School className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{school.name}</div>
                        {school.district && (
                          <div className="text-sm text-muted-foreground">
                            {school.district}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getDistrictBadge(school.district_name)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {school.timezone || "Not set"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{school.teachers_count || 0}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{school.classrooms_count || 0}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDate(school.created_at)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDate(school.updated_at)}</span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredSchools.length === 0 && (
            <div className="text-center py-8">
              <School className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No schools found</h3>
              <p className="text-muted-foreground">
                {searchTerm || districtFilter !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "No schools have been created yet."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
