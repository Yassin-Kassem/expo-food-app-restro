import { firebaseFirestore } from '../config/firebase.config';
import { logError } from '../utils/errorLogger';
import { handleNetworkError } from '../utils/networkHandler';
import { validateRestaurantData } from '../utils/validation';

const collectionRef = () => firebaseFirestore().collection('restaurants');

const mapRestaurant = (doc) => ({ id: doc.id, ...doc.data() });

export const getRestaurantByOwner = async (ownerId) => {
    try {
        if (!ownerId) {
            return { 
                success: false, 
                error: 'Owner ID is required',
                errorCode: 'VALIDATION_ERROR',
                retryable: false
            };
        }

        const snapshot = await collectionRef()
            .where('ownerId', '==', ownerId)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return { 
                success: false, 
                error: 'Restaurant not found for this user',
                errorCode: 'NOT_FOUND',
                retryable: false
            };
        }

        return { success: true, data: mapRestaurant(snapshot.docs[0]) };
    } catch (error) {
        logError('FETCH_RESTAURANT_ERROR', error, { ownerId });
        
        // Handle specific Firestore errors
        if (error.code === 'permission-denied') {
            return { 
                success: false, 
                error: 'You do not have permission to access this restaurant',
                errorCode: 'PERMISSION_DENIED',
                retryable: false
            };
        }
        
        if (error.code === 'resource-exhausted') {
            return { 
                success: false, 
                error: 'Service temporarily unavailable. Please try again later.',
                errorCode: 'QUOTA_EXCEEDED',
                retryable: true
            };
        }

        if (error.code === 'failed-precondition') {
            return { 
                success: false, 
                error: 'Database configuration error. Please contact support.',
                errorCode: 'INDEX_MISSING',
                retryable: false
            };
        }

        // Check for network errors
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
            error: 'Failed to fetch restaurant. Please try again.',
            errorCode: 'UNKNOWN_ERROR',
            retryable: true
        };
    }
};

export const listenRestaurantByOwner = (ownerId, callback) => {
    if (!ownerId) {
        callback({ 
            success: false, 
            error: 'Owner ID is required',
            errorCode: 'VALIDATION_ERROR'
        });
        return () => {};
    }

    try {
        return collectionRef()
            .where('ownerId', '==', ownerId)
            .limit(1)
            .onSnapshot(
                (snapshot) => {
                    try {
                        if (snapshot.empty) {
                            callback({ 
                                success: false, 
                                error: 'Restaurant not found for this user',
                                errorCode: 'NOT_FOUND'
                            });
                            return;
                        }

                        const restaurant = mapRestaurant(snapshot.docs[0]);
                        callback({ success: true, data: restaurant });
                    } catch (error) {
                        logError('SNAPSHOT_PROCESSING_ERROR', error, { ownerId });
                        callback({ 
                            success: false, 
                            error: 'Error processing restaurant data',
                            errorCode: 'PROCESSING_ERROR'
                        });
                    }
                },
                (error) => {
                    logError('RESTAURANT_LISTENER_ERROR', error, { ownerId });
                    
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
                            error: 'Failed to listen to restaurant',
                            errorCode: 'LISTENER_ERROR',
                            retryable: true
                        });
                    }
                }
            );
    } catch (error) {
        logError('SETUP_RESTAURANT_LISTENER_ERROR', error, { ownerId });
        callback({ 
            success: false, 
            error: 'Failed to set up restaurant listener',
            errorCode: 'SETUP_ERROR'
        });
        return () => {};
    }
};

/**
 * Create restaurant document in Firestore
 */
