import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Badge from '../../../components/restaurant/Badge';
import CustomModal from '../../../components/CustomModal';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useAuth } from '../../../hooks/useAuth';
import { useRestaurant } from '../../../hooks/useRestaurant';
import { listenToSingleOrder, updateOrderStatus, ORDER_STATUSES } from '../../../services/orderService';

// Timeline steps for order status
const TIMELINE_STEPS = [
    { key: 'Pending', icon: 'document-text-outline', label: 'Received' },
    { key: 'Preparing', icon: 'flame-outline', label: 'Preparing' },
    { key: 'Ready', icon: 'bag-check-outline', label: 'Ready' },
    { key: 'Out for Delivery', icon: 'bicycle-outline', label: 'Delivery' },
    { key: 'Delivered', icon: 'checkmark-circle-outline', label: 'Completed' },
];

// Map status to step index
const STATUS_TO_INDEX = {
    'Pending': 0,
    'Preparing': 1,
    'Ready': 2,
    'Out for Delivery': 3,
    'Delivered': 4,
    'Cancelled': -1,
};

// Get next status transitions based on current status
const getStatusActions = (currentStatus) => {
    switch (currentStatus) {
        case 'Pending':
            return [
                { action: 'Preparing', label: 'Accept Order', color: 'success', icon: 'checkmark' },
                { action: 'Cancelled', label: 'Decline', color: 'error', icon: 'close' },
            ];
        case 'Preparing':
            return [
                { action: 'Ready', label: 'Mark as Ready', color: 'primary', icon: 'bag-check' },
            ];
        case 'Ready':
            return [
                { action: 'Out for Delivery', label: 'Out for Delivery', color: 'primary', icon: 'bicycle' },
            ];
        case 'Out for Delivery':
            return [
                { action: 'Delivered', label: 'Mark as Delivered', color: 'success', icon: 'checkmark-circle' },
            ];
        default:
            return [];
    }
};

