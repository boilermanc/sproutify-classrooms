import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format subscription plan names for display
export function formatPlanName(planName: string | null | undefined): string {
  if (!planName) return 'Free'
  
  // Handle the format: "basic_annual" -> "Basic Annual"
  const parts = planName.split('_')
  if (parts.length === 2) {
    const [plan, period] = parts
    return `${plan.charAt(0).toUpperCase() + plan.slice(1)} ${period.charAt(0).toUpperCase() + period.slice(1)}`
  }
  
  // Handle single word plans: "basic" -> "Basic"
  return planName.charAt(0).toUpperCase() + planName.slice(1)
}

// Capitalize subscription status for display
export function capitalizeSubscriptionStatus(status: string | null | undefined): string {
  if (!status) return 'Free'
  
  // Handle special cases
  switch (status) {
    case 'past_due':
      return 'Past Due'
    case 'canceled':
      return 'Canceled'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}