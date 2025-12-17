/**
 * Network connectivity and error handling utilities
 * Handles network errors gracefully with retry logic
 */

import { logError } from './errorLogger';

// Cache network state to avoid repeated checks
let networkStateCache = null;
let lastNetworkCheck = 0;
const NETWORK_CHECK_CACHE_DURATION = 5000; // 5 seconds

/**
 * Check if device has network connection
 * Uses cached result to avoid performance impact
 */
export const checkNetworkConnection = async (useCache = true) => {
    const now = Date.now();
    
    // Return cached result if still valid
    if (useCache && networkStateCache !== null && (now - lastNetworkCheck) < NETWORK_CHECK_CACHE_DURATION) {
        return networkStateCache;
    }

    try {
        // For React Native, you can use @react-native-community/netinfo
        // For now, we'll use a simple approach that doesn't require additional dependencies
        // In production, install: npm install @react-native-community/netinfo
        
        // Fallback: Assume connected if we can't check (to avoid blocking operations)
        // In production, implement proper network checking
        const isConnected = true; // Placeholder - implement with NetInfo
        
        networkStateCache = isConnected;
        lastNetworkCheck = now;
        
        return isConnected;
    } catch (error) {
        logError('NETWORK_CHECK_ERROR', error);
        // Default to true to avoid blocking operations
        return true;
    }
};

/**
 * Handle network-related errors and return user-friendly messages
 */
export const handleNetworkError = (error) => {
    const errorCode = error?.code || '';
    const errorMessage = error?.message || '';

    // Firebase network errors
    if (errorCode === 'unavailable' || errorMessage.includes('network') || errorMessage.includes('Network')) {
        return {
            userMessage: 'No internet connection. Please check your network and try again.',
            retryable: true,
            errorCode: 'NETWORK_ERROR',
            shouldRetry: true
        };
    }

    // Timeout errors
    if (errorCode === 'deadline-exceeded' || errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
        return {
            userMessage: 'Request timed out. Please try again.',
            retryable: true,
            errorCode: 'TIMEOUT_ERROR',
            shouldRetry: true
        };
    }

    // Connection errors
    if (errorCode === 'unavailable' || errorMessage.includes('connection') || errorMessage.includes('Connection')) {
        return {
            userMessage: 'Connection error. Please try again.',
            retryable: true,
            errorCode: 'CONNECTION_ERROR',
            shouldRetry: true
        };
    }

    // Default network error
    return {
        userMessage: 'Network error. Please check your connection and try again.',
        retryable: true,
        errorCode: 'NETWORK_ERROR',
        shouldRetry: true
    };
};

/**
 * Clear network state cache (useful for testing or manual refresh)
 */
export const clearNetworkCache = () => {
    networkStateCache = null;
    lastNetworkCheck = 0;
};

