import { firebaseFirestore } from '../config/firebase.config';
import { logError, logInfo } from '../utils/errorLogger';
import { validateOrderStatusTransition } from '../utils/validation';

const collectionRef = () => firebaseFirestore().collection('orders');

const mapOrder = (doc) => {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || null;

    return {
        id: doc.id,
        ...data,
        createdAt
    };
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

            transaction.update(orderRef, {
                status: newStatus,
                statusUpdatedAt: firebaseFirestore.FieldValue.serverTimestamp(),
                ...(newStatus === 'Completed' && { completedAt: firebaseFirestore.FieldValue.serverTimestamp() })
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

