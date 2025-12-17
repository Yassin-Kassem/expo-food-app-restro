/**
 * Error logging utility for production error tracking
 * Uses console in development, can be extended with Sentry/other services
 */

const isDevelopment = __DEV__;

/**
 * Log errors with context for debugging and monitoring
 * @param {string} errorType - Category of error (e.g., 'AUTH_ERROR', 'NETWORK_ERROR')
 * @param {Error|Object} error - The error object or error message
 * @param {Object} context - Additional context about the error
 */
export const logError = (errorType, error, context = {}) => {
    const errorMessage = error?.message || error?.toString() || String(error);
    const errorCode = error?.code || 'UNKNOWN';
    const errorStack = error?.stack;
    
    // Log to console in development
    if (isDevelopment) {
        console.error(`[${errorType}] ${errorCode}: ${errorMessage}`);
        if (context && Object.keys(context).length > 0) {
            console.error(`  Context:`, JSON.stringify(context));
        }
        if (errorStack) {
            console.error(`  Stack:`, errorStack);
        }
    }

    // In production, you can integrate with error tracking services
    // Example: Sentry.captureException(error, { tags: { errorType }, extra: context });
    
    // Optional: Log to analytics
    // analytics.logEvent('error', { errorType, error: errorMessage, ...context });
};

/**
 * Log warnings for non-critical issues
 */
export const logWarning = (warningType, message, context = {}) => {
    if (isDevelopment) {
        console.warn(`[${warningType}]`, message, context);
    }
};

/**
 * Log info messages for debugging
 */
export const logInfo = (infoType, message, context = {}) => {
    if (isDevelopment) {
        console.log(`[${infoType}]`, message, context);
    }
};

