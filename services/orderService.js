import { firebaseFirestore } from '../config/firebase.config';
import { logError, logInfo } from '../utils/errorLogger';
import { validateOrderStatusTransition } from '../utils/validation';

const collectionRef = () => firebaseFirestore().collection('orders');

/**
 * Map Firestore document to order object
 */
const mapOrder = (doc) => {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || null;
    const statusUpdatedAt = data.statusUpdatedAt?.toDate ? data.statusUpdatedAt.toDate() : data.statusUpdatedAt || null;
    const completedAt = data.completedAt?.toDate ? data.completedAt.toDate() : data.completedAt || null;

    return {
        id: doc.id,
        ...data,
        createdAt,
        statusUpdatedAt,
        completedAt,
    };
};

/**
 * Generate a human-readable order ID
 */
const generateOrderDisplayId = () => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${dateStr}-${randomStr}`;
};

/**
 * Order status flow constants
 */
export const ORDER_STATUSES = {
    PENDING: 'Pending',
    PREPARING: 'Preparing',
    READY: 'Ready',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
};

/**
 * Active order statuses (not completed)
 */
export const ACTIVE_STATUSES = [
    ORDER_STATUSES.PENDING,
    ORDER_STATUSES.PREPARING,
    ORDER_STATUSES.READY,
    ORDER_STATUSES.OUT_FOR_DELIVERY,
];

/**
 * Completed order statuses
 */
export const COMPLETED_STATUSES = [
    ORDER_STATUSES.DELIVERED,
    ORDER_STATUSES.CANCELLED,
];

/**
 * Create a new order in Firestore
 * @param {Object} orderData - Order data from checkout
 * @returns {Promise<{success: boolean, orderId?: string, error?: string}>}
 */
export const createOrder = async (orderData) => {
    try {
        // Validate required fields
        if (!orderData.customerId) {
            return { success: false, error: 'Customer ID is required', errorCode: 'VALIDATION_ERROR' };
        }
        if (!orderData.restaurantId) {
            return { success: false, error: 'Restaurant ID is required', errorCode: 'VALIDATION_ERROR' };
        }
        if (!orderData.items || orderData.items.length === 0) {
            return { success: false, error: 'Order must have at least one item', errorCode: 'VALIDATION_ERROR' };
        }

        const orderDisplayId = generateOrderDisplayId();
        
        const order = {
            // Order identification
            orderDisplayId,
            
            // Customer info
            customerId: orderData.customerId,
            customerName: orderData.customerName || 'Customer',
            customerPhone: orderData.phoneNumber || '',
            
            // Restaurant info
            restaurantId: orderData.restaurantId,
            restaurantName: orderData.restaurantName || '',
            restaurantImage: orderData.restaurantImage || '',
            
            // Order items
            items: orderData.items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1,
                options: item.options || {},
                specialInstructions: item.specialInstructions || '',
            })),
            
            // Pricing
            subtotal: orderData.subtotal || 0,
            tax: orderData.tax || 0,
            deliveryFee: orderData.deliveryFee || 0,
            total: orderData.total || 0,
            
            // Delivery info
            deliveryAddress: orderData.deliveryAddress || '',
            phoneNumber: orderData.phoneNumber || '',
            specialInstructions: orderData.specialInstructions || '',
            
            // Timing
            estimatedDeliveryTime: orderData.estimatedDeliveryTime || 35, // minutes
            
            // Status
            status: ORDER_STATUSES.PENDING,
            
            // Timestamps
            createdAt: firebaseFirestore.FieldValue.serverTimestamp(),
            statusUpdatedAt: firebaseFirestore.FieldValue.serverTimestamp(),
            completedAt: null,
        };

        const docRef = await collectionRef().add(order);
        
        logInfo('ORDER_CREATED', 'New order created', { 
            orderId: docRef.id, 
            orderDisplayId,
            restaurantId: orderData.restaurantId 
        });

        return { 
            success: true, 
            orderId: docRef.id,
            orderDisplayId,
        };
    } catch (error) {
        logError('CREATE_ORDER_ERROR', error, { customerId: orderData.customerId });
        
        if (error.code === 'permission-denied') {
            return { 
                success: false, 
                error: 'Permission denied. Please try again.',
                errorCode: 'PERMISSION_DENIED',
                retryable: false
            };
        }

        return { 
            success: false, 
            error: 'Failed to place order. Please try again.',
            errorCode: 'UNKNOWN_ERROR',
            retryable: true
        };
    }
};

/**
 * Listen to a single order's updates in real-time
 * @param {string} orderId - The order ID to listen to
 * @param {Function} callback - Callback function with order data
 * @returns {Function} Unsubscribe function
 */
export const listenToSingleOrder = (orderId, callback) => {
    if (!orderId) {
        callback({ 
            success: false, 
            error: 'Order ID is required',
            errorCode: 'VALIDATION_ERROR'
        });
        return () => {};
    }

    try {
        return collectionRef()
            .doc(orderId)
            .onSnapshot(
                (doc) => {
                    try {
                        if (!doc.exists) {
                            callback({ 
                                success: false, 
                                error: 'Order not found',
                                errorCode: 'NOT_FOUND'
                            });
                            return;
                        }

                        const order = mapOrder(doc);
                        callback({ success: true, data: order });
                    } catch (error) {
                        logError('SINGLE_ORDER_SNAPSHOT_ERROR', error, { orderId });
                        callback({ 
                            success: false, 
                            error: 'Error processing order data',
                            errorCode: 'PROCESSING_ERROR'
                        });
                    }
                },
                (error) => {
                    logError('SINGLE_ORDER_LISTENER_ERROR', error, { orderId });
                    
                    if (error.code === 'permission-denied') {
                        callback({ 
                            success: false, 
                            error: 'You do not have permission to view this order',
                            errorCode: 'PERMISSION_DENIED'
                        });
                    } else {
                        callback({ 
                            success: false, 
                            error: 'Failed to load order',
                            errorCode: 'LISTENER_ERROR',
                            retryable: true
                        });
                    }
                }
            );
    } catch (error) {
        logError('SETUP_SINGLE_ORDER_LISTENER_ERROR', error, { orderId });
        callback({ 
            success: false, 
            error: 'Failed to set up order listener',
            errorCode: 'SETUP_ERROR'
        });
        return () => {};
    }
};

/**
 * Listen to all orders for a specific customer in real-time
 * @param {string} userId - The customer's user ID
 * @param {Function} callback - Callback function with orders array
 * @returns {Function} Unsubscribe function
 */
export const listenToUserOrders = (userId, callback) => {
    if (!userId) {
        callback({ 
            success: false, 
            error: 'User ID is required',
            errorCode: 'VALIDATION_ERROR'
        });
        return () => {};
    }

    try {
        return collectionRef()
            .where('customerId', '==', userId)
            .orderBy('createdAt', 'desc')
            .onSnapshot(
                (snapshot) => {
                    try {
                        if (snapshot.metadata.fromCache && __DEV__) {
                            logInfo('USER_ORDERS_FROM_CACHE', 'Orders loaded from cache', { userId });
                        }

                        if (!snapshot || !snapshot.docs) {
                            callback({ 
                                success: false, 
                                error: 'Invalid data received',
                                errorCode: 'DATA_ERROR'
                            });
                            return;
                        }

                        const orders = snapshot.docs.map(mapOrder);
                        callback({ success: true, data: orders });
                    } catch (error) {
                        logError('USER_ORDERS_SNAPSHOT_ERROR', error, { userId });
                        callback({ 
                            success: false, 
                            error: 'Error processing orders data',
                            errorCode: 'PROCESSING_ERROR'
                        });
                    }
                },
                (error) => {
                    logError('USER_ORDERS_LISTENER_ERROR', error, { userId });
                    
                    if (error.code === 'permission-denied') {
                        callback({ 
                            success: false, 
                            error: 'Permission denied',
                            errorCode: 'PERMISSION_DENIED'
                        });
                    } else {
                        callback({ 
                            success: false, 
                            error: 'Failed to load orders',
                            errorCode: 'LISTENER_ERROR',
                            retryable: true
                        });
                    }
                }
            );
    } catch (error) {
        logError('SETUP_USER_ORDERS_LISTENER_ERROR', error, { userId });
        callback({ 
            success: false, 
            error: 'Failed to set up orders listener',
            errorCode: 'SETUP_ERROR'
        });
        return () => {};
    }
};

/**
 * Get the user's most recent active (incomplete) order
 * @param {string} userId - The customer's user ID
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const getActiveUserOrder = async (userId) => {
    try {
        if (!userId) {
            return { success: false, error: 'User ID is required', errorCode: 'VALIDATION_ERROR' };
        }

        // Query for orders that are not delivered or cancelled
        const snapshot = await collectionRef()
            .where('customerId', '==', userId)
            .where('status', 'in', ACTIVE_STATUSES)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        if (snapshot.empty) {
            return { success: true, data: null };
        }

        const order = mapOrder(snapshot.docs[0]);
        return { success: true, data: order };
    } catch (error) {
        logError('GET_ACTIVE_ORDER_ERROR', error, { userId });
        
        // Handle index not yet built error gracefully
        if (error.code === 'failed-precondition') {
            logInfo('INDEX_REQUIRED', 'Firestore index required for active order query', { userId });
            return { success: true, data: null }; // Return null instead of error
        }

        return { 
            success: false, 
            error: 'Failed to check for active orders',
            errorCode: 'UNKNOWN_ERROR'
        };
    }
};

/**
 * Listen to user's active order in real-time (for home screen)
 * @param {string} userId - The customer's user ID
 * @param {Function} callback - Callback function with active order data
 * @returns {Function} Unsubscribe function
 */
export const listenToActiveUserOrder = (userId, callback) => {
    if (!userId) {
        callback({ success: true, data: null });
        return () => {};
    }

    try {
        return collectionRef()
            .where('customerId', '==', userId)
            .where('status', 'in', ACTIVE_STATUSES)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .onSnapshot(
                (snapshot) => {
                    try {
                        if (snapshot.empty) {
                            callback({ success: true, data: null });
                            return;
                        }

                        const order = mapOrder(snapshot.docs[0]);
                        callback({ success: true, data: order });
                    } catch (error) {
                        logError('ACTIVE_ORDER_SNAPSHOT_ERROR', error, { userId });
                        callback({ success: true, data: null });
                    }
                },
                (error) => {
                    logError('ACTIVE_ORDER_LISTENER_ERROR', error, { userId });
                    // Silently fail - don't show error to user for this background check
                    callback({ success: true, data: null });
                }
            );
    } catch (error) {
        logError('SETUP_ACTIVE_ORDER_LISTENER_ERROR', error, { userId });
        callback({ success: true, data: null });
        return () => {};
    }
};

export const listenOrdersByRestaurant = (restaurantId, callback) => {
    if (!restaurantId) {
        callback({ 
            success: false, 
            error: 'Restaurant ID is required',
            errorCode: 'VALIDATION_ERROR'
        });
        return () => {};
    }

    try {
        return collectionRef()
            .where('restaurantId', '==', restaurantId)
            .onSnapshot(
                (snapshot) => {
                    try {
                        // Handle metadata changes (cache data is normal, just log for debugging)
                        if (snapshot.metadata.fromCache && __DEV__) {
                            logInfo('ORDERS_FROM_CACHE', 'Orders data loaded from cache', { restaurantId });
                        }

                        // Validate snapshot
                        if (!snapshot || !snapshot.docs) {
                            callback({ 
                                success: false, 
                                error: 'Invalid data received',
                                errorCode: 'DATA_ERROR'
                            });
                            return;
                        }

                        const orders = snapshot.docs.map(mapOrder);
                        
                        // Validate each order
                        const validOrders = orders.filter(order => {
                            if (!order.id || !order.restaurantId) {
                                logError('INVALID_ORDER', { order }, { restaurantId });
                                return false;
                            }
                            return true;
                        });

                        // Sort by createdAt descending
                        validOrders.sort((a, b) => {
                            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                            return bTime - aTime;
                        });
                        
                        callback({ success: true, data: validOrders });
                    } catch (error) {
                        logError('SNAPSHOT_PROCESSING_ERROR', error, { restaurantId });
                        callback({ 
                            success: false, 
                            error: 'Error processing order data',
                            errorCode: 'PROCESSING_ERROR'
                        });
                    }
                },
                (error) => {
                    logError('ORDERS_LISTENER_ERROR', error, { restaurantId });
                    
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
                            error: 'Failed to load orders',
                            errorCode: 'LISTENER_ERROR',
                            retryable: true
                        });
                    }
                }
            );
    } catch (error) {
        logError('SETUP_ORDERS_LISTENER_ERROR', error, { restaurantId });
        callback({ 
            success: false, 
            error: 'Failed to set up order listener',
            errorCode: 'SETUP_ERROR'
        });
        return () => {};
    }
};

/**
 * Update order status with validation and transaction safety
 */
export const updateOrderStatus = async (orderId, newStatus, restaurantId) => {
    try {
        if (!orderId || !newStatus || !restaurantId) {
            return { 
                success: false, 
                error: 'Order ID, status, and restaurant ID are required',
                errorCode: 'VALIDATION_ERROR',
                retryable: false
            };
        }

        // Get current order status
        const orderRef = collectionRef().doc(orderId);
        const orderDoc = await orderRef.get();
        
        if (!orderDoc.exists) {
            return { 
                success: false, 
                error: 'Order not found',
                errorCode: 'NOT_FOUND',
                retryable: false
            };
        }

        const currentStatus = orderDoc.data().status;
        
        // Validate status transition
        const transitionError = validateOrderStatusTransition(currentStatus, newStatus);
        if (transitionError) {
            return { 
                success: false, 
                error: transitionError,
                errorCode: 'INVALID_TRANSITION',
                retryable: false
            };
        }

        // Use transaction to prevent race conditions
        await firebaseFirestore().runTransaction(async (transaction) => {
            const orderDoc = await transaction.get(orderRef);
            
            if (!orderDoc.exists) {
                throw new Error('Order not found');
            }

            const orderData = orderDoc.data();
            
            // Verify restaurant owns this order
            if (orderData.restaurantId !== restaurantId) {
                throw new Error('Permission denied');
            }

            // Check if order was already updated
            if (orderData.status !== currentStatus) {
                throw new Error('Order status changed by another process');
            }

            const isCompleted = newStatus === ORDER_STATUSES.DELIVERED || newStatus === ORDER_STATUSES.CANCELLED;
            
            transaction.update(orderRef, {
                status: newStatus,
                statusUpdatedAt: firebaseFirestore.FieldValue.serverTimestamp(),
                ...(isCompleted && { completedAt: firebaseFirestore.FieldValue.serverTimestamp() })
            });
        });

        return { success: true };
    } catch (error) {
        logError('UPDATE_ORDER_STATUS_ERROR', error, { orderId, newStatus, restaurantId });
        
        if (error.message === 'Order not found' || error.code === 'not-found') {
            return { 
                success: false, 
                error: 'Order not found',
                errorCode: 'NOT_FOUND',
                retryable: false
            };
        }
        
        if (error.message === 'Permission denied') {
            return { 
                success: false, 
                error: 'You do not have permission to update this order',
                errorCode: 'PERMISSION_DENIED',
                retryable: false
            };
        }

        if (error.message.includes('changed by another process') || error.code === 'aborted') {
            return { 
                success: false, 
                error: 'Order was updated by another process. Please refresh.',
                errorCode: 'CONFLICT_ERROR',
                retryable: true
            };
        }

        return { 
            success: false, 
            error: 'Failed to update order status',
            errorCode: 'UNKNOWN_ERROR',
            retryable: true
        };
    }
};

