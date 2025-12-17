import { firebaseAuth } from '../config/firebase.config';
import { logError } from '../utils/errorLogger';
import { handleNetworkError } from '../utils/networkHandler';

/**
 * Sign in with email and password
 */
export const signIn = async (email, password) => {
    try {
        if (!email || !password) {
            return { 
                success: false, 
                error: 'Email and password are required',
                errorCode: 'VALIDATION_ERROR',
                retryable: false
            };
        }

        const userCredential = await firebaseAuth().signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        try {
            // Extract error code from error object (handles both error.code and error.message)
            const errorCode = error?.code || error?.message || 'unknown';
            const errorInfo = getErrorMessage(errorCode);
            logError('SIGN_IN_ERROR', error, { email, errorCode });
            
            // Check for network errors
            if (errorCode === 'auth/network-request-failed') {
                const networkError = handleNetworkError(error);
                return {
                    success: false,
                    error: networkError.userMessage,
                    errorCode: networkError.errorCode,
                    retryable: networkError.retryable
                };
            }
            
            return { 
                success: false, 
                error: errorInfo.message,
                errorCode: errorInfo.code,
                retryable: errorInfo.retryable || false
            };
        } catch (nestedError) {
            // Fallback error handling to prevent unhandled promise rejections
            logError('SIGN_IN_NESTED_ERROR', nestedError, { originalError: error });
            return {
                success: false,
                error: 'Something went wrong while signing in. Please try again later.',
                errorCode: 'UNKNOWN_ERROR',
                retryable: true
            };
        }
    }
};

/**
 * Sign up with email and password
 */
export const signUp = async (email, password, fullName) => {
    try {
        if (!email || !password) {
            return { 
                success: false, 
                error: 'Email and password are required',
                errorCode: 'VALIDATION_ERROR',
                retryable: false
            };
        }

        const userCredential = await firebaseAuth().createUserWithEmailAndPassword(email, password);

        if (fullName) {
            try {
                await userCredential.user.updateProfile({
                    displayName: fullName
                });
            } catch (profileError) {
                // Log but don't fail signup if profile update fails
                logError('UPDATE_PROFILE_ERROR', profileError, { uid: userCredential.user.uid });
            }
        }

        return { success: true, user: userCredential.user };
    } catch (error) {
        try {
            // Extract error code from error object (handles both error.code and error.message)
            const errorCode = error?.code || error?.message || 'unknown';
            const errorInfo = getErrorMessage(errorCode);
            logError('SIGN_UP_ERROR', error, { email, errorCode });
            
            // Check for network errors
            if (errorCode === 'auth/network-request-failed') {
                const networkError = handleNetworkError(error);
                return {
                    success: false,
                    error: networkError.userMessage,
                    errorCode: networkError.errorCode,
                    retryable: networkError.retryable
                };
            }
            
            return { 
                success: false, 
                error: errorInfo.message,
                errorCode: errorInfo.code,
                retryable: errorInfo.retryable || false
            };
        } catch (nestedError) {
            // Fallback error handling to prevent unhandled promise rejections
            logError('SIGN_UP_NESTED_ERROR', nestedError, { originalError: error });
            return {
                success: false,
                error: 'Something went wrong while signing up. Please try again later.',
                errorCode: 'UNKNOWN_ERROR',
                retryable: true
            };
        }
    }
};

/**
 * Sign out current user
 */
export const signOut = async () => {
    try {
        await firebaseAuth().signOut();
        return { success: true };
    } catch (error) {
        logError('SIGN_OUT_ERROR', error);
        return { 
            success: false, 
            error: 'Failed to sign out. Please try again.',
            errorCode: 'SIGN_OUT_ERROR',
            retryable: true
        };
    }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
    try {
        const user = firebaseAuth().currentUser;
        if (!user) {
            logError('AUTH_ERROR', new Error('No authenticated user'), {});
            return null;
        }
        return user;
    } catch (error) {
        logError('GET_CURRENT_USER_ERROR', error);
        return null;
    }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChanged = (callback) => {
    try {
        return firebaseAuth().onAuthStateChanged(
            (user) => {
                try {
                    callback(user);
                } catch (error) {
                    logError('AUTH_STATE_CALLBACK_ERROR', error);
                }
            },
            (error) => {
                logError('AUTH_STATE_CHANGED_ERROR', error);
                callback(null);
            }
        );
    } catch (error) {
        logError('AUTH_STATE_LISTENER_ERROR', error);
        return () => {};
    }
};

/**
 * Convert Firebase error codes to user-friendly messages
 * Handles all Firebase auth error codes with specific, user-friendly messages
 */
const getErrorMessage = (errorCode) => {
    // Handle both error.code and error.message formats
    const code = errorCode || 'unknown';
    
    switch (code) {
        case 'auth/invalid-email':
            return { 
                message: 'That email address is invalid. Please check and try again.', 
                code: 'INVALID_EMAIL', 
                retryable: false 
            };
        case 'auth/user-disabled':
            return { 
                message: 'This account has been disabled. Please contact support.', 
                code: 'USER_DISABLED', 
                retryable: false 
            };
        case 'auth/user-not-found':
            return { 
                message: 'No account found with that email address.', 
                code: 'USER_NOT_FOUND', 
                retryable: false 
            };
        case 'auth/wrong-password':
            return { 
                message: 'Incorrect password. Please try again.', 
                code: 'WRONG_PASSWORD', 
                retryable: false 
            };
        case 'auth/invalid-credential':
            return { 
                message: 'Your login credentials are invalid or expired. Please try signing in again.', 
                code: 'INVALID_CREDENTIAL', 
                retryable: false 
            };
        case 'auth/email-already-in-use':
            return { 
                message: 'An account already exists with this email address.', 
                code: 'EMAIL_IN_USE', 
                retryable: false 
            };
        case 'auth/weak-password':
            return { 
                message: 'Password should be at least 6 characters long.', 
                code: 'WEAK_PASSWORD', 
                retryable: false 
            };
        case 'auth/network-request-failed':
            return { 
                message: 'Network error. Please check your internet connection and try again.', 
                code: 'NETWORK_ERROR', 
                retryable: true 
            };
        case 'auth/too-many-requests':
            return { 
                message: 'Too many unsuccessful login attempts. Please wait a few minutes before trying again.', 
                code: 'TOO_MANY_REQUESTS', 
                retryable: true 
            };
        case 'auth/operation-not-allowed':
            return { 
                message: 'This operation is not allowed. Please contact support.', 
                code: 'OPERATION_NOT_ALLOWED', 
                retryable: false 
            };
        default:
            // Handle Firebase errors that might not be explicitly listed
            if (code.includes('FirebaseError') || code.includes('auth/')) {
                return { 
                    message: 'Something went wrong while signing in. Please try again later.', 
                    code: 'UNKNOWN_ERROR', 
                    retryable: true 
                };
            }
            // For non-Firebase errors
            return { 
                message: 'Something went wrong while signing in. Please try again later.', 
                code: 'UNKNOWN_ERROR', 
                retryable: true 
            };
    }
};
