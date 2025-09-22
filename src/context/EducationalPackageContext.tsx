import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EducationalPackageType } from '@/integrations/supabase/types';


export interface PackageFeatures {
  basic_tracking: boolean;
  simple_lists: boolean;
  germination_tracking: boolean;
  photos: boolean;
  predictions: boolean;
  observations: boolean;
  excitement_tracking?: boolean;
  celebrations?: boolean;
  hypothesis_formation?: boolean;
  data_analysis?: boolean;
  collaboration?: boolean;
  research_projects?: boolean;
  advanced_statistics?: boolean;
  publication_support?: boolean;
  grant_management?: boolean;
}

export interface PackageDefinition {
  type: EducationalPackageType;
  name: string;
  description: string;
  features: PackageFeatures;
  targetGrade: string;
}

export const PACKAGE_DEFINITIONS: Record<EducationalPackageType, PackageDefinition> = {
  base: {
    type: 'base',
    name: 'Simple Tracking',
    description: 'Basic seed tracking and germination monitoring',
    features: {
      basic_tracking: true,
      simple_lists: true,
      germination_tracking: true,
      photos: false,
      predictions: false,
      observations: false,
    },
    targetGrade: 'All grades',
  },
  elementary: {
    type: 'elementary',
    name: 'Elementary Learning',
    description: 'Wonder-based learning with predictions and observations',
    features: {
      basic_tracking: true,
      simple_lists: true,
      germination_tracking: true,
      photos: true,
      predictions: true,
      observations: true,
      excitement_tracking: true,
      celebrations: true,
    },
    targetGrade: 'Grades 4-5',
  },
  middle_school: {
    type: 'middle_school',
    name: 'Scientific Method',
    description: 'Hypothesis formation and collaborative experiments',
    features: {
      basic_tracking: true,
      simple_lists: true,
      germination_tracking: true,
      photos: true,
      predictions: true,
      observations: true,
      hypothesis_formation: true,
      data_analysis: true,
      collaboration: true,
    },
    targetGrade: 'Grades 6-8',
  },
  high_school: {
    type: 'high_school',
    name: 'Research Mode',
    description: 'Advanced research methodology and analytics',
    features: {
      basic_tracking: true,
      simple_lists: true,
      germination_tracking: true,
      photos: true,
      predictions: true,
      observations: true,
      hypothesis_formation: true,
      data_analysis: true,
      collaboration: true,
      research_projects: true,
      advanced_statistics: true,
    },
    targetGrade: 'Grades 9-12',
  },
  advanced_stem: {
    type: 'advanced_stem',
    name: 'Professional Research',
    description: 'Professional research tools and publication support',
    features: {
      basic_tracking: true,
      simple_lists: true,
      germination_tracking: true,
      photos: true,
      predictions: true,
      observations: true,
      hypothesis_formation: true,
      data_analysis: true,
      collaboration: true,
      research_projects: true,
      advanced_statistics: true,
      publication_support: true,
      grant_management: true,
    },
    targetGrade: 'Advanced STEM Programs',
  },
};

interface EducationalPackageContextType {
  currentPackage: EducationalPackageType;
  packageDefinition: PackageDefinition;
  features: PackageFeatures;
  isLoading: boolean;
  updatePackage: (newPackage: EducationalPackageType, classroomId: string) => Promise<void>;
  hasFeature: (feature: keyof PackageFeatures) => boolean;
}

const EducationalPackageContext = createContext<EducationalPackageContextType | undefined>(undefined);

export function EducationalPackageProvider({ 
  children, 
  classroomId 
}: { 
  children: React.ReactNode; 
  classroomId?: string;
}) {
  const [currentPackage, setCurrentPackage] = useState<EducationalPackageType>('base');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (classroomId) {
      fetchClassroomPackage(classroomId);
    } else {
      setIsLoading(false);
    }
  }, [classroomId]);

  const fetchClassroomPackage = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('classrooms')
        .select('educational_package')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data?.educational_package) {
        setCurrentPackage(data.educational_package);
      }
    } catch (error) {
      console.error('Error fetching classroom package:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePackage = async (newPackage: EducationalPackageType, id: string) => {
    try {
      const { error } = await supabase
        .from('classrooms')
        .update({ educational_package: newPackage })
        .eq('id', id);

      if (error) throw error;
      
      setCurrentPackage(newPackage);
    } catch (error) {
      console.error('Error updating classroom package:', error);
      throw error;
    }
  };

  const packageDefinition = PACKAGE_DEFINITIONS[currentPackage];
  const features = packageDefinition.features;

  const hasFeature = (feature: keyof PackageFeatures): boolean => {
    return features[feature] === true;
  };

  return (
    <EducationalPackageContext.Provider
      value={{
        currentPackage,
        packageDefinition,
        features,
        isLoading,
        updatePackage,
        hasFeature,
      }}
    >
      {children}
    </EducationalPackageContext.Provider>
  );
}

export function useEducationalPackage() {
  const context = useContext(EducationalPackageContext);
  if (context === undefined) {
    throw new Error('useEducationalPackage must be used within an EducationalPackageProvider');
  }
  return context;
}
