// CREATE: src/utils/scoutingUtils.ts

import { format, isAfter, isBefore, addDays } from "date-fns";

export type TowerLocation = 'indoor' | 'greenhouse' | 'outdoor';
export type PestType = 'insect' | 'disease' | 'nutrient' | 'environmental';
export type SeverityLevel = 1 | 2 | 3;
export type EffectivenessLevel = 'low' | 'medium' | 'high';

export interface ScoutingEntry {
  id: string;
  tower_id: string;
  tower_name?: string;
  tower_location?: TowerLocation;
  pest: string;
  pest_catalog_id?: string;
  pest_type?: PestType;
  severity?: SeverityLevel;
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

export interface TreatmentOption {
  method: string;
  safe_for_schools: boolean;
  effectiveness: EffectivenessLevel;
  location_suitable: TowerLocation[];
  instructions: string;
  materials?: string[];
  precautions?: string[];
}

export interface PestCatalogEntry {
  id: string;
  name: string;
  scientific_name?: string;
  type: PestType;
  description: string;
  identification_tips: string[];
  symptoms: string[];
  severity_levels: Array<{
    level: SeverityLevel;
    description: string;
    color: string;
    action: string;
  }>;
  treatment_options: TreatmentOption[];
  prevention_tips: string[];
  safe_for_schools: boolean;
  common_locations: TowerLocation[];
  seasonal_info?: string;
}

// Constants
export const SEVERITY_COLORS = {
  1: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  2: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  3: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
} as const;

export const PEST_TYPE_COLORS = {
  insect: { bg: 'bg-red-100', text: 'text-red-800' },
  disease: { bg: 'bg-orange-100', text: 'text-orange-800' },
  nutrient: { bg: 'bg-blue-100', text: 'text-blue-800' },
  environmental: { bg: 'bg-green-100', text: 'text-green-800' },
} as const;

export const LOCATION_INFO = {
  indoor: {
    label: 'Indoor/Classroom',
    icon: '🏠',
    color: 'bg-blue-100 text-blue-800',
    description: 'Controlled environment with artificial lighting'
  },
  greenhouse: {
    label: 'Greenhouse',
    icon: '🌿',
    color: 'bg-green-100 text-green-800',
    description: 'Semi-controlled with natural light'
  },
  outdoor: {
    label: 'Outdoor',
    icon: '☀️',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Natural environment with full sunlight'
  }
} as const;

// Utility Functions

/**
 * Gets the appropriate CSS classes for a severity level
 */
export function getSeverityClasses(severity?: SeverityLevel) {
  if (!severity) return SEVERITY_COLORS[1];
  return SEVERITY_COLORS[severity];
}

/**
 * Gets the appropriate CSS classes for a pest type
 */
export function getPestTypeClasses(type: PestType) {
  return PEST_TYPE_COLORS[type];
}

/**
 * Gets location information
 */
export function getLocationInfo(location: TowerLocation) {
  return LOCATION_INFO[location];
}

/**
 * Determines if a scouting entry is overdue for follow-up
 */
export function isFollowUpOverdue(entry: ScoutingEntry): boolean {
  if (!entry.follow_up_needed || !entry.follow_up_date) {
    return false;
  }
  return isBefore(new Date(entry.follow_up_date), new Date());
}

/**
 * Gets the status of a scouting entry
 */
export function getScoutingEntryStatus(entry: ScoutingEntry): {
  status: 'resolved' | 'overdue' | 'follow-up' | 'active';
  label: string;
  color: string;
} {
  if (entry.resolved) {
    return {
      status: 'resolved',
      label: 'Resolved',
      color: 'bg-green-100 text-green-800'
    };
  }
  
  if (entry.follow_up_needed && entry.follow_up_date) {
    const isOverdue = isBefore(new Date(entry.follow_up_date), new Date());
    if (isOverdue) {
      return {
        status: 'overdue',
        label: 'Follow-up Overdue',
        color: 'bg-red-100 text-red-800'
      };
    } else {
      return {
        status: 'follow-up',
        label: 'Follow-up Needed',
        color: 'bg-yellow-100 text-yellow-800'
      };
    }
  }
  
  return {
    status: 'active',
    label: 'Active',
    color: 'bg-blue-100 text-blue-800'
  };
}

/**
 * Calculates priority score for sorting entries (higher = more urgent)
 */
export function calculateEntryPriority(entry: ScoutingEntry): number {
  let priority = 0;
  
  // Overdue follow-ups get highest priority
  if (isFollowUpOverdue(entry)) {
    priority += 100;
  }
  
  // Follow-up needed but not overdue
  if (entry.follow_up_needed && !isFollowUpOverdue(entry)) {
    priority += 50;
  }
  
  // Severity level affects priority
  if (entry.severity) {
    priority += entry.severity * 10;
  }
  
  // Recent entries get slight priority boost
  const daysSinceObserved = Math.floor(
    (Date.now() - new Date(entry.observed_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceObserved <= 1) {
    priority += 5;
  } else if (daysSinceObserved <= 7) {
    priority += 2;
  }
  
  return priority;
}

/**
 * Sorts scouting entries by priority (most urgent first)
 */
export function sortEntriesByPriority(entries: ScoutingEntry[]): ScoutingEntry[] {
  return [...entries].sort((a, b) => {
    const priorityA = calculateEntryPriority(a);
    const priorityB = calculateEntryPriority(b);
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Higher priority first
    }
    
    // If same priority, sort by most recent
    return new Date(b.observed_at).getTime() - new Date(a.observed_at).getTime();
  });
}

/**
 * Filters treatments by location compatibility and school safety
 */
export function getLocationAppropriateTreatments(
  treatments: TreatmentOption[],
  location: TowerLocation
): TreatmentOption[] {
  return treatments.filter(treatment => 
    treatment.safe_for_schools && 
    treatment.location_suitable.includes(location)
  ).sort((a, b) => {
    // Sort by effectiveness
    const effectivenessOrder = { high: 3, medium: 2, low: 1 };
    return effectivenessOrder[b.effectiveness] - effectivenessOrder[a.effectiveness];
  });
}

/**
 * Formats a date for display in scouting entries
 */
export function formatScoutingDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

/**
 * Formats a date and time for detailed views
 */
export function formatScoutingDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy \'at\' h:mm a');
}

