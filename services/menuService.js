import { firebaseFirestore } from '../config/firebase.config';
import { logError } from '../utils/errorLogger';
import { handleNetworkError } from '../utils/networkHandler';

/**
 * Listen to menu items for a restaurant in real-time
 */
export const listenMenuItems = (restaurantId, callback) => {
    if (!restaurantId) {
        callback({ 
            success: false, 
            error: 'Restaurant ID is required',
            errorCode: 'VALIDATION_ERROR',
            data: []
        });
        return () => {};
    }

    try {
        return firebaseFirestore()
            .collection('restaurants')
            .doc(restaurantId)
            .collection('menuItems')
            .orderBy('name')
            .onSnapshot(
                (snapshot) => {
                    try {
                        const items = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                        callback({ success: true, data: items });
                    } catch (error) {
                        logError('MENU_SNAPSHOT_PROCESSING_ERROR', error, { restaurantId });
                        callback({ 
                            success: false, 
                            error: 'Error processing menu data',
                            errorCode: 'PROCESSING_ERROR',
                            data: []
                        });
                    }
                },
                (error) => {
                    logError('MENU_LISTENER_ERROR', error, { restaurantId });
                    
                    if (error.code === 'permission-denied') {
                        callback({ 
                            success: false, 
                            error: 'Permission denied',
                            errorCode: 'PERMISSION_DENIED',
                            data: []
                        });
                    } else if (error.code === 'unavailable') {
                        callback({ 
                            success: false, 
                            error: 'Service unavailable. Reconnecting...',
                            errorCode: 'UNAVAILABLE',
                            retryable: true,
                            data: []
                        });
                    } else {
                        callback({ 
                            success: false, 
                            error: 'Failed to load menu items',
                            errorCode: 'LISTENER_ERROR',
                            retryable: true,
                            data: []
                        });
                    }
                }
            );
    } catch (error) {
        logError('SETUP_MENU_LISTENER_ERROR', error, { restaurantId });
        callback({ 
            success: false, 
            error: 'Failed to set up menu listener',
            errorCode: 'SETUP_ERROR',
            data: []
        });
        return () => {};
    }
};

/**
 * Update menu item availability
 */
export const updateMenuItemAvailability = async (restaurantId, itemId, available) => {
    try {
        if (!restaurantId || !itemId) {
            return { 
                success: false, 
                error: 'Restaurant ID and Item ID are required',
                errorCode: 'VALIDATION_ERROR',
                retryable: false
            };
        }

        await firebaseFirestore()
            .collection('restaurants')
            .doc(restaurantId)
            .collection('menuItems')
            .doc(itemId)
            .update({
                available: available,
                updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
            });

        return { success: true };
    } catch (error) {
        logError('UPDATE_MENU_ITEM_AVAILABILITY_ERROR', error, { restaurantId, itemId });
        
        if (error.code === 'not-found') {
            return { 
                success: false, 
                error: 'Menu item not found',
                errorCode: 'NOT_FOUND',
                retryable: false
            };
        }

        if (error.code === 'permission-denied') {
            return { 
                success: false, 
                error: 'Permission denied',
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
            error: 'Failed to update item availability',
            errorCode: 'UNKNOWN_ERROR',
            retryable: true
        };
    }
};

/**
 * Add a new menu item
 */
export const addMenuItem = async (restaurantId, itemData) => {
    try {
        if (!restaurantId) {
            return { 
                success: false, 
                error: 'Restaurant ID is required',
                errorCode: 'VALIDATION_ERROR',
                retryable: false
            };
        }

        const docRef = await firebaseFirestore()
            .collection('restaurants')
            .doc(restaurantId)
            .collection('menuItems')
            .add({
                ...itemData,
                available: itemData.available ?? true,
                createdAt: firebaseFirestore.FieldValue.serverTimestamp(),
                updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
            });

        return { success: true, itemId: docRef.id };
    } catch (error) {
        logError('ADD_MENU_ITEM_ERROR', error, { restaurantId });
        
        if (error.code === 'permission-denied') {
            return { 
                success: false, 
                error: 'Permission denied',
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
            error: 'Failed to add menu item',
            errorCode: 'UNKNOWN_ERROR',
            retryable: true
        };
    }
};

/**
 * Update a menu item
 */
export const updateMenuItem = async (restaurantId, itemId, itemData) => {
    try {
        if (!restaurantId || !itemId) {
            return { 
                success: false, 
                error: 'Restaurant ID and Item ID are required',
                errorCode: 'VALIDATION_ERROR',
                retryable: false
            };
        }

        await firebaseFirestore()
            .collection('restaurants')
            .doc(restaurantId)
            .collection('menuItems')
            .doc(itemId)
            .update({
                ...itemData,
                updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
            });

        return { success: true };
    } catch (error) {
        logError('UPDATE_MENU_ITEM_ERROR', error, { restaurantId, itemId });
        
        if (error.code === 'not-found') {
            return { 
                success: false, 
                error: 'Menu item not found',
                errorCode: 'NOT_FOUND',
                retryable: false
            };
        }

        if (error.code === 'permission-denied') {
            return { 
                success: false, 
                error: 'Permission denied',
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
            error: 'Failed to update menu item',
            errorCode: 'UNKNOWN_ERROR',
            retryable: true
        };
    }
};

/**
 * Delete a menu item
 */
export const deleteMenuItem = async (restaurantId, itemId) => {
    try {
        if (!restaurantId || !itemId) {
            return { 
                success: false, 
                error: 'Restaurant ID and Item ID are required',
                errorCode: 'VALIDATION_ERROR',
                retryable: false
            };
        }

        await firebaseFirestore()
            .collection('restaurants')
            .doc(restaurantId)
            .collection('menuItems')
            .doc(itemId)
            .delete();

        return { success: true };
    } catch (error) {
        logError('DELETE_MENU_ITEM_ERROR', error, { restaurantId, itemId });
        
        if (error.code === 'permission-denied') {
            return { 
                success: false, 
                error: 'Permission denied',
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
            error: 'Failed to delete menu item',
            errorCode: 'UNKNOWN_ERROR',
            retryable: true
        };
    }
};

/**
 * Get a single menu item by ID
 */
export const getMenuItem = async (restaurantId, itemId) => {
    try {
        if (!restaurantId || !itemId) {
            return { 
                success: false, 
                error: 'Restaurant ID and Item ID are required',
                errorCode: 'VALIDATION_ERROR',
                retryable: false
            };
        }

        const doc = await firebaseFirestore()
            .collection('restaurants')
            .doc(restaurantId)
            .collection('menuItems')
            .doc(itemId)
            .get();

        if (!doc.exists) {
            return { 
                success: false, 
                error: 'Menu item not found',
                errorCode: 'NOT_FOUND',
                retryable: false
            };
        }

        return { 
            success: true, 
            data: { id: doc.id, ...doc.data() }
        };
    } catch (error) {
        logError('GET_MENU_ITEM_ERROR', error, { restaurantId, itemId });
        
        if (error.code === 'permission-denied') {
            return { 
                success: false, 
                error: 'Permission denied',
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
            error: 'Failed to get menu item',
            errorCode: 'UNKNOWN_ERROR',
            retryable: true
        };
    }
};

