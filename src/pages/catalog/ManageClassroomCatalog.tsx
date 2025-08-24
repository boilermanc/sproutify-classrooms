// src/pages/catalog/ManageClassroomCatalog.tsx - Fixed for React Query hooks
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Plus, Edit, Trash2, Leaf, Clock, Calendar, Filter, Globe, User, CheckCircle, XCircle } from "lucide-react";
import { useClassroomPlants, usePlantStats } from "@/hooks/usePlantCatalog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ClassroomPlantWithSource, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

// Form validation schema for custom plants
const plantFormSchema = z.object({
  name: z.string().min(1, "Plant name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  category: z.enum(["Leafy Green", "Herb"], { required_error: "Please select a category" }),
  germination_days: z.number().min(1).max(365).optional(),
  harvest_days: z.number().min(1).max(365).optional()
});

type PlantFormData = z.infer<typeof plantFormSchema>;

const ManageClassroomCatalog = () => {
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [editingPlant, setEditingPlant] = useState<ClassroomPlantWithSource | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Get current teacher ID
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setTeacherId(user?.id ?? null);
    });
  }, []);

  // Use our React Query hooks
  const {
    classroomPlants,
    isLoading,
    error,
    toggleActive,
    isTogglingActive,
    removePlant,
    isRemovingPlant,
    addCustomPlant,
    isAddingCustomPlant,
    updateCustomPlant,
    isUpdatingCustomPlant
  } = useClassroomPlants(teacherId);

  const { stats, isLoading: isStatsLoading } = usePlantStats(teacherId);

  // Form handling
  const form = useForm<PlantFormData>({
    resolver: zodResolver(plantFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "Leafy Green",
      germination_days: undefined,
      harvest_days: undefined
    }
  });

  // Filter plants based on active status
  const filteredPlants = classroomPlants.filter(plant => {
    if (filter === "active") return plant.is_active;
    if (filter === "inactive") return !plant.is_active;
    return true;
  });

  // Handle adding custom plant
  const handleAddCustomPlant = (data: PlantFormData) => {
    const plantData: TablesInsert<'plant_catalog'> = {
      name: data.name,
      description: data.description || null,
      category: data.category,
      germination_days: data.germination_days || null,
      harvest_days: data.harvest_days || null
    };
    
    addCustomPlant(plantData, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        form.reset();
      }
    });
  };

  // Handle editing custom plant
  const handleEditCustomPlant = (data: PlantFormData) => {
    if (!editingPlant) return;
    
    const updateData: TablesUpdate<'plant_catalog'> = {
      name: data.name,
      description: data.description || null,
      category: data.category,
      germination_days: data.germination_days || null,
      harvest_days: data.harvest_days || null,
      updated_at: new Date().toISOString()
    };
    
    updateCustomPlant({ plantId: editingPlant.id, updateData }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setEditingPlant(null);
        form.reset();
      }
    });
  };

  // Handle opening edit dialog
  const handleEditClick = (plant: ClassroomPlantWithSource) => {
    setEditingPlant(plant);
    form.reset({
      name: plant.name,
      description: plant.description || "",
      category: plant.category as "Leafy Green" | "Herb" || "Leafy Green",
      germination_days: plant.germination_days || undefined,
      harvest_days: plant.harvest_days || undefined
    });
    setIsEditDialogOpen(true);
  };

  if (!teacherId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to manage your plant catalog.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Failed to load your plant catalog. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <SEO 
        title="Manage Plant Catalog | Sproutify School"
        description="Manage your classroom plant catalog. Activate or deactivate plants, add custom varieties, and organize what students can select."
        canonical="/app/catalog/manage"
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/app/catalog">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Catalog
                </Link>
              </Button>
            </div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Leaf className="h-6 w-6 text-green-600" />
              Manage Plant Catalog
            </h1>
            <p className="text-muted-foreground">
              Control which plants are available to students and add your own custom varieties.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/app/catalog/global">
                <Globe className="h-4 w-4 mr-2" />
                Browse Global
              </Link>
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Plant
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <form onSubmit={form.handleSubmit(handleAddCustomPlant)}>
                  <DialogHeader>
                    <DialogTitle>Add Custom Plant</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="name">Plant Name *</Label>
                      <Input
                        id="name"
                        {...form.register("name")}
                        placeholder="e.g., Lettuce - Red Sails"
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select onValueChange={(value) => form.setValue("category", value as "Leafy Green" | "Herb")} defaultValue="Leafy Green">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Leafy Green">Leafy Green</SelectItem>
                          <SelectItem value="Herb">Herb</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.category && (
                        <p className="text-sm text-red-500 mt-1">{form.formState.errors.category.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...form.register("description")}
                        placeholder="Optional description..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="germination_days">Germination Days</Label>
                        <Input
                          id="germination_days"
                          type="number"
                          min="1"
                          max="365"
                          {...form.register("germination_days", { valueAsNumber: true })}
                          placeholder="e.g., 7"
                        />
                      </div>
                      <div>
                        <Label htmlFor="harvest_days">Harvest Days</Label>
                        <Input
                          id="harvest_days"
                          type="number"
                          min="1"
                          max="365"
                          {...form.register("harvest_days", { valueAsNumber: true })}
                          placeholder="e.g., 45"
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isAddingCustomPlant}>
                      {isAddingCustomPlant ? "Adding..." : "Add Plant"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && !isStatsLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalClassroomPlants}</p>
                    <p className="text-xs text-muted-foreground">Total Plants</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.activePlants}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-2xl font-bold">{stats.inactivePlants}</p>
                    <p className="text-xs text-muted-foreground">Inactive</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.customPlants}</p>
                    <p className="text-xs text-muted-foreground">Custom</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={(value: "all" | "active" | "inactive") => setFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plants</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredPlants.length} plants shown
          </p>
        </div>

        {/* Plants List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPlants.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No plants found</h3>
              <p className="text-muted-foreground mb-4">
                {filter === "all" 
                  ? "You don't have any plants in your classroom catalog yet."
                  : `No ${filter} plants found.`
                }
              </p>
              {filter === "all" && (
                <div className="flex gap-2 justify-center">
                  <Button asChild variant="outline">
                    <Link to="/app/catalog/global">
                      Browse Global Catalog
                    </Link>
                  </Button>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    Add Custom Plant
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPlants.map((plant) => (
              <Card key={plant.id} className={`transition-all ${!plant.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Plant Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-lg">{plant.name}</h3>
                        <div className="flex gap-2">
                          {plant.category && (
                            <Badge variant="outline">{plant.category}</Badge>
                          )}
                          <Badge variant={plant.is_custom ? "secondary" : "default"} className="flex items-center gap-1">
                            {plant.is_custom ? (
                              <>
                                <User className="h-3 w-3" />
                                Custom
                              </>
                            ) : (
                              <>
                                <Globe className="h-3 w-3" />
                                Global
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                      
                      {plant.description && (
                        <p className="text-sm text-muted-foreground mb-3">{plant.description}</p>
                      )}
                      
                      {(plant.germination_days || plant.harvest_days) && (
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {plant.germination_days && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Germination: {plant.germination_days}d
                            </div>
                          )}
                          {plant.harvest_days && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Harvest: {plant.harvest_days}d
                            </div>
                          )}
                        </div>
                      )}
                      
                      {!plant.is_custom && plant.global_plant_name && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Source: {plant.global_plant_name}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      {/* Active/Inactive Switch */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={plant.is_active}
                          onCheckedChange={(checked) => toggleActive({ plantId: plant.id, isActive: checked })}
                          disabled={isTogglingActive}
                        />
                        <Badge variant={plant.is_active ? "default" : "secondary"}>
                          {plant.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {/* Edit/Delete Buttons (for custom plants only) */}
                      {plant.is_custom && (
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditClick(plant)}
                            disabled={isUpdatingCustomPlant}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Custom Plant</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to permanently delete "{plant.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => removePlant(plant.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                  disabled={isRemovingPlant}
                                >
                                  {isRemovingPlant ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Custom Plant Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <form onSubmit={form.handleSubmit(handleEditCustomPlant)}>
              <DialogHeader>
                <DialogTitle>Edit Custom Plant</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="edit-name">Plant Name *</Label>
                  <Input
                    id="edit-name"
                    {...form.register("name")}
                    placeholder="e.g., Lettuce - Red Sails"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="edit-category">Category *</Label>
                  <Select 
                    onValueChange={(value) => form.setValue("category", value as "Leafy Green" | "Herb")}
                    value={form.watch("category")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Leafy Green">Leafy Green</SelectItem>
                      <SelectItem value="Herb">Herb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    {...form.register("description")}
                    placeholder="Optional description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-germination_days">Germination Days</Label>
                    <Input
                      id="edit-germination_days"
                      type="number"
                      min="1"
                      max="365"
                      {...form.register("germination_days", { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-harvest_days">Harvest Days</Label>
                    <Input
                      id="edit-harvest_days"
                      type="number"
                      min="1"
                      max="365"
                      {...form.register("harvest_days", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdatingCustomPlant}>
                  {isUpdatingCustomPlant ? "Updating..." : "Update Plant"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Help Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Leaf className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Plant Management Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Active plants</strong> are visible to students when logging activities</li>
                  <li>• <strong>Global plants</strong> come from our curated catalog with optimal growing data</li>
                  <li>• <strong>Custom plants</strong> are varieties you've added specifically for your classroom</li>
                  <li>• You can temporarily disable plants without deleting them</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ManageClassroomCatalog;