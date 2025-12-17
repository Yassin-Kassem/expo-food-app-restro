/**
 * Helper functions for testing error scenarios in development
 * These can be imported and used to simulate various error conditions
 */

/**
 * Simulate network error
 */
export const simulateNetworkError = () => {
    const error = new Error('Network request failed');
    error.code = 'unavailable';
    error.message = 'Network error';
    throw error;
};

/**
 * Simulate timeout error
 */
export const simulateTimeoutError = () => {
    const error = new Error('Request timeout');
    error.code = 'deadline-exceeded';
    throw error;
};

/**
 * Simulate permission denied error
 */
export const simulatePermissionError = () => {
    const error = new Error('Permission denied');
    error.code = 'permission-denied';
    throw error;
};

/**
 * Simulate not found error
 */
export const simulateNotFoundError = () => {
    const error = new Error('Resource not found');
    error.code = 'not-found';
    throw error;
};

/**
 * Simulate quota exceeded error
 */
export const simulateQuotaError = () => {
    const error = new Error('Quota exceeded');
    error.code = 'resource-exhausted';
    throw error;
};

/**
 * Simulate validation error
 */
export const simulateValidationError = () => {
    return {
        success: false,
        error: 'Validation failed',
        errorCode: 'VALIDATION_ERROR',
        errors: {
            name: 'Name is required',
            email: 'Invalid email format'
        },
        retryable: false
    };
};

/**
 * Delay execution to simulate slow network
 */
export const simulateSlowNetwork = async (delay = 3000) => {
    await new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Randomly throw errors for testing
 */
export const randomError = (probability = 0.3) => {
    if (Math.random() < probability) {
        const errors = [
            simulateNetworkError,
            simulateTimeoutError,
            simulatePermissionError
        ];
        const randomError = errors[Math.floor(Math.random() * errors.length)];
        randomError();
    }
};

/**
 * Test component for triggering errors
 * Add this to any screen for quick testing
 */
export const ErrorTestButtons = ({ onError }) => {
    const handleTest = async (errorFn) => {
        try {
            errorFn();
        } catch (error) {
            if (onError) {
                onError(error);
            } else {
                console.error('Test error:', error);
            }
        }
    };

    return {
        testNetwork: () => handleTest(simulateNetworkError),
        testTimeout: () => handleTest(simulateTimeoutError),
        testPermission: () => handleTest(simulatePermissionError),
        testNotFound: () => handleTest(simulateNotFoundError),
        testQuota: () => handleTest(simulateQuotaError),
        testValidation: () => {
            const result = simulateValidationError();
            console.log('Validation error:', result);
        }
    };
};

/**
 * Wrap a function to randomly fail for testing
 */
export const withRandomFailure = (fn, failureRate = 0.2) => {
    return async (...args) => {
        if (Math.random() < failureRate) {
            throw simulateNetworkError();
        }
        return fn(...args);
    };
};

/**
 * Create a test error service wrapper
 * Use this to wrap service calls for testing
 */
export const createTestErrorWrapper = (serviceFn, options = {}) => {
    const {
        errorType = 'network',
        probability = 0,
        enabled = __DEV__
    } = options;

    if (!enabled) {
        return serviceFn;
    }

    return async (...args) => {
        if (Math.random() < probability) {
            switch (errorType) {
                case 'network':
                    throw simulateNetworkError();
                case 'timeout':
                    throw simulateTimeoutError();
                case 'permission':
                    throw simulatePermissionError();
                case 'notfound':
                    throw simulateNotFoundError();
                case 'quota':
                    throw simulateQuotaError();
                default:
                    throw simulateNetworkError();
            }
        }
        return serviceFn(...args);
    };
};

