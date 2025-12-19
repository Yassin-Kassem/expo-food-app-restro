import { firebaseFirestore } from '../config/firebase.config';
import { logError, logInfo } from '../utils/errorLogger';

// Track recently sent notifications to prevent duplicates
const recentNotifications = new Map();
const NOTIFICATION_DEBOUNCE_MS = 5000; // 5 seconds

/**
 * Check if a notification was recently sent for this order/status combination
 */
const wasRecentlyNotified = (orderId, status) => {
    const key = `${orderId}-${status}`;
    const timestamp = recentNotifications.get(key);
    if (timestamp) {
        const timeSince = Date.now() - timestamp;
        if (timeSince < NOTIFICATION_DEBOUNCE_MS) {
            return true; // Was notified recently
        }
    }
    return false;
};

/**
 * Mark a notification as sent
 */
const markAsNotified = (orderId, status) => {
    const key = `${orderId}-${status}`;
    recentNotifications.set(key, Date.now());
    
    // Clean up old entries after 1 minute
    setTimeout(() => {
        recentNotifications.delete(key);
    }, 60000);
};

/**
 * Send push notification via Expo Push Notification API
 * @param {string} pushToken - Expo push token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data to send with notification
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const sendPushNotification = async (pushToken, title, body, data = {}) => {
    try {
        if (!pushToken) {
            logError('SEND_PUSH_NOTIFICATION_ERROR', new Error('Push token is required'));
            return { success: false, error: 'Push token is required' };
        }

        const message = {
            to: pushToken,
            sound: 'default',
            title,
            body,
            data,
            priority: 'high',
            channelId: 'default',
        };

        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-Encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const result = await response.json();

        if (result.data && result.data.status === 'ok') {
            logInfo('PUSH_NOTIFICATION_SENT', 'Push notification sent successfully', { pushToken, title });
            return { success: true };
        } else {
            const error = result.data?.error || 'Failed to send notification';
            logError('SEND_PUSH_NOTIFICATION_ERROR', new Error(error), { pushToken, title });
            return { success: false, error };
        }
    } catch (error) {
        logError('SEND_PUSH_NOTIFICATION_ERROR', error, { pushToken, title });
        return { success: false, error: 'Failed to send notification' };
    }
};

/**
 * Get push token for a user from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, pushToken?: string, error?: string}>}
 */
export const getUserPushToken = async (userId) => {
    try {
        if (!userId) {
            return { success: false, error: 'User ID is required' };
        }

        const userDoc = await firebaseFirestore().collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
            return { success: false, error: 'User not found' };
        }

        const userData = userDoc.data();
        // Safety check: ensure userData exists before accessing properties
        if (!userData) {
            return { success: false, error: 'User data is empty' };
        }

        const pushToken = userData.pushToken || null;

        return { success: true, pushToken };
    } catch (error) {
        logError('GET_USER_PUSH_TOKEN_ERROR', error, { userId });
        return { success: false, error: 'Failed to get push token' };
    }
};

