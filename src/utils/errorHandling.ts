// src/utils/errorHandling.ts
// Comprehensive error handling utilities

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface ErrorInfo {
  message: string;
  code?: string;
  context?: ErrorContext;
  originalError?: Error;
  userMessage?: string;
  retryable?: boolean;
}

export class AppError extends Error {
  public readonly code?: string;
  public readonly context?: ErrorContext;
  public readonly originalError?: Error;
  public readonly userMessage?: string;
  public readonly retryable?: boolean;

  constructor(errorInfo: ErrorInfo) {
    super(errorInfo.message);
    this.name = 'AppError';
    this.code = errorInfo.code;
    this.context = errorInfo.context;
    this.originalError = errorInfo.originalError;
    this.userMessage = errorInfo.userMessage;
    this.retryable = errorInfo.retryable;
  }
}

// Error codes for consistent error handling
export const ErrorCodes = {
  // Authentication errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Database errors
  DB_CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  DB_CONSTRAINT_VIOLATION: 'DB_CONSTRAINT_VIOLATION',
  DB_RECORD_NOT_FOUND: 'DB_RECORD_NOT_FOUND',
  DB_DUPLICATE_RECORD: 'DB_DUPLICATE_RECORD',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  API_ERROR: 'API_ERROR',
  
  // Permission errors
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Business logic errors
  SUBSCRIPTION_LIMIT_EXCEEDED: 'SUBSCRIPTION_LIMIT_EXCEEDED',
  RESOURCE_NOT_AVAILABLE: 'RESOURCE_NOT_AVAILABLE',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  
  // External service errors
  WEBHOOK_FAILED: 'WEBHOOK_FAILED',
  EMAIL_SERVICE_ERROR: 'EMAIL_SERVICE_ERROR',
  PAYMENT_SERVICE_ERROR: 'PAYMENT_SERVICE_ERROR',
  
  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const;

// Error message mappings for user-friendly messages
export const ErrorMessages = {
  [ErrorCodes.AUTH_REQUIRED]: 'Please log in to continue',
  [ErrorCodes.AUTH_INVALID]: 'Invalid login credentials',
  [ErrorCodes.AUTH_EXPIRED]: 'Your session has expired. Please log in again',
  
  [ErrorCodes.VALIDATION_FAILED]: 'Please check your input and try again',
  [ErrorCodes.REQUIRED_FIELD_MISSING]: 'Please fill in all required fields',
  [ErrorCodes.INVALID_FORMAT]: 'Please check the format of your input',
  
  [ErrorCodes.DB_CONNECTION_FAILED]: 'Unable to connect to the database. Please try again later',
  [ErrorCodes.DB_QUERY_FAILED]: 'Database operation failed. Please try again',
  [ErrorCodes.DB_CONSTRAINT_VIOLATION]: 'This action conflicts with existing data',
  [ErrorCodes.DB_RECORD_NOT_FOUND]: 'The requested item was not found',
  [ErrorCodes.DB_DUPLICATE_RECORD]: 'This item already exists',
  
  [ErrorCodes.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection',
  [ErrorCodes.TIMEOUT_ERROR]: 'Request timed out. Please try again',
  [ErrorCodes.API_ERROR]: 'Service temporarily unavailable. Please try again later',
  
  [ErrorCodes.PERMISSION_DENIED]: 'You do not have permission to perform this action',
  [ErrorCodes.INSUFFICIENT_PERMISSIONS]: 'Your account does not have the required permissions',
  
  [ErrorCodes.SUBSCRIPTION_LIMIT_EXCEEDED]: 'You have reached your subscription limit',
  [ErrorCodes.RESOURCE_NOT_AVAILABLE]: 'This resource is currently unavailable',
  [ErrorCodes.OPERATION_NOT_ALLOWED]: 'This operation is not allowed',
  
  [ErrorCodes.WEBHOOK_FAILED]: 'External service notification failed',
  [ErrorCodes.EMAIL_SERVICE_ERROR]: 'Email service temporarily unavailable',
  [ErrorCodes.PAYMENT_SERVICE_ERROR]: 'Payment processing failed',
  
  [ErrorCodes.UNKNOWN_ERROR]: 'An unexpected error occurred',
  [ErrorCodes.INTERNAL_ERROR]: 'Internal server error. Please try again later'
} as const;

// Error handling utilities
export function createError(
  code: keyof typeof ErrorCodes,
  message?: string,
  context?: ErrorContext,
  originalError?: Error
): AppError {
  return new AppError({
    message: message || ErrorMessages[code] || 'An error occurred',
    code,
    context: {
      ...context,
      timestamp: new Date().toISOString()
    },
    originalError,
    userMessage: ErrorMessages[code],
    retryable: isRetryableError(code)
  });
}

export function isRetryableError(code: keyof typeof ErrorCodes): boolean {
  const retryableCodes = [
    ErrorCodes.NETWORK_ERROR,
    ErrorCodes.TIMEOUT_ERROR,
    ErrorCodes.DB_CONNECTION_FAILED,
    ErrorCodes.API_ERROR,
    ErrorCodes.EMAIL_SERVICE_ERROR,
    ErrorCodes.PAYMENT_SERVICE_ERROR
  ];
  
  return retryableCodes.includes(code);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage || error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return ErrorMessages[ErrorCodes.UNKNOWN_ERROR];
}

export function getErrorCode(error: unknown): string {
  if (error instanceof AppError) {
    return error.code || ErrorCodes.UNKNOWN_ERROR;
  }
  
  return ErrorCodes.UNKNOWN_ERROR;
}

// Error logging utility
export function logError(error: unknown, context?: ErrorContext): void {
  const errorInfo = {
    message: getErrorMessage(error),
    code: getErrorCode(error),
    context: {
      ...context,
      timestamp: new Date().toISOString()
    },
    stack: error instanceof Error ? error.stack : undefined
  };
  
  console.error('Application Error:', errorInfo);
  
  // In production, you might want to send this to an error tracking service
  if (import.meta.env.PROD) {
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }
}

// Retry utility for retryable operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !isRetryableError(getErrorCode(error))) {
        throw error;
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
}

// Safe async operation wrapper
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback?: T,
  context?: ErrorContext
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    logError(error, context);
    return fallback;
  }
}

