/**
 * Toast notification utilities
 * Provides user-friendly error, success, and warning messages
 * 
 * Note: This is a simple implementation. For production, consider using
 * react-native-toast-message or similar library for better UX
 */

// Simple toast implementation
// In production, replace with a proper toast library like react-native-toast-message

/**
 * Show error toast message
 */
export const showErrorToast = (message, title = 'Error') => {
    // In production, use a toast library
    // For now, use Alert as fallback
    if (__DEV__) {
        console.error(`[ERROR] ${title}: ${message}`);
    }
    
    // You can integrate react-native-toast-message here:
    // Toast.show({
    //     type: 'error',
    //     text1: title,
    //     text2: message,
    //     position: 'top',
    // });
};

/**
 * Show success toast message
 */
export const showSuccessToast = (message, title = 'Success') => {
    if (__DEV__) {
        console.log(`[SUCCESS] ${title}: ${message}`);
    }
    
    // You can integrate react-native-toast-message here:
    // Toast.show({
    //     type: 'success',
    //     text1: title,
    //     text2: message,
    //     position: 'top',
    // });
};

/**
 * Show warning toast message
 */
export const showWarningToast = (message, title = 'Warning') => {
    if (__DEV__) {
        console.warn(`[WARNING] ${title}: ${message}`);
    }
    
    // You can integrate react-native-toast-message here:
    // Toast.show({
    //     type: 'info',
    //     text1: title,
    //     text2: message,
    //     position: 'top',
    // });
};

/**
 * Show info toast message
 */
export const showInfoToast = (message, title = 'Info') => {
    if (__DEV__) {
        console.info(`[INFO] ${title}: ${message}`);
    }
};