export const createRestaurant = async (uid, data) => {
    try {
        if (!uid) {
            return { 
                success: false, 
                error: 'User ID is required',
                errorCode: 'VALIDATION_ERROR',
                retryable: false
            };
        }

        // Validate restaurant data
        const validationErrors = validateRestaurantData(data);
        if (validationErrors) {
            return { 
                success: false, 
                error: Object.values(validationErrors)[0],
                errorCode: 'VALIDATION_ERROR',
                errors: validationErrors,
                retryable: false
            };
        }

        const restaurantRef = collectionRef().doc();
        await restaurantRef.set({
            ownerId: uid,
            ...data,
            status: 'draft',
            createdAt: firebaseFirestore.FieldValue.serverTimestamp()
        });
        return { success: true, restaurantId: restaurantRef.id };
    } catch (error) {
        logError('CREATE_RESTAURANT_ERROR', error, { uid });
        
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
            error: 'Failed to create restaurant. Please try again.',
            errorCode: 'UNKNOWN_ERROR',
            retryable: true
        };
    }
};

/**
 * Update restaurant document
 */
export const updateRestaurant = async (restaurantId, data) => {
    try {
        if (!restaurantId) {
            return { 
                success: false, 
                error: 'Restaurant ID is required',
                errorCode: 'VALIDATION_ERROR',
                retryable: false
            };
        }

        // Validate data before update
        const validationErrors = validateRestaurantData(data);
        if (validationErrors) {
            return { 
                success: false, 
                error: Object.values(validationErrors)[0],
                errorCode: 'VALIDATION_ERROR',
                errors: validationErrors,
                retryable: false
            };
        }

        // Use transaction for critical updates to prevent race conditions
        await firebaseFirestore().runTransaction(async (transaction) => {
            const restaurantRef = collectionRef().doc(restaurantId);
            const restaurantDoc = await transaction.get(restaurantRef);
            
            if (!restaurantDoc.exists) {
                throw new Error('Restaurant not found');
            }

            transaction.update(restaurantRef, {
                ...data,
                updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
            });
        });

        return { success: true };
    } catch (error) {
        logError('UPDATE_RESTAURANT_ERROR', error, { restaurantId, data });
        
        if (error.message === 'Restaurant not found' || error.code === 'not-found') {
            return { 
                success: false, 
                error: 'Restaurant not found',
                errorCode: 'NOT_FOUND',
                retryable: false
            };
        }
        
        if (error.code === 'aborted') {
            // Transaction conflict
            return { 
                success: false, 
                error: 'Update conflict. Please try again.',
                errorCode: 'CONFLICT_ERROR',
                retryable: true
            };
        }

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
            error: 'Failed to update restaurant. Please try again.',
            errorCode: 'UNKNOWN_ERROR',
            retryable: true
        };
    }
};

/**
 * Publish restaurant (set status to active and mark onboarding as complete)
 */
export const publishRestaurant = async (restaurantId, ownerId) => {
    try {
        if (!restaurantId || !ownerId) {
            return { 
                success: false, 
                error: 'Restaurant ID and Owner ID are required',
                errorCode: 'VALIDATION_ERROR',
                retryable: false
            };
        }

        // Use batch write for atomic updates
        const batch = firebaseFirestore().batch();
        
        const restaurantRef = collectionRef().doc(restaurantId);
        const userRef = firebaseFirestore().collection('users').doc(ownerId);

        // Verify restaurant exists
        const restaurantDoc = await restaurantRef.get();
        if (!restaurantDoc.exists) {
            return { 
                success: false, 
                error: 'Restaurant not found',
                errorCode: 'NOT_FOUND',
                retryable: false
            };
        }

        batch.update(restaurantRef, {
            status: 'active',
            publishedAt: firebaseFirestore.FieldValue.serverTimestamp()
        });

        batch.update(userRef, {
            onboardingCompleted: true
        });

        await batch.commit();

        return { success: true };
    } catch (error) {
        logError('PUBLISH_RESTAURANT_ERROR', error, { restaurantId, ownerId });
        
        if (error.code === 'not-found') {
            return { 
                success: false, 
                error: 'Restaurant or user not found',
                errorCode: 'NOT_FOUND',
                retryable: false
            };
        }

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
            error: 'Failed to publish restaurant. Please try again.',
            errorCode: 'UNKNOWN_ERROR',
            retryable: true
        };
    }
};
