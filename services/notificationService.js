import * as Notifications from 'expo-notifications';
import * as Device from 'expo-constants';
import { Platform } from 'react-native';
import { firebaseFirestore } from '../config/firebase.config';
import { logError } from '../utils/errorLogger';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async () => {
    try {
        if (!Device.isDevice) {
            console.log('Must use physical device for push notifications');
            return { success: false, error: 'Must use physical device' };
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return { success: false, error: 'Permission denied' };
        }

        return { success: true, status: finalStatus };
    } catch (error) {
        logError('NOTIFICATION_PERMISSION_ERROR', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get the Expo push notification token
 */
export const getNotificationToken = async () => {
    try {
        const permissionResult = await requestNotificationPermissions();
        if (!permissionResult.success) {
            return permissionResult;
        }

        // Get the token
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: Device.expoConfig?.extra?.eas?.projectId,
        });

        // Configure Android channel
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('orders', {
                name: 'Order Updates',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF6B4A',
                sound: 'default',
            });

            await Notifications.setNotificationChannelAsync('promotions', {
                name: 'Promotions',
                importance: Notifications.AndroidImportance.DEFAULT,
                sound: 'default',
            });
        }

        return { success: true, token: tokenData.data };
    } catch (error) {
        logError('GET_NOTIFICATION_TOKEN_ERROR', error);
        return { success: false, error: error.message };
    }
};

/**
 * Save notification token to user profile in Firestore
 */
export const saveNotificationToken = async (userId, token) => {
    try {
        if (!userId || !token) {
            return { success: false, error: 'User ID and token are required' };
        }

        await firebaseFirestore()
            .collection('users')
            .doc(userId)
            .update({
                pushToken: token,
                pushTokenUpdatedAt: firebaseFirestore.FieldValue.serverTimestamp(),
                platform: Platform.OS,
            });

        return { success: true };
    } catch (error) {
        logError('SAVE_NOTIFICATION_TOKEN_ERROR', error, { userId });
        return { success: false, error: error.message };
    }
};

/**
 * Remove notification token from user profile
 */
export const removeNotificationToken = async (userId) => {
    try {
        if (!userId) {
            return { success: false, error: 'User ID is required' };
        }

        await firebaseFirestore()
            .collection('users')
            .doc(userId)
            .update({
                pushToken: firebaseFirestore.FieldValue.delete(),
                pushTokenUpdatedAt: firebaseFirestore.FieldValue.delete(),
            });

        return { success: true };
    } catch (error) {
        logError('REMOVE_NOTIFICATION_TOKEN_ERROR', error, { userId });
        return { success: false, error: error.message };
    }
};

/**
 * Schedule a local notification
 */
export const scheduleLocalNotification = async (title, body, data = {}, trigger = null) => {
    try {
        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: 'default',
            },
            trigger: trigger || null, // null = immediate
        });

        return { success: true, notificationId };
    } catch (error) {
        logError('SCHEDULE_NOTIFICATION_ERROR', error);
        return { success: false, error: error.message };
    }
};

/**
 * Cancel a scheduled notification
 */
export const cancelNotification = async (notificationId) => {
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        return { success: true };
    } catch (error) {
        logError('CANCEL_NOTIFICATION_ERROR', error);
        return { success: false, error: error.message };
    }
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = async () => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        return { success: true };
    } catch (error) {
        logError('CANCEL_ALL_NOTIFICATIONS_ERROR', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get badge count
 */
export const getBadgeCount = async () => {
    try {
        const count = await Notifications.getBadgeCountAsync();
        return { success: true, count };
    } catch (error) {
        return { success: false, count: 0 };
    }
};

/**
 * Set badge count
 */
export const setBadgeCount = async (count) => {
    try {
        await Notifications.setBadgeCountAsync(count);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Add notification received listener
 */
export const addNotificationReceivedListener = (callback) => {
    return Notifications.addNotificationReceivedListener(callback);
};

/**
 * Add notification response listener (when user taps notification)
 */
export const addNotificationResponseListener = (callback) => {
    return Notifications.addNotificationResponseReceivedListener(callback);
};

/**
 * Handle notification based on type
 */
export const handleNotification = (notification) => {
    const data = notification.request?.content?.data || {};
    
    switch (data.type) {
        case 'order_confirmed':
            return { screen: 'order-tracking', params: { orderId: data.orderId } };
        
        case 'order_preparing':
            return { screen: 'order-tracking', params: { orderId: data.orderId } };
        
        case 'order_ready':
            return { screen: 'order-tracking', params: { orderId: data.orderId } };
        
        case 'order_out_for_delivery':
            return { screen: 'order-tracking', params: { orderId: data.orderId } };
        
        case 'order_completed':
            return { screen: 'order-tracking', params: { orderId: data.orderId } };
        
        case 'order_cancelled':
            return { screen: 'orders', params: {} };
        
        case 'promotion':
            return { screen: 'browse', params: { promo: data.promoCode } };
        
        default:
            return { screen: 'home', params: {} };
    }
};

/**
 * Order notification messages
 */
export const ORDER_NOTIFICATION_MESSAGES = {
    confirmed: {
        title: 'Order Confirmed! 🎉',
        body: (restaurantName) => `${restaurantName} is preparing your order`,
    },
    preparing: {
        title: 'Cooking in Progress 👨‍🍳',
        body: (restaurantName) => `${restaurantName} is cooking your delicious meal`,
    },
    ready: {
        title: 'Order Ready! 📦',
        body: (restaurantName) => `Your order from ${restaurantName} is ready for pickup/delivery`,
    },
    out_for_delivery: {
        title: 'On the Way! 🚗',
        body: () => 'Your order is out for delivery',
    },
    completed: {
        title: 'Order Delivered! 🎊',
        body: () => 'Enjoy your meal! Rate your experience',
    },
    cancelled: {
        title: 'Order Cancelled 😔',
        body: (reason) => reason || 'Your order has been cancelled',
    },
};

/**
 * Send order status notification (local)
 */
export const sendOrderStatusNotification = async (status, restaurantName, orderId, reason = null) => {
    const message = ORDER_NOTIFICATION_MESSAGES[status];
    if (!message) return { success: false, error: 'Unknown status' };

    return scheduleLocalNotification(
        message.title,
        message.body(restaurantName || reason),
        {
            type: `order_${status}`,
            orderId,
        }
    );
};

