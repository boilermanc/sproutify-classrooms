// src/hooks/usePlantCatalog.ts - Enhanced plant catalog hooks

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { 
  GlobalPlantWithStatus, 
  ClassroomPlantWithSource, 
  ActiveClassroomPlant,
  Tables,
  TablesInsert,
  TablesUpdate
} from "@/integrations/supabase/types";

// Hook for managing global plants with classroom status
export const useGlobalPlants = (teacherId: string | null) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch global plants with status indicators
  const { data: globalPlants, isLoading, error, refetch } = useQuery({
    queryKey: ['global-plants-status', teacherId],
    queryFn: async (): Promise<GlobalPlantWithStatus[]> => {
      if (!teacherId) return [];
      
      const { data, error } = await supabase.rpc('get_global_plants_with_status', {
        p_teacher_id: teacherId
      });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!teacherId
  });

  // Mutation to add global plant to classroom
  const addToClassroomMutation = useMutation({
    mutationFn: async (globalPlantId: string): Promise<string> => {
      if (!teacherId) throw new Error("Teacher ID required");
      
      const { data, error } = await supabase.rpc('add_global_plant_to_classroom', {
        p_teacher_id: teacherId,
        p_global_plant_id: globalPlantId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newPlantId, globalPlantId) => {
      const plant = globalPlants?.find(p => p.id === globalPlantId);
      toast({
        title: "Plant Added! 🌱",
        description: `${plant?.name || 'Plant'} has been added to your classroom catalog.`
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['global-plants-status', teacherId] });
      queryClient.invalidateQueries({ queryKey: ['classroom-plants', teacherId] });
      queryClient.invalidateQueries({ queryKey: ['active-classroom-plants', teacherId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Adding Plant",
        description: error.message || "Failed to add plant to classroom",
        variant: "destructive"
      });
    }
  });

  return {
    globalPlants: globalPlants || [],
    isLoading,
    error,
    refetch,
    addToClassroom: addToClassroomMutation.mutate,
    isAddingToClassroom: addToClassroomMutation.isPending
  };
};

// Hook for managing classroom plants
export const useClassroomPlants = (teacherId: string | null) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch classroom plants with source info
  const { data: classroomPlants, isLoading, error, refetch } = useQuery({
    queryKey: ['classroom-plants', teacherId],
    queryFn: async (): Promise<ClassroomPlantWithSource[]> => {
      if (!teacherId) return [];
      
      const { data, error } = await supabase.rpc('get_classroom_catalog', {
        p_teacher_id: teacherId
      });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!teacherId
  });

  // Mutation to toggle plant active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ plantId, isActive }: { plantId: string; isActive: boolean }): Promise<boolean> => {
      if (!teacherId) throw new Error("Teacher ID required");
      
      const { data, error } = await supabase.rpc('toggle_classroom_plant_active', {
        p_plant_id: plantId,
        p_teacher_id: teacherId,
        p_is_active: isActive
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (success, { plantId, isActive }) => {
      if (success) {
        const plant = classroomPlants?.find(p => p.id === plantId);
        toast({
          title: isActive ? "Plant Activated 🌿" : "Plant Deactivated",
          description: `${plant?.name || 'Plant'} is now ${isActive ? 'active' : 'inactive'} in your catalog.`
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['classroom-plants', teacherId] });
        queryClient.invalidateQueries({ queryKey: ['active-classroom-plants', teacherId] });
        queryClient.invalidateQueries({ queryKey: ['global-plants-status', teacherId] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update plant status",
        variant: "destructive"
      });
    }
  });

  // Mutation to remove plant from classroom
  const removePlantMutation = useMutation({
    mutationFn: async (plantId: string): Promise<boolean> => {
      if (!teacherId) throw new Error("Teacher ID required");
      
      const { data, error } = await supabase.rpc('remove_plant_from_classroom', {
        p_plant_id: plantId,
        p_teacher_id: teacherId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (success, plantId) => {
      if (success) {
        const plant = classroomPlants?.find(p => p.id === plantId);
        toast({
          title: "Plant Removed 🗑️",
          description: `${plant?.name || 'Plant'} has been removed from your catalog.`
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['classroom-plants', teacherId] });
        queryClient.invalidateQueries({ queryKey: ['active-classroom-plants', teacherId] });
        queryClient.invalidateQueries({ queryKey: ['global-plants-status', teacherId] });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error Removing Plant",
        description: error.message || "Failed to remove plant from classroom",
        variant: "destructive"
      });
    }
  });

  // Mutation to add custom plant
  const addCustomPlantMutation = useMutation({
    mutationFn: async (plantData: TablesInsert<'plant_catalog'>): Promise<string> => {
      if (!teacherId) throw new Error("Teacher ID required");
      
      const { data, error } = await supabase
        .from('plant_catalog')
        .insert({
          ...plantData,
          teacher_id: teacherId,
          is_global: false,
          is_active: true
        })
        .select('id')
        .single();
      
      if (error) throw error;
      return data.id;
    },
    onSuccess: (newPlantId, plantData) => {
      toast({
        title: "Custom Plant Added! 🌱",
        description: `${plantData.name} has been added to your catalog.`
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['classroom-plants', teacherId] });
      queryClient.invalidateQueries({ queryKey: ['active-classroom-plants', teacherId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Adding Custom Plant",
        description: error.message || "Failed to add custom plant",
        variant: "destructive"
      });
    }
  });

  // Mutation to update custom plant
  const updateCustomPlantMutation = useMutation({
    mutationFn: async ({ plantId, updateData }: { plantId: string; updateData: TablesUpdate<'plant_catalog'> }): Promise<void> => {
      if (!teacherId) throw new Error("Teacher ID required");
      
      const { error } = await supabase
        .from('plant_catalog')
        .update(updateData)
        .eq('id', plantId)
        .eq('teacher_id', teacherId)
        .eq('is_global', false);
      
      if (error) throw error;
    },
    onSuccess: (_, { updateData }) => {
      toast({
        title: "Plant Updated! ✏️",
        description: `${updateData.name || 'Plant'} has been updated.`
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['classroom-plants', teacherId] });
      queryClient.invalidateQueries({ queryKey: ['active-classroom-plants', teacherId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error Updating Plant",
        description: error.message || "Failed to update plant",
        variant: "destructive"
      });
    }
  });

  return {
    classroomPlants: classroomPlants || [],
    isLoading,
    error,
    refetch,
    toggleActive: toggleActiveMutation.mutate,
    isTogglingActive: toggleActiveMutation.isPending,
    removePlant: removePlantMutation.mutate,
    isRemovingPlant: removePlantMutation.isPending,
    addCustomPlant: addCustomPlantMutation.mutate,
    isAddingCustomPlant: addCustomPlantMutation.isPending,
    updateCustomPlant: updateCustomPlantMutation.mutate,
    isUpdatingCustomPlant: updateCustomPlantMutation.isPending
  };
};

// Hook for active classroom plants (used by students and plant selectors)
export const useActiveClassroomPlants = (teacherId: string | null) => {
  const { data: activePlants, isLoading, error, refetch } = useQuery({
    queryKey: ['active-classroom-plants', teacherId],
    queryFn: async (): Promise<ActiveClassroomPlant[]> => {
      if (!teacherId) return [];
      
      const { data, error } = await supabase.rpc('get_active_classroom_plants', {
        p_teacher_id: teacherId
      });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!teacherId
  });

  return {
    activePlants: activePlants || [],
    isLoading,
    error,
    refetch
  };
};

// Hook for plant statistics and analytics
export const usePlantStats = (teacherId: string | null) => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['plant-stats', teacherId],
    queryFn: async () => {
      if (!teacherId) return null;
      
      // Get classroom plants count
      const { count: totalClassroomPlants, error: classroomError } = await supabase
        .from('plant_catalog')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacherId)
        .eq('is_global', false);
      
      if (classroomError) throw classroomError;
      
      // Get active plants count
      const { count: activePlants, error: activeError } = await supabase
        .from('plant_catalog')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacherId)
        .eq('is_global', false)
        .eq('is_active', true);
      
      if (activeError) throw activeError;
      
      // Get custom plants count
      const { count: customPlants, error: customError } = await supabase
        .from('plant_catalog')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', teacherId)
        .eq('is_global', false)
        .is('global_plant_id', null);
      
      if (customError) throw customError;
      
      return {
        totalClassroomPlants: totalClassroomPlants || 0,
        activePlants: activePlants || 0,
        inactivePlants: (totalClassroomPlants || 0) - (activePlants || 0),
        customPlants: customPlants || 0,
        globalPlants: (totalClassroomPlants || 0) - (customPlants || 0)
      };
    },
    enabled: !!teacherId
  });

  return {
    stats,
    isLoading,
    error
  };
};