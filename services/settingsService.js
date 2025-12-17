import { firebaseFirestore } from '../config/firebase.config';
import { getCurrentUser } from './authService';
import { logError } from '../utils/errorLogger';
import { handleNetworkError } from '../utils/networkHandler';

/**
 * Get app settings for current user
 */
export const getAppSettings = async () => {
    try {
        const user = getCurrentUser();
        if (!user) {
            return { 
                success: false, 
                error: 'User not authenticated',
                errorCode: 'AUTH_ERROR',
                retryable: false
            };
        }

        const userDoc = await firebaseFirestore().collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            return { 
                success: true, 
                data: { notificationsEnabled: true, printerSettings: {} } 
            };
        }

        const data = userDoc.data();
        return {
            success: true,
            data: {
                notificationsEnabled: data.notificationsEnabled ?? true,
                printerSettings: data.printerSettings || {}
            }
        };
    } catch (error) {
        logError('GET_APP_SETTINGS_ERROR', error);
        
        if (error.code === 'permission-denied') {
            return { 
                success: false, 
                error: 'Permission denied. Please contact support.',
                errorCode: 'PERMISSION_DENIED',
                retryable: false
            };
        }

        if (error.code === 'unavailable' || error.message?.includes('network')) {
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
            error: 'Failed to get settings',
            errorCode: 'UNKNOWN_ERROR',
            retryable: true
        };
    }
};

/**
 * Update app settings for current user
 */
export const updateAppSettings = async (settings) => {
    try {
        const user = getCurrentUser();
        if (!user) {
            return { 
                success: false, 
                error: 'User not authenticated',
                errorCode: 'AUTH_ERROR',
                retryable: false
            };
        }

        if (!settings || typeof settings !== 'object') {
            return { 
                success: false, 
                error: 'Settings data is required',
                errorCode: 'VALIDATION_ERROR',
                retryable: false
            };
        }

        await firebaseFirestore().collection('users').doc(user.uid).update({
            ...settings,
            settingsUpdatedAt: firebaseFirestore.FieldValue.serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        logError('UPDATE_APP_SETTINGS_ERROR', error, { settings });
        
        if (error.code === 'permission-denied') {
            return { 
                success: false, 
                error: 'Permission denied. Please contact support.',
                errorCode: 'PERMISSION_DENIED',
                retryable: false
            };
        }

        if (error.code === 'not-found') {
            return { 
                success: false, 
                error: 'User not found',
                errorCode: 'NOT_FOUND',
                retryable: false
            };
        }

        if (error.code === 'unavailable' || error.message?.includes('network')) {
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
            error: 'Failed to update settings',
            errorCode: 'UNKNOWN_ERROR',
            retryable: true
        };
    }
};

/**
 * Listen to app settings changes
 */
export const listenAppSettings = (callback) => {
    try {
        const user = getCurrentUser();
        if (!user) {
            callback({ 
                success: false, 
                error: 'User not authenticated',
                errorCode: 'AUTH_ERROR'
            });
            return () => {};
        }

        return firebaseFirestore()
            .collection('users')
            .doc(user.uid)
            .onSnapshot(
                (doc) => {
                    try {
                        if (!doc.exists) {
                            callback({ 
                                success: true, 
                                data: { notificationsEnabled: true, printerSettings: {} } 
                            });
                            return;
                        }

                        const data = doc.data();
                        callback({
                            success: true,
                            data: {
                                notificationsEnabled: data.notificationsEnabled ?? true,
                                printerSettings: data.printerSettings || {}
                            }
                        });
                    } catch (error) {
                        logError('SETTINGS_SNAPSHOT_PROCESSING_ERROR', error);
                        callback({ 
                            success: false, 
                            error: 'Error processing settings data',
                            errorCode: 'PROCESSING_ERROR'
                        });
                    }
                },
                (error) => {
                    logError('SETTINGS_LISTENER_ERROR', error);
                    
                    if (error.code === 'permission-denied') {
                        callback({ 
                            success: false, 
                            error: 'Permission denied. Please contact support.',
                            errorCode: 'PERMISSION_DENIED'
                        });
                    } else if (error.code === 'unavailable') {
                        callback({ 
                            success: false, 
                            error: 'Service unavailable. Reconnecting...',
                            errorCode: 'UNAVAILABLE',
                            retryable: true
                        });
                    } else {
                        callback({ 
                            success: false, 
                            error: 'Failed to listen to settings',
                            errorCode: 'LISTENER_ERROR',
                            retryable: true
                        });
                    }
                }
            );
    } catch (error) {
        logError('SETUP_SETTINGS_LISTENER_ERROR', error);
        callback({ 
            success: false, 
            error: 'Failed to set up settings listener',
            errorCode: 'SETUP_ERROR'
        });
        return () => {};
    }
};

