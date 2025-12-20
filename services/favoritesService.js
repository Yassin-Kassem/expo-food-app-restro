import { firebaseFirestore } from '../config/firebase.config';
import { logError } from '../utils/errorLogger';

/**
 * Add a restaurant to user's favorites
 * @param {string} userId - User ID
 * @param {string} restaurantId - Restaurant ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const addToFavorites = async (userId, restaurantId) => {
    try {
        if (!userId || !restaurantId) {
            return { success: false, error: 'User ID and Restaurant ID are required' };
        }

        const userRef = firebaseFirestore().collection('users').doc(userId);
        
        // Use arrayUnion to add restaurant ID to favorites array
        await userRef.update({
            favoriteRestaurants: firebaseFirestore.FieldValue.arrayUnion(restaurantId),
            updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        logError('ADD_TO_FAVORITES_ERROR', error, { userId, restaurantId });
        return { 
            success: false, 
            error: 'Failed to add restaurant to favorites',
            retryable: true
        };
    }
};

/**
 * Remove a restaurant from user's favorites
 * @param {string} userId - User ID
 * @param {string} restaurantId - Restaurant ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const removeFromFavorites = async (userId, restaurantId) => {
    try {
        if (!userId || !restaurantId) {
            return { success: false, error: 'User ID and Restaurant ID are required' };
        }

        const userRef = firebaseFirestore().collection('users').doc(userId);
        
        // Use arrayRemove to remove restaurant ID from favorites array
        await userRef.update({
            favoriteRestaurants: firebaseFirestore.FieldValue.arrayRemove(restaurantId),
            updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        logError('REMOVE_FROM_FAVORITES_ERROR', error, { userId, restaurantId });
        return { 
            success: false, 
            error: 'Failed to remove restaurant from favorites',
            retryable: true
        };
    }
};

/**
 * Toggle favorite status (add if not favorited, remove if favorited)
 * @param {string} userId - User ID
 * @param {string} restaurantId - Restaurant ID
 * @param {boolean} isFavorite - Current favorite status
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const toggleFavorite = async (userId, restaurantId, isFavorite) => {
    if (isFavorite) {
        return await removeFromFavorites(userId, restaurantId);
    } else {
        return await addToFavorites(userId, restaurantId);
    }
};

/**
 * Get user's favorite restaurant IDs
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data?: string[], error?: string}>}
 */
export const getUserFavorites = async (userId) => {
    try {
        if (!userId) {
            return { success: false, error: 'User ID is required' };
        }

        const userDoc = await firebaseFirestore().collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
            return { success: false, error: 'User not found' };
        }

        const userData = userDoc.data();
        const favorites = userData.favoriteRestaurants || [];

        return { success: true, data: favorites };
    } catch (error) {
        logError('GET_USER_FAVORITES_ERROR', error, { userId });
        return { 
            success: false, 
            error: 'Failed to fetch favorites',
            retryable: true
        };
    }
};

/**
 * Check if a restaurant is favorited by user
 * @param {string} userId - User ID
 * @param {string} restaurantId - Restaurant ID
 * @returns {Promise<{success: boolean, isFavorite?: boolean, error?: string}>}
 */
export const isRestaurantFavorited = async (userId, restaurantId) => {
    try {
        const result = await getUserFavorites(userId);
        
        if (!result.success) {
            return result;
        }

        const isFavorite = result.data?.includes(restaurantId) || false;
        return { success: true, isFavorite };
    } catch (error) {
        logError('CHECK_FAVORITE_STATUS_ERROR', error, { userId, restaurantId });
        return { 
            success: false, 
            error: 'Failed to check favorite status',
            retryable: true
        };
    }
};

/**
 * Listen to user's favorites in real-time
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function with favorites data
 * @returns {Function} Unsubscribe function
 */
export const listenToUserFavorites = (userId, callback) => {
    if (!userId) {
        callback({ success: false, error: 'User ID is required' });
        return () => {};
    }

    try {
        return firebaseFirestore()
            .collection('users')
            .doc(userId)
            .onSnapshot(
                (doc) => {
                    if (!doc.exists) {
                        callback({ success: false, error: 'User not found' });
                        return;
                    }

                    const userData = doc.data();
                    const favorites = userData.favoriteRestaurants || [];
                    callback({ success: true, data: favorites });
                },
                (error) => {
                    logError('LISTEN_TO_FAVORITES_ERROR', error, { userId });
                    callback({ 
                        success: false, 
                        error: 'Failed to listen to favorites',
                        retryable: true
                    });
                }
            );
    } catch (error) {
        logError('SETUP_FAVORITES_LISTENER_ERROR', error, { userId });
        callback({ 
            success: false, 
            error: 'Failed to set up favorites listener'
        });
        return () => {};
    }
};