/**
 * Gets suggested follow-up date based on severity and pest type
 */
export function suggestFollowUpDate(severity?: SeverityLevel, pestType?: PestType): Date {
  const baseDate = new Date();
  
  // Default to 7 days
  let daysToAdd = 7;
  
  // Adjust based on severity
  if (severity === 3) {
    daysToAdd = 2; // High severity - check in 2 days
  } else if (severity === 2) {
    daysToAdd = 4; // Medium severity - check in 4 days
  } else if (severity === 1) {
    daysToAdd = 7; // Low severity - check in a week
  }
  
  // Adjust based on pest type
  if (pestType === 'insect') {
    daysToAdd = Math.min(daysToAdd, 5); // Insects can multiply quickly
  } else if (pestType === 'disease') {
    daysToAdd = Math.min(daysToAdd, 3); // Diseases can spread rapidly
  }
  
  return addDays(baseDate, daysToAdd);
}

/**
 * Validates that required images exist and are accessible
 */
export function validateScoutingImages(images: string[]): Promise<string[]> {
  return Promise.all(
    images.map(async (imageUrl) => {
      try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        return response.ok ? imageUrl : null;
      } catch {
        return null;
      }
    })
  ).then(results => results.filter((url): url is string => url !== null));
}

/**
 * Exports scouting data to CSV format
 */
export function exportScoutingDataToCSV(entries: ScoutingEntry[]): string {
  const headers = [
    'Date Observed',
    'Tower',
    'Location',
    'Issue/Pest',
    'Type',
    'Severity',
    'Location on Tower',
    'Affected Plants',
    'Status',
    'Action Taken',
    'Treatments Applied',
    'Follow-up Date',
    'Notes'
  ];

  const rows = entries.map(entry => [
    formatScoutingDate(entry.observed_at),
    entry.tower_name || '',
    entry.tower_location || '',
    entry.pest,
    entry.pest_type || 'Custom',
    entry.severity || '',
    entry.location_on_tower || '',
    entry.affected_plants?.join(', ') || '',
    getScoutingEntryStatus(entry).label,
    entry.action || '',
    entry.treatment_applied?.join(', ') || '',
    entry.follow_up_date ? formatScoutingDate(entry.follow_up_date) : '',
    entry.notes || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Groups scouting entries by various criteria for reporting
 */
export function groupScoutingEntries(entries: ScoutingEntry[]) {
  return {
    byTower: groupBy(entries, 'tower_name'),
    byType: groupBy(entries, 'pest_type'),
    bySeverity: groupBy(entries, 'severity'),
    byStatus: entries.reduce((acc, entry) => {
      const status = getScoutingEntryStatus(entry).status;
      if (!acc[status]) acc[status] = [];
      acc[status].push(entry);
      return acc;
    }, {} as Record<string, ScoutingEntry[]>),
    byMonth: entries.reduce((acc, entry) => {
      const month = format(new Date(entry.observed_at), 'yyyy-MM');
      if (!acc[month]) acc[month] = [];
      acc[month].push(entry);
      return acc;
    }, {} as Record<string, ScoutingEntry[]>)
  };
}

/**
 * Helper function to group array by key
 */
function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const groupKey = String(item[key] || 'Unknown');
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Calculates statistics for dashboard widgets
 */
export function calculateScoutingStats(entries: ScoutingEntry[]) {
  const now = new Date();
  const oneWeekAgo = addDays(now, -7);
  const oneMonthAgo = addDays(now, -30);
  
  const active = entries.filter(e => !e.resolved);
  const resolved = entries.filter(e => e.resolved);
  const overdue = entries.filter(e => isFollowUpOverdue(e));
  const followUpNeeded = entries.filter(e => e.follow_up_needed && !e.resolved && !isFollowUpOverdue(e));
  
  const recentEntries = entries.filter(e => 
    isAfter(new Date(e.observed_at), oneWeekAgo)
  );
  
  const monthlyEntries = entries.filter(e => 
    isAfter(new Date(e.observed_at), oneMonthAgo)
  );

  return {
    total: entries.length,
    active: active.length,
    resolved: resolved.length,
    overdue: overdue.length,
    followUpNeeded: followUpNeeded.length,
    recentEntries: recentEntries.length,
    monthlyEntries: monthlyEntries.length,
    averageSeverity: entries.reduce((sum, e) => sum + (e.severity || 1), 0) / entries.length,
    resolutionRate: entries.length > 0 ? (resolved.length / entries.length) * 100 : 0,
    mostCommonPests: Object.entries(groupBy(entries, 'pest'))
      .sort(([,a], [,b]) => b.length - a.length)
      .slice(0, 5)
      .map(([pest, occurrences]) => ({ pest, count: occurrences.length }))
  };
}