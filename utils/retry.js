/**
 * Retry logic for transient errors
 * Implements exponential backoff to avoid overwhelming the server
 */

import { logError } from './errorLogger';

/**
 * Retry an operation with exponential backoff
 * @param {Function} operation - Async function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} Result of the operation
 */
export const retryOperation = async (
    operation,
    options = {}
) => {
    const {
        maxRetries = 3,
        initialDelay = 1000,
        maxDelay = 10000,
        shouldRetry = (error) => error?.retryable !== false,
        onRetry = null
    } = options;

    let lastError;
    let delay = initialDelay;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await operation();
            
            // If result has success property, check it
            if (result && typeof result === 'object' && 'success' in result) {
                if (result.success) {
                    return result;
                }
                
                // Check if we should retry based on result
                if (!shouldRetry(result) || attempt === maxRetries) {
                    return result;
                }
                
                lastError = result;
            } else {
                // Operation succeeded (no error thrown)
                return result;
            }
        } catch (error) {
            // Check if we should retry this error
            if (!shouldRetry(error) || attempt === maxRetries) {
                throw error;
            }
            
            lastError = error;
            
            // Call onRetry callback if provided
            if (onRetry) {
                onRetry(attempt, error);
            }
        }
        
        // Exponential backoff with jitter
        if (attempt < maxRetries) {
            const jitter = Math.random() * 0.3 * delay; // Add up to 30% jitter
            const backoffDelay = Math.min(delay + jitter, maxDelay);
            
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            delay = Math.min(delay * 2, maxDelay); // Double delay for next retry
        }
    }
    
    // If we have a lastError that's not an exception, return it
    if (lastError && typeof lastError === 'object' && 'success' in lastError) {
        return lastError;
    }
    
    throw lastError || new Error('Operation failed after retries');
};

/**
 * Create a retryable wrapper for async functions
 */
export const withRetry = (operation, options = {}) => {
    return (...args) => retryOperation(() => operation(...args), options);
};

