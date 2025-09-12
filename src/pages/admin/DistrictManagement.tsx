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
  Building2,
  Plus,
  Users,
  School,
  Calendar,
  CreditCard
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

interface District {
  id: string;
  name: string;
  join_code: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  website?: string;
  max_teachers: number;
  subscription_status: string;
  subscription_tier: string;
  trial_start_date?: string;
  trial_end_date?: string;
  created_at: string;
  updated_at: string;
  schools_count?: number;
  teachers_count?: number;
}

export default function DistrictManagement() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    filterDistricts();
  }, [districts, searchTerm, statusFilter]);

  const fetchDistricts = async () => {
    try {
      // Get all districts with counts
      const { data: districtsData, error: districtsError } = await supabase
        .from("districts")
        .select(`
          id,
          name,
          join_code,
          contact_email,
          contact_phone,
          address,
          website,
          max_teachers,
          subscription_status,
          subscription_tier,
          trial_start_date,
          trial_end_date,
          created_at,
          updated_at
        `)
        .order("created_at", { ascending: false });

      if (districtsError) {
        console.error("Error fetching districts:", districtsError);
        toast({
          title: "Error",
          description: "Failed to fetch districts",
          variant: "destructive",
        });
        return;
      }

      // Get counts for each district
      const districtsWithCounts = await Promise.all(
        districtsData.map(async (district) => {
          // Get schools count
          const { count: schoolsCount } = await supabase
            .from("schools")
            .select("*", { count: "exact", head: true })
            .eq("district_id", district.id);

          // Get teachers count
          const { count: teachersCount } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("district_id", district.id);

          return {
            ...district,
            schools_count: schoolsCount || 0,
            teachers_count: teachersCount || 0,
          };
        })
      );

      setDistricts(districtsWithCounts);
    } catch (error) {
      console.error("Error fetching districts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch districts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterDistricts = () => {
    let filtered = districts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(district =>
        district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        district.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        district.join_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(district => district.subscription_status === statusFilter);
    }

    setFilteredDistricts(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      trial: "secondary",
      expired: "destructive",
      suspended: "destructive",
    };
    
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTierBadge = (tier: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      district: "default",
      premium: "secondary",
      enterprise: "destructive",
    };
    
    return (
      <Badge variant={variants[tier] || "outline"}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SEO title="District Management" description="Manage districts and district admins" />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading districts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SEO title="District Management" description="Manage districts and district admins" />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">District Management</h1>
          <p className="text-muted-foreground">
            Manage districts, subscription status, and district administrators
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add District
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Districts</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{districts.length}</div>
            <p className="text-xs text-muted-foreground">
              {districts.filter(d => d.subscription_status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {districts.reduce((sum, d) => sum + (d.schools_count || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all districts
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
              {districts.reduce((sum, d) => sum + (d.teachers_count || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all districts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Districts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {districts.filter(d => d.subscription_status === 'trial').length}
            </div>
            <p className="text-xs text-muted-foreground">
              On trial period
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
                  placeholder="Search districts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Districts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Districts ({filteredDistricts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Join Code</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Schools</TableHead>
                <TableHead>Teachers</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Trial End</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDistricts.map((district) => (
                <TableRow key={district.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{district.name}</div>
                      {district.website && (
                        <div className="text-sm text-muted-foreground">
                          <a href={district.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {district.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {district.join_code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      {district.contact_email && (
                        <div className="text-sm">{district.contact_email}</div>
                      )}
                      {district.contact_phone && (
                        <div className="text-sm text-muted-foreground">{district.contact_phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(district.subscription_status)}
                  </TableCell>
                  <TableCell>
                    {getTierBadge(district.subscription_tier)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{district.schools_count || 0}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{district.teachers_count || 0}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDate(district.created_at)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {district.trial_end_date ? formatDate(district.trial_end_date) : "N/A"}
                    </span>
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
          
          {filteredDistricts.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No districts found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "No districts have been created yet."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