/**
 * Remove push token from a user document (used on logout)
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const removeUserPushToken = async (userId) => {
    try {
        if (!userId) {
            return { success: false, error: 'User ID is required' };
        }

        const userRef = firebaseFirestore().collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            await userRef.update({
                pushToken: firebaseFirestore.FieldValue.delete(),
                pushTokenUpdatedAt: firebaseFirestore.FieldValue.delete(),
            });
            logInfo('PUSH_TOKEN_REMOVED', 'Push token removed from user document', { userId });
        }

        return { success: true };
    } catch (error) {
        logError('REMOVE_USER_PUSH_TOKEN_ERROR', error, { userId });
        return { success: false, error: 'Failed to remove push token' };
    }
};

/**
 * Save push token to user document in Firestore
 * Also removes this token from any other user documents to prevent cross-user notifications
 * @param {string} userId - User ID
 * @param {string} pushToken - Expo push token
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const saveUserPushToken = async (userId, pushToken) => {
    try {
        if (!userId || !pushToken) {
            return { success: false, error: 'User ID and push token are required' };
        }

        // First, find and remove this token from any other user documents
        // This prevents the same device token from being associated with multiple users
        try {
            const usersWithToken = await firebaseFirestore()
                .collection('users')
                .where('pushToken', '==', pushToken)
                .get();

            const removePromises = usersWithToken.docs
                .filter(doc => doc.id !== userId) // Don't remove from current user
                .map(doc => doc.ref.update({
                    pushToken: firebaseFirestore.FieldValue.delete(),
                    pushTokenUpdatedAt: firebaseFirestore.FieldValue.delete(),
                }));

            if (removePromises.length > 0) {
                await Promise.all(removePromises);
                logInfo('PUSH_TOKEN_CLEANED', 'Removed push token from other user documents', { 
                    userId, 
                    removedFrom: removePromises.length 
                });
            }
        } catch (error) {
            // If query fails (e.g., index not created), log but continue
            logError('CLEANUP_PUSH_TOKEN_ERROR', error, { userId });
        }

        // Now save the token to the current user's document
        const userRef = firebaseFirestore().collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            // Document exists, use update
            await userRef.update({
                pushToken,
                pushTokenUpdatedAt: firebaseFirestore.FieldValue.serverTimestamp(),
            });
        } else {
            // Document doesn't exist yet, use set with merge
            // This ensures we don't overwrite existing data when document is created later
            await userRef.set({
                pushToken,
                pushTokenUpdatedAt: firebaseFirestore.FieldValue.serverTimestamp(),
            }, { merge: true });
        }

        logInfo('PUSH_TOKEN_SAVED', 'Push token saved to user document', { userId });
        return { success: true };
    } catch (error) {
        logError('SAVE_USER_PUSH_TOKEN_ERROR', error, { userId });
        return { success: false, error: 'Failed to save push token' };
    }
};

/**
 * Send notification to restaurant when new order is placed
 * @param {string} restaurantId - Restaurant user ID
 * @param {Object} orderData - Order data
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const notifyRestaurantNewOrder = async (restaurantId, orderData) => {
    try {
        const tokenResult = await getUserPushToken(restaurantId);
        
        if (!tokenResult.success || !tokenResult.pushToken) {
            logInfo('RESTAURANT_NO_PUSH_TOKEN', 'Restaurant has no push token, skipping notification', { restaurantId });
            return { success: true }; // Don't fail if no token
        }

        const title = '🎉 New Order!';
        const body = `${orderData.customerName || 'A customer'} just placed an order - time to get cooking! 👨‍🍳`;
        const data = {
            type: 'new_order',
            orderId: orderData.orderId,
            orderDisplayId: orderData.orderDisplayId,
        };

        return await sendPushNotification(tokenResult.pushToken, title, body, data);
    } catch (error) {
        logError('NOTIFY_RESTAURANT_NEW_ORDER_ERROR', error, { restaurantId });
        return { success: false, error: 'Failed to notify restaurant' };
    }
};

/**
 * Send notification to user when order status changes
 * @param {string} customerId - Customer user ID
 * @param {string} newStatus - New order status
 * @param {Object} orderData - Order data
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const notifyUserOrderStatusChange = async (customerId, newStatus, orderData) => {
    try {
        const orderId = orderData.orderId || orderData.id;
        
        // Prevent duplicate notifications for the same order/status within 5 seconds
        if (wasRecentlyNotified(orderId, newStatus)) {
            logInfo('DUPLICATE_NOTIFICATION_PREVENTED', 'Skipping duplicate notification', { orderId, newStatus });
            return { success: true };
        }

        const tokenResult = await getUserPushToken(customerId);
        
        if (!tokenResult.success || !tokenResult.pushToken) {
            logInfo('USER_NO_PUSH_TOKEN', 'User has no push token, skipping notification', { customerId });
            return { success: true }; // Don't fail if no token
        }

        // Map status to friendly, conversational messages
        const statusMessages = {
            'Pending': 'Great news! We\'ve received your order and the restaurant is getting it ready 🍽️',
            'Preparing': 'The kitchen is working on your order right now! It won\'t be long 😊',
            'Ready': 'Your food is ready! It\'s being prepared for delivery 🚀',
            'Out for Delivery': 'Your order is on the way! Our driver is bringing it to you now 🛵',
            'Delivered': 'Your order has arrived! Enjoy your meal! 🎉',
            'Cancelled': 'We\'re sorry, but your order has been cancelled. Please contact support if you need help.',
        };

        const title = 'Order Update 📦';
        const body = `${statusMessages[newStatus] || `Your order status: ${newStatus}`}`;
        const data = {
            type: 'order_status_update',
            orderId: orderId,
            orderDisplayId: orderData.orderDisplayId,
            status: newStatus,
        };

        const result = await sendPushNotification(tokenResult.pushToken, title, body, data);
        
        // Mark as notified if successful
        if (result.success) {
            markAsNotified(orderId, newStatus);
        }

        return result;
    } catch (error) {
        logError('NOTIFY_USER_ORDER_STATUS_CHANGE_ERROR', error, { customerId, newStatus });
        return { success: false, error: 'Failed to notify user' };
    }
};