// Error boundary helper for React components
export function createErrorBoundaryHandler(componentName: string) {
  return (error: Error, errorInfo: React.ErrorInfo) => {
    logError(error, {
      component: componentName,
      action: 'component_error',
      metadata: {
        componentStack: errorInfo.componentStack
      }
    });
  };
}

// Database error handling
export function handleDatabaseError(error: any): AppError {
  if (error?.code === '23505') {
    return createError(ErrorCodes.DB_DUPLICATE_RECORD, 'This record already exists');
  }
  
  if (error?.code === '23503') {
    return createError(ErrorCodes.DB_CONSTRAINT_VIOLATION, 'This action conflicts with existing data');
  }
  
  if (error?.code === 'PGRST116') {
    return createError(ErrorCodes.DB_RECORD_NOT_FOUND, 'The requested item was not found');
  }
  
  if (error?.message?.includes('JWT')) {
    return createError(ErrorCodes.AUTH_INVALID, 'Authentication failed');
  }
  
  return createError(ErrorCodes.DB_QUERY_FAILED, error?.message || 'Database operation failed');
}

// Network error handling
export function handleNetworkError(error: any): AppError {
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('fetch')) {
    return createError(ErrorCodes.NETWORK_ERROR, 'Network connection failed');
  }
  
  if (error?.code === 'TIMEOUT') {
    return createError(ErrorCodes.TIMEOUT_ERROR, 'Request timed out');
  }
  
  if (error?.status >= 400 && error?.status < 500) {
    return createError(ErrorCodes.API_ERROR, `Client error: ${error.status}`);
  }
  
  if (error?.status >= 500) {
    return createError(ErrorCodes.API_ERROR, `Server error: ${error.status}`);
  }
  
  return createError(ErrorCodes.NETWORK_ERROR, error?.message || 'Network error occurred');
}
