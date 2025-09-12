// Promotional Pricing Configuration
// This controls when promotional pricing is automatically applied

export const PROMOTIONAL_PRICING_CONFIG = {
  // Enable/disable promotional pricing
  enabled: true,
  
  // Promotional pricing schedule
  schedule: {
    // Start date for promotional pricing (ISO string)
    startDate: '2025-01-01T00:00:00Z',
    
    // End date for promotional pricing (ISO string)
    endDate: '2025-01-31T23:59:59Z', // End of January 2025
    
    // Timezone for date calculations
    timezone: 'America/New_York'
  },
  
  // Which plans get promotional pricing
  eligiblePlans: ['basic', 'professional', 'school', 'district'],
  
  // Promotional pricing rules
  rules: {
    // Always use promotional pricing during the promotional period
    autoApply: true,
    
    // Show promotional pricing on pricing page during promotional period
    showOnPricingPage: true,
    
    // Allow manual override (for testing)
    allowManualOverride: true
  }
};

// Function to check if promotional pricing should be active
export const isPromotionalPricingActive = (): boolean => {
  if (!PROMOTIONAL_PRICING_CONFIG.enabled) {
    return false;
  }
  
  const now = new Date();
  const startDate = new Date(PROMOTIONAL_PRICING_CONFIG.schedule.startDate);
  const endDate = new Date(PROMOTIONAL_PRICING_CONFIG.schedule.endDate);
  
  return now >= startDate && now <= endDate;
};

// Function to get promotional pricing info
export const getPromotionalPricingInfo = () => {
  const isActive = isPromotionalPricingActive();
  const endDate = new Date(PROMOTIONAL_PRICING_CONFIG.schedule.endDate);
  
  return {
    isActive,
    endDate: endDate.toISOString(),
    daysRemaining: isActive ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0,
    message: isActive ? `Promotional pricing ends in ${Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days` : 'Promotional pricing has ended'
  };
};
