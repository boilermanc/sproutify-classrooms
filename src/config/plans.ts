// src/config/plans.ts - Shared plan configuration

// Constants for unlimited plans
export const UNLIMITED = Number.MAX_SAFE_INTEGER;

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
    max_towers: UNLIMITED, // "Unlimited"
    max_students: UNLIMITED // "Unlimited"
  },
  district: {
    max_towers: UNLIMITED, // "Unlimited"
    max_students: UNLIMITED // "Unlimited"
  }
};

export function getPlanLimits(planId: string): PlanLimits {
  return PLAN_LIMITS[planId] || PLAN_LIMITS.basic; // Default to basic if not found
}

export function isUnlimited(limit: number): boolean {
  return limit === UNLIMITED;
}