export default function OrderDetailsScreen() {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();
    const { orderId } = useLocalSearchParams();
    const { user } = useAuth();
    const { restaurant } = useRestaurant(user?.uid);

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [modalConfig, setModalConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'warning',
        action: null,
    });

    // Set up real-time listener for order
    useEffect(() => {
        if (!orderId) {
            setError('No order ID provided');
            setLoading(false);
            return;
        }

        const unsubscribe = listenToSingleOrder(orderId, (result) => {
            setLoading(false);
            
            if (result.success) {
                setOrder(result.data);
                setError(null);
            } else {
                setError(result.error || 'Failed to load order');
                setOrder(null);
            }
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [orderId]);

    // Show confirmation modal
    const showConfirmation = (action, label) => {
        if (action === 'Cancelled') {
            setModalConfig({
                visible: true,
                title: 'Decline Order?',
                message: 'Are you sure you want to decline this order? The customer will be notified.',
                type: 'error',
                action,
            });
        } else {
            // For other status changes, update directly without confirmation
            handleStatusUpdate(action);
        }
    };

    // Handle status update
    const handleStatusUpdate = async (newStatus) => {
        if (!restaurant?.id || !orderId) {
            setModalConfig({
                visible: true,
                title: 'Error',
                message: 'Unable to update order. Please try again.',
                type: 'error',
                action: null,
            });
            return;
        }

        setUpdating(true);
        setModalConfig({ ...modalConfig, visible: false });

        try {
            const result = await updateOrderStatus(orderId, newStatus, restaurant.id);

            if (!result.success) {
                setModalConfig({
                    visible: true,
                    title: 'Update Failed',
                    message: result.error || 'Failed to update order status',
                    type: 'error',
                    action: null,
                });
            }
            // Success - the real-time listener will update the order automatically
        } catch (err) {
            setModalConfig({
                visible: true,
                title: 'Error',
                message: 'Something went wrong. Please try again.',
                type: 'error',
                action: null,
            });
        } finally {
            setUpdating(false);
        }
    };

    // Handle modal confirm
    const handleModalConfirm = () => {
        if (modalConfig.action) {
            handleStatusUpdate(modalConfig.action);
        } else {
            setModalConfig({ ...modalConfig, visible: false });
        }
    };

    // Status timeline component
    const StatusTimeline = () => {
        if (!order) return null;
        
        const currentIndex = STATUS_TO_INDEX[order.status] ?? 0;
        const isCancelled = order.status === 'Cancelled';

        return (
            <View style={styles.horizontalTimeline}>
                {TIMELINE_STEPS.map((step, index) => {
                    const isActive = !isCancelled && index <= currentIndex;
                    const isCurrent = !isCancelled && index === currentIndex;

                    return (
                        <View key={step.key} style={styles.stepContainer}>
                            {/* Icon Circle */}
                            <View style={[
                                styles.stepIconContainer,
                                {
                                    backgroundColor: isCancelled 
                                        ? theme.surfaceAlt
                                        : isActive 
                                            ? (isCurrent ? theme.primary : theme.success) 
                                            : theme.surfaceAlt,
                                }
                            ]}>
                                <Ionicons
                                    name={step.icon}
                                    size={20}
                                    color={isActive && !isCancelled ? '#FFF' : theme.textMuted}
                                />
                            </View>

                            {/* Connector Line */}
                            {index < TIMELINE_STEPS.length - 1 && (
                                <View style={[
                                    styles.connectorLine,
                                    { 
                                        backgroundColor: !isCancelled && index < currentIndex 
                                            ? theme.success 
                                            : theme.surfaceAlt 
                                    }
                                ]} />
                            )}

                            {/* Label */}
                            <Text style={[
                                styles.stepLabel,
                                {
                                    color: isActive && !isCancelled ? theme.textPrimary : theme.textMuted,
                                    fontWeight: isCurrent && !isCancelled ? fontWeight.bold : fontWeight.medium
                                }
                            ]}>
                                {step.label}
                            </Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    // Loading state
    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
                <StatusBar style={isDarkMode ? 'light' : 'dark'} />
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textMuted }]}>
                    Loading order details...
                </Text>
            </View>
        );
    }

    // Error state
    if (error || !order) {
        return (
            <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
                <StatusBar style={isDarkMode ? 'light' : 'dark'} />
                <Ionicons name="alert-circle-outline" size={60} color={theme.error} />
                <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>
                    Order Not Found
                </Text>
                <Text style={[styles.errorText, { color: theme.textMuted }]}>
                    {error || 'Unable to load order details'}
                </Text>
                <TouchableOpacity 
                    style={[styles.errorButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.back()}
                >
                    <Text style={styles.errorButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const statusActions = getStatusActions(order.status);
    const isCancelled = order.status === 'Cancelled';
    const isCompleted = order.status === 'Delivered';

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                        Order {order.orderDisplayId || `#${orderId.slice(-6)}`}
                    </Text>
                    <Text style={[styles.headerTime, { color: theme.textMuted }]}>
                        {formatDate(order.createdAt)}
                    </Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Cancelled Banner */}
                {isCancelled && (
                    <View style={[styles.cancelledBanner, { backgroundColor: `${theme.error}15` }]}>
                        <Ionicons name="close-circle" size={24} color={theme.error} />
                        <Text style={[styles.cancelledText, { color: theme.error }]}>
                            This order has been cancelled
                        </Text>
                    </View>
                )}

                {/* Completed Banner */}
                {isCompleted && (
                    <View style={[styles.completedBanner, { backgroundColor: `${theme.success}15` }]}>
                        <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                        <Text style={[styles.completedText, { color: theme.success }]}>
                            This order has been delivered
                        </Text>
                    </View>
                )}

                {/* Status Section */}
                <View style={[styles.card, { backgroundColor: theme.surface, ...shadows.soft }]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Status</Text>
                        <Badge status={order.status} />
                    </View>
                    <StatusTimeline />
                </View>

                {/* Customer Info */}
                <View style={[styles.card, { backgroundColor: theme.surface, ...shadows.soft }]}>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary, marginBottom: spacing.md }]}>
                        Customer
                    </Text>
                    <View style={styles.customerRow}>
                        <View style={[styles.iconBox, { backgroundColor: theme.surfaceAlt }]}>
                            <Ionicons name="person" size={20} color={theme.primary} />
                        </View>
                        <View style={styles.customerInfo}>
                            <Text style={[styles.customerName, { color: theme.textPrimary }]}>
                                {order.customerName || 'Customer'}
                            </Text>
                        </View>
                    </View>
                    
                    {order.customerPhone && (
                        <>
                            <View style={[styles.divider, { backgroundColor: theme.border }]} />
                            <View style={styles.customerRow}>
                                <View style={[styles.iconBox, { backgroundColor: theme.surfaceAlt }]}>
                                    <Ionicons name="call" size={20} color={theme.primary} />
                                </View>
                                <Text style={[styles.customerName, { color: theme.textPrimary }]}>
                                    {order.customerPhone || order.phoneNumber}
                                </Text>
                            </View>
                        </>
                    )}

                    {order.deliveryAddress && (
                        <>
                            <View style={[styles.divider, { backgroundColor: theme.border }]} />
                            <View style={styles.customerRow}>
                                <View style={[styles.iconBox, { backgroundColor: theme.surfaceAlt }]}>
                                    <Ionicons name="location" size={20} color={theme.primary} />
                                </View>
                                <Text style={[styles.addressText, { color: theme.textPrimary }]} numberOfLines={2}>
                                    {order.deliveryAddress}
                                </Text>
                            </View>
                        </>
                    )}
                </View>

                {/* Order Items */}
                <View style={[styles.card, { backgroundColor: theme.surface, ...shadows.soft }]}>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary, marginBottom: spacing.md }]}>
                        Items ({order.items?.length || 0})
                    </Text>
                    {order.items?.map((item, index) => (
                        <View key={`${item.id}-${index}`} style={[
                            styles.itemRow,
                            index !== order.items.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: 1 }
                        ]}>
                            <View style={[styles.quantityBadge, { backgroundColor: theme.surfaceAlt }]}>
                                <Text style={[styles.quantityText, { color: theme.textPrimary }]}>
                                    {item.quantity}x
                                </Text>
                            </View>
                            <View style={styles.itemDetails}>
                                <Text style={[styles.itemName, { color: theme.textPrimary }]}>
                                    {item.name}
                                </Text>
                                {item.specialInstructions && (
                                    <Text style={[styles.itemOptions, { color: theme.textSecondary }]}>
                                        {item.specialInstructions}
                                    </Text>
                                )}
                            </View>
                            <Text style={[styles.itemPrice, { color: theme.textPrimary }]}>
                                ${(item.price * item.quantity).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Special Instructions */}
                {order.specialInstructions && (
                    <View style={[styles.card, { backgroundColor: theme.surface, ...shadows.soft }]}>
                        <View style={styles.instructionsHeader}>
                            <Ionicons name="chatbox-outline" size={20} color={theme.warning} />
                            <Text style={[styles.cardTitle, { color: theme.textPrimary, marginLeft: spacing.sm }]}>
                                Special Instructions
                            </Text>
                        </View>
                        <Text style={[styles.instructionsText, { color: theme.textSecondary }]}>
                            {order.specialInstructions}
                        </Text>
                    </View>
                )}

                {/* Payment Summary */}
                <View style={[styles.card, { backgroundColor: theme.surface, ...shadows.soft }]}>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary, marginBottom: spacing.md }]}>
                        Payment
                    </Text>
                    <View style={styles.summaryRow}>
                        <Text style={{ color: theme.textSecondary }}>Subtotal</Text>
                        <Text style={{ color: theme.textPrimary }}>${order.subtotal?.toFixed(2) || '0.00'}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={{ color: theme.textSecondary }}>Tax</Text>
                        <Text style={{ color: theme.textPrimary }}>${order.tax?.toFixed(2) || '0.00'}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={{ color: theme.textSecondary }}>Delivery Fee</Text>
                        <Text style={{ color: theme.textPrimary }}>${order.deliveryFee?.toFixed(2) || '0.00'}</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <View style={styles.summaryRow}>
                        <Text style={[styles.totalLabel, { color: theme.textPrimary }]}>Total</Text>
                        <Text style={[styles.totalAmount, { color: theme.primary }]}>
                            ${order.total?.toFixed(2) || '0.00'}
                        </Text>
                    </View>
                </View>

                {/* Bottom spacing for footer */}
                <View style={{ height: hp('12%') }} />
            </ScrollView>

            {/* Action Buttons Footer */}
            {statusActions.length > 0 && !updating && (
                <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                    {statusActions.map((action, index) => (
                        <TouchableOpacity 
                            key={action.action}
                            style={[
                                styles.footerButton, 
                                { 
                                    backgroundColor: theme[action.color],
                                    flex: statusActions.length > 1 ? (index === 0 ? 1 : 2) : 1,
                                    marginRight: index === 0 && statusActions.length > 1 ? spacing.sm : 0,
                                }
                            ]}
                            onPress={() => showConfirmation(action.action, action.label)}
                        >
                            <Ionicons name={action.icon} size={20} color="#FFF" style={{ marginRight: spacing.xs }} />
                            <Text style={styles.footerButtonText}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Updating indicator */}
            {updating && (
                <View style={[styles.footer, styles.updatingFooter, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                    <ActivityIndicator size="small" color={theme.primary} />
                    <Text style={[styles.updatingText, { color: theme.textMuted }]}>
                        Updating order status...
                    </Text>
                </View>
            )}

            {/* Confirmation Modal */}
            <CustomModal
                visible={modalConfig.visible}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                primaryButtonText={modalConfig.action ? 'Confirm' : 'OK'}
                secondaryButtonText={modalConfig.action ? 'Cancel' : null}
                onPrimaryPress={handleModalConfirm}
                onSecondaryPress={() => setModalConfig({ ...modalConfig, visible: false })}
                onClose={() => setModalConfig({ ...modalConfig, visible: false })}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: spacing.xxl,
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: fontSize.body,
    },
    errorTitle: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
        marginTop: spacing.md,
    },
    errorText: {
        fontSize: fontSize.body,
        marginTop: spacing.sm,
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
    },
    errorButton: {
        marginTop: spacing.lg,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
    },
    errorButtonText: {
        color: '#FFF',
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerCenter: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
    },
    headerTime: {
        fontSize: fontSize.caption,
        marginTop: 2,
    },
    scrollContent: {
        padding: spacing.md,
    },
    cancelledBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: radius.md,
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    cancelledText: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
    },
    completedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: radius.md,
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    completedText: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
    },
    card: {
        padding: spacing.md,
        borderRadius: radius.md,
        marginBottom: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    cardTitle: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    horizontalTimeline: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: spacing.md,
    },
    stepContainer: {
        alignItems: 'center',
        flex: 1,
        position: 'relative',
    },
    stepIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
        zIndex: 1,
    },
    connectorLine: {
        position: 'absolute',
        top: 20,
        left: '50%',
        right: '-50%',
        height: 2,
        zIndex: 0,
    },
    stepLabel: {
        fontSize: fontSize.caption,
        textAlign: 'center',
    },
    customerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
    },
    addressText: {
        fontSize: fontSize.body,
        flex: 1,
    },
    divider: {
        height: 1,
        marginVertical: spacing.sm,
    },
    itemRow: {
        flexDirection: 'row',
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    quantityBadge: {
        minWidth: 28,
        height: 28,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
        paddingHorizontal: 4,
    },
    quantityText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.bold,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
    },
    itemOptions: {
        fontSize: fontSize.caption,
        marginTop: 2,
    },
    itemPrice: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    instructionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    instructionsText: {
        fontSize: fontSize.body,
        lineHeight: 22,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    totalLabel: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
    },
    totalAmount: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: spacing.md,
        paddingBottom: hp('4%'),
        borderTopWidth: 1,
    },
    updatingFooter: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
    },
    updatingText: {
        fontSize: fontSize.body,
    },
    footerButton: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerButtonText: {
        color: '#FFF',
        fontWeight: fontWeight.bold,
        fontSize: fontSize.body,
    },
});
