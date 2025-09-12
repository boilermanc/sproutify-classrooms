// src/config/plans.ts - Shared plan configuration

export interface PlanLimits {
  max_towers: number;
  max_students: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  basic: {
    max_towers: 3,
    max_students: 50
  },
  professional: {
    max_towers: 10,
    max_students: 200
  },
  school: {
    max_towers: 999999, // "Unlimited"
    max_students: 999999 // "Unlimited"
  },
  district: {
    max_towers: 999999, // "Unlimited"
    max_students: 999999 // "Unlimited"
  }
};

export function getPlanLimits(planId: string): PlanLimits {
  return PLAN_LIMITS[planId] || PLAN_LIMITS.basic; // Default to basic if not found
}
