// src/pages/catalog/GlobalPlantCatalog.tsx - Fixed for React Query hooks
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SEO } from "@/components/SEO";
import { Search, Leaf, Clock, Calendar, ArrowLeft, Plus, Check } from "lucide-react";
import { useGlobalPlants } from "@/hooks/usePlantCatalog";
import { supabase } from "@/integrations/supabase/client";

const GlobalPlantCatalog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Get current teacher ID
  const [teacherId, setTeacherId] = useState<string | null>(null);
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setTeacherId(user?.id ?? null);
    });
  }, []);

  // Use our React Query hook
  const { globalPlants, isLoading, error, addToClassroom, isAddingToClassroom } = useGlobalPlants(teacherId);

  // Filter plants based on search and category
  const filteredPlants = globalPlants?.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (plant.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesCategory = categoryFilter === "all" || plant.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) ?? [];

  // Get unique categories for filter
  const categories = Array.from(new Set(globalPlants?.map(p => p.category).filter(Boolean) ?? []));

  if (!teacherId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to access the plant catalog.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Failed to load plant catalog. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <SEO 
        title="Global Plant Catalog | Sproutify School"
        description="Browse and add plants from the global catalog to your classroom. Discover new varieties for your hydroponic towers."
        canonical="/app/catalog/global"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/app/catalog">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to My Catalog
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Leaf className="h-6 w-6 text-green-600" />
              Global Plant Catalog
            </h1>
            <p className="text-muted-foreground">
              Discover and add plants from our curated collection to your classroom catalog.
            </p>
          </div>
          <Button asChild>
            <Link to="/app/catalog/manage">
              <Plus className="h-4 w-4 mr-2" />
              Manage My Plants
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search plants by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Plants Grid */}
        {!isLoading && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredPlants.length} plants found
              </p>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              )}
            </div>

            {filteredPlants.length === 0 ? (
              <div className="text-center py-12">
                <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No plants found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || categoryFilter !== "all" 
                    ? "Try adjusting your search or filter criteria."
                    : "No plants are available in the global catalog yet."
                  }
                </p>
                {searchTerm && (
                  <Button onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlants.map((plant) => (
                  <Card key={plant.id} className="relative hover:shadow-md transition-shadow">
                    {/* Status Badge */}
                    {plant.is_in_classroom && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge 
                          variant={plant.is_active_in_classroom ? "default" : "secondary"}
                          className="flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" />
                          {plant.is_active_in_classroom ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    )}

                    <CardContent className="p-6">
                      {/* Plant Info */}
                      <div className="mb-4">
                        <h3 className="font-semibold text-lg mb-2">{plant.name}</h3>
                        {plant.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {plant.description}
                          </p>
                        )}
                        {plant.category && (
                          <Badge variant="outline" className="mb-3">
                            {plant.category}
                          </Badge>
                        )}
                      </div>

                      {/* Growing Info */}
                      {(plant.germination_days || plant.harvest_days) && (
                        <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-muted rounded-lg">
                          {plant.germination_days && (
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-green-600" />
                              <span>Germination: {plant.germination_days}d</span>
                            </div>
                          )}
                          {plant.harvest_days && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span>Harvest: {plant.harvest_days}d</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        className="w-full"
                        disabled={plant.is_in_classroom || isAddingToClassroom}
                        onClick={() => addToClassroom(plant.id)}
                        variant={plant.is_in_classroom ? "outline" : "default"}
                      >
                        {isAddingToClassroom ? (
                          "Adding..."
                        ) : plant.is_in_classroom ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            In Your Catalog
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Add to Classroom
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Help Text */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Leaf className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">How it works</h4>
                <p className="text-sm text-muted-foreground">
                  Plants you add from this global catalog will appear in your classroom catalog. 
                  You can then manage them (activate/deactivate) from your{" "}
                  <Link to="/app/catalog/manage" className="underline hover:no-underline">
                    plant management page
                  </Link>. Students will only see plants that are active in your classroom catalog.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default GlobalPlantCatalog;