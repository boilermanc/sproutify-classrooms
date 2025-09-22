// src/utils/webhooks.ts
// Utility function to send registration data to n8n webhook

import { envConfig } from '@/utils/envValidation';

interface WebhookData {
  event: 'user_registered' | 'payment_success' | 'trial_ending' | 'user_cancelled' | 'signup' | 'registration' | 'new_user' | 'purchase_completed';
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    schoolName: string;
  };
  subscription: {
    plan: 'basic' | 'professional' | 'school' | 'district';
    status: 'trial' | 'active' | 'cancelled' | 'expired';
    billingPeriod: 'monthly' | 'annual';
    trialEndsAt?: string;
    subscriptionEndsAt?: string;
  };
  mailerlite: {
    targetGroup: string; // e.g., 'Individual_Teacher_Trial'
    emailSequence: string; // e.g., 'welcome_trial'
    fields?: {
      [key: string]: string;
    };
  };
  metadata?: {
    source?: string;
    utmCampaign?: string;
    referrer?: string;
    userAgent?: string;
    timestamp?: string;
    [key: string]: unknown;
  };
}

// Environment variable for n8n webhook URL
const N8N_WEBHOOK_URL = envConfig.VITE_N8N_WEBHOOK_URL;

export async function sendToN8nWebhook(data: WebhookData): Promise<boolean> {
  if (!N8N_WEBHOOK_URL) {
    console.warn('N8N_WEBHOOK_URL not configured');
    return false;
  }

  try {
    const payload = {
      ...data,
      timestamp: new Date().toISOString(),
      environment: import.meta.env.MODE, // 'development' or 'production'
    };
    
    console.log('Sending webhook payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Source': 'sproutify-school',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook response error:', response.status, response.statusText, errorText);
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    console.log('Successfully sent to n8n webhook:', data.event);
    return true;
    
  } catch (error) {
    console.error('n8n webhook error:', error);
    // Don't fail the user registration if webhook fails
    return false;
  }
}

// Helper function to determine MailerLite group based on plan
export function getMailerLiteGroup(plan: string, status: string = 'trial'): string {
  if (status === 'trial') {
    switch (plan) {
      case 'basic':
        return 'Individual_Teacher_Trial';
      case 'professional':
        return 'Professional_Teacher_Trial';
      case 'school':
        return 'School_Classroom_Trial';
      case 'district':
        return 'District_Trial';
      default:
        return 'Individual_Teacher_Trial';
    }
  } else if (status === 'active') {
    switch (plan) {
      case 'basic':
        return 'Individual_Teacher_Paid';
      case 'professional':
        return 'Professional_Teacher_Paid';
      case 'school':
        return 'School_Classroom_Paid';
      case 'district':
        return 'District_Paid';
      default:
        return 'Individual_Teacher_Paid';
    }
  }
  
  return 'Individual_Teacher_Trial';
}

// Helper function for registration webhook
export async function sendRegistrationWebhook(userData: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  schoolName: string;
  plan: 'basic' | 'professional' | 'school' | 'district';
  trialEndsAt: string;
}): Promise<boolean> {
  
  const mailerliteGroup = getMailerLiteGroup(userData.plan, 'trial');
  const now = new Date().toISOString();
  
  // Send the exact format expected by n8n workflow
  const payload = {
    event: 'user_registered',
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    schoolName: userData.schoolName,
    plan: userData.plan,
    trialEndsAt: userData.trialEndsAt,
    mailerliteGroup: mailerliteGroup,
    timestamp: now,
  };
  
  try {
    const response = await fetch(N8N_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return true;
    } else {
      console.error('n8n webhook failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('n8n webhook error:', error);
    return false;
  }
}

// Helper function for payment success webhook
export async function sendPaymentSuccessWebhook(userData: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  schoolName: string;
  plan: 'basic' | 'professional' | 'school' | 'district';
  billingPeriod: 'monthly' | 'annual';
  subscriptionEndsAt: string;
}): Promise<boolean> {
  
  const mailerliteGroup = getMailerLiteGroup(userData.plan, 'active');
  const now = new Date().toISOString();
  
  const payload = {
    event: 'payment_success',
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    schoolName: userData.schoolName,
    plan: userData.plan,
    billingPeriod: userData.billingPeriod,
    subscriptionEndsAt: userData.subscriptionEndsAt,
    mailerliteGroup: mailerliteGroup,
    timestamp: now,
  };
  
  try {
    const response = await fetch(N8N_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return true;
    } else {
      console.error('Payment success webhook failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Payment success webhook error:', error);
    return false;
  }
}

// Helper function for trial ending webhook
export async function sendTrialEndingWebhook(userData: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  schoolName: string;
  plan: 'basic' | 'professional' | 'school' | 'district';
  trialEndsAt: string;
}): Promise<boolean> {
  
  const mailerliteGroup = getMailerLiteGroup(userData.plan, 'trial');
  const now = new Date().toISOString();
  
  const payload = {
    event: 'trial_ending',
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    schoolName: userData.schoolName,
    plan: userData.plan,
    trialEndsAt: userData.trialEndsAt,
    mailerliteGroup: mailerliteGroup,
    timestamp: now,
  };
  
  try {
    const response = await fetch(N8N_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return true;
    } else {
      console.error('Trial ending webhook failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Trial ending webhook error:', error);
    return false;
  }
}

// Helper function for user cancellation webhook
export async function sendUserCancelledWebhook(userData: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  schoolName: string;
  plan: 'basic' | 'professional' | 'school' | 'district';
}): Promise<boolean> {
  
  const mailerliteGroup = getMailerLiteGroup(userData.plan, 'cancelled');
  const now = new Date().toISOString();
  
  const payload = {
    event: 'user_cancelled',
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    schoolName: userData.schoolName,
    plan: userData.plan,
    mailerliteGroup: mailerliteGroup,
    timestamp: now,
  };
  
  try {
    const response = await fetch(N8N_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return true;
    } else {
      console.error('User cancelled webhook failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('User cancelled webhook error:', error);
    return false;
  }
}

// Helper function for purchase completion webhook
export async function sendPurchaseWebhook(userData: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  schoolName: string;
  plan: 'basic' | 'professional' | 'school' | 'district';
  billingPeriod: 'monthly' | 'annual';
  subscriptionEndsAt: string;
  amount?: number;
  currency?: string;
}): Promise<boolean> {
  
  const mailerliteGroup = getMailerLiteGroup(userData.plan, 'active');
  const now = new Date().toISOString();
  
  const payload = {
    event: 'purchase_completed',
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    schoolName: userData.schoolName,
    plan: userData.plan,
    billingPeriod: userData.billingPeriod,
    subscriptionEndsAt: userData.subscriptionEndsAt,
    amount: userData.amount,
    currency: userData.currency || 'usd',
    mailerliteGroup: mailerliteGroup,
    timestamp: now,
  };
  
  try {
    const response = await fetch(N8N_WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('Purchase webhook sent successfully for:', userData.email);
      return true;
    } else {
      console.error('Purchase webhook failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Purchase webhook error:', error);
    return false;
  }
}
