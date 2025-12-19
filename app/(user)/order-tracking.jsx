import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme';
import { listenToSingleOrder, ORDER_STATUSES } from '../../services/orderService';

// Order steps matching the delivery flow
const ORDER_STEPS = [
    { id: 'Pending', label: 'Order Placed', icon: 'receipt', description: 'Waiting for restaurant confirmation' },
    { id: 'Preparing', label: 'Preparing', icon: 'restaurant', description: 'The kitchen is preparing your food' },
    { id: 'Ready', label: 'Ready', icon: 'bag-check', description: 'Your order is ready' },
    { id: 'Out for Delivery', label: 'On the Way', icon: 'bicycle', description: 'Driver is heading to you' },
    { id: 'Delivered', label: 'Delivered', icon: 'home', description: 'Enjoy your meal!' },
];

// Map status string to step index
const STATUS_TO_STEP = {
    'Pending': 0,
    'Preparing': 1,
    'Ready': 2,
    'Out for Delivery': 3,
    'Delivered': 4,
    'Cancelled': -1,
};

export default function OrderTracking() {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const orderId = params.orderId;
    const isSuccess = params.success === 'true';

    // Set up real-time listener for order updates
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

        // Cleanup listener on unmount
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [orderId]);

    // Get current step index from order status
    const currentStep = order ? (STATUS_TO_STEP[order.status] ?? 0) : 0;
    const isCancelled = order?.status === ORDER_STATUSES.CANCELLED;
    const isDelivered = order?.status === ORDER_STATUSES.DELIVERED;

    const getStepColor = (stepIndex) => {
        if (isCancelled) return theme.textMuted;
        if (stepIndex < currentStep) return theme.success;
        if (stepIndex === currentStep) return theme.primary;
        return theme.textMuted;
    };

    const getStepBgColor = (stepIndex) => {
        if (isCancelled) return theme.surfaceAlt;
        if (stepIndex < currentStep) return isDarkMode ? '#064E3B' : '#D1FAE5';
        if (stepIndex === currentStep) return isDarkMode ? `${theme.primary}30` : `${theme.primary}15`;
        return theme.surfaceAlt;
    };

    // Format estimated delivery time
    const getEstimatedTime = () => {
        if (!order?.estimatedDeliveryTime) return '25-35 minutes';
        const time = order.estimatedDeliveryTime;
        return `${time - 5}-${time + 5} minutes`;
    };

    // Format order display ID
    const getDisplayOrderId = () => {
        if (order?.orderDisplayId) return order.orderDisplayId;
        if (orderId) return `#${orderId.slice(-6).toUpperCase()}`;
        return 'Order';
    };

    // Loading state
    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
                <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>
                        Loading order details...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error || !order) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
                <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={hp('8%')} color={theme.error} />
                    <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>
                        Order Not Found
                    </Text>
                    <Text style={[styles.errorText, { color: theme.textMuted }]}>
                        {error || 'Unable to load order details'}
                    </Text>
                    <TouchableOpacity 
                        style={[styles.errorButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.replace('/(user)/(tabs)/home')}
                    >
                        <Text style={styles.errorButtonText}>Go Home</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={[styles.backButton, { backgroundColor: theme.surface }]}
                    onPress={() => router.replace('/(user)/(tabs)/home')}
                >
                    <Ionicons name="close" size={hp('2.5%')} color={theme.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                        Order Status
                    </Text>
                    <Text style={[styles.orderId, { color: theme.textMuted }]}>
                        {getDisplayOrderId()}
                    </Text>
                </View>
                <View style={{ width: hp('5%') }} />
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Success Banner - only show on initial placement */}
                {isSuccess && currentStep === 0 && (
                    <View style={[styles.successBanner, { backgroundColor: isDarkMode ? '#064E3B' : '#D1FAE5' }]}>
                        <Ionicons name="checkmark-circle" size={hp('3%')} color={theme.success} />
                        <View style={styles.successContent}>
                            <Text style={[styles.successTitle, { color: isDarkMode ? '#34D399' : '#059669' }]}>
                                Order Placed Successfully!
                            </Text>
                            <Text style={[styles.successText, { color: isDarkMode ? '#A7F3D0' : '#047857' }]}>
                                Waiting for {order.restaurantName} to confirm
                            </Text>
                        </View>
                    </View>
                )}

                {/* Cancelled Banner */}
                {isCancelled && (
                    <View style={[styles.cancelledBanner, { backgroundColor: isDarkMode ? '#7F1D1D' : '#FEE2E2' }]}>
                        <Ionicons name="close-circle" size={hp('3%')} color={theme.error} />
                        <View style={styles.successContent}>
                            <Text style={[styles.successTitle, { color: isDarkMode ? '#F87171' : '#DC2626' }]}>
                                Order Cancelled
                            </Text>
                            <Text style={[styles.successText, { color: isDarkMode ? '#FECACA' : '#B91C1C' }]}>
                                {order.cancellationReason || 'This order has been cancelled'}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Delivered Banner */}
                {isDelivered && (
                    <View style={[styles.successBanner, { backgroundColor: isDarkMode ? '#064E3B' : '#D1FAE5' }]}>
                        <Ionicons name="checkmark-done-circle" size={hp('3%')} color={theme.success} />
                        <View style={styles.successContent}>
                            <Text style={[styles.successTitle, { color: isDarkMode ? '#34D399' : '#059669' }]}>
                                Order Delivered!
                            </Text>
                            <Text style={[styles.successText, { color: isDarkMode ? '#A7F3D0' : '#047857' }]}>
                                We hope you enjoyed your meal from {order.restaurantName}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Restaurant Info */}
                <View style={[styles.restaurantCard, { backgroundColor: theme.surface }]}>
                    <View style={[styles.restaurantIcon, { backgroundColor: `${theme.primary}15` }]}>
                        <Ionicons name="restaurant" size={hp('2.5%')} color={theme.primary} />
                    </View>
                    <View style={styles.restaurantInfo}>
                        <Text style={[styles.restaurantName, { color: theme.textPrimary }]}>
                            {order.restaurantName}
                        </Text>
                        <Text style={[styles.itemCount, { color: theme.textMuted }]}>
                            {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''} • ${order.total?.toFixed(2) || '0.00'}
                        </Text>
                    </View>
                </View>

                {/* Estimated Time - only show for active orders */}
                {!isCancelled && !isDelivered && (
                    <View style={[styles.timeCard, { backgroundColor: theme.surface }]}>
                        <View style={[styles.timeIconContainer, { backgroundColor: `${theme.primary}15` }]}>
                            <Ionicons name="time" size={hp('3%')} color={theme.primary} />
                        </View>
                        <View>
                            <Text style={[styles.timeLabel, { color: theme.textMuted }]}>
                                Estimated Delivery
                            </Text>
                            <Text style={[styles.timeValue, { color: theme.textPrimary }]}>
                                {getEstimatedTime()}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Order Steps */}
                <View style={[styles.stepsCard, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                        Order Progress
                    </Text>
                    
                    {ORDER_STEPS.map((step, index) => (
                        <View key={step.id} style={styles.stepContainer}>
                            {/* Step Line */}
                            {index > 0 && (
                                <View style={[
                                    styles.stepLine,
                                    { 
                                        backgroundColor: !isCancelled && index <= currentStep 
                                            ? theme.success 
                                            : theme.border,
                                    }
                                ]} />
                            )}
                            
                            {/* Step Icon */}
                            <View style={[
                                styles.stepIcon,
                                { backgroundColor: getStepBgColor(index) }
                            ]}>
                                <Ionicons 
                                    name={step.icon} 
                                    size={hp('2%')} 
                                    color={getStepColor(index)} 
                                />
                            </View>
                            
                            {/* Step Content */}
                            <View style={styles.stepContent}>
                                <Text style={[
                                    styles.stepLabel,
                                    { 
                                        color: !isCancelled && index <= currentStep 
                                            ? theme.textPrimary 
                                            : theme.textMuted,
                                        fontWeight: index === currentStep && !isCancelled 
                                            ? fontWeight.bold 
                                            : fontWeight.medium,
                                    }
                                ]}>
                                    {step.label}
                                </Text>
                                <Text style={[styles.stepDescription, { color: theme.textMuted }]}>
                                    {step.description}
                                </Text>
                            </View>
                            
                            {/* Completed Check */}
                            {!isCancelled && index < currentStep && (
                                <Ionicons name="checkmark" size={hp('2%')} color={theme.success} />
                            )}
                        </View>
                    ))}
                </View>

                {/* Order Items */}
                <View style={[styles.itemsCard, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                        Order Items
                    </Text>
                    
                    {order.items?.map((item, index) => (
                        <View 
                            key={`${item.id}-${index}`} 
                            style={[
                                styles.orderItem,
                                index < order.items.length - 1 && { 
                                    borderBottomColor: theme.border,
                                    borderBottomWidth: 1,
                                }
                            ]}
                        >
                            <View style={[styles.itemQty, { backgroundColor: theme.surfaceAlt }]}>
                                <Text style={[styles.itemQtyText, { color: theme.textPrimary }]}>
                                    {item.quantity}x
                                </Text>
                            </View>
                            <Text style={[styles.itemName, { color: theme.textPrimary }]} numberOfLines={2}>
                                {item.name}
                            </Text>
                            <Text style={[styles.itemPrice, { color: theme.textMuted }]}>
                                ${(item.price * item.quantity).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Delivery Address */}
                <View style={[styles.addressCard, { backgroundColor: theme.surface }]}>
                    <View style={styles.addressHeader}>
                        <Ionicons name="location" size={hp('2.2%')} color={theme.primary} />
                        <Text style={[styles.addressLabel, { color: theme.textMuted }]}>
                            Delivery Address
                        </Text>
                    </View>
                    <Text style={[styles.addressText, { color: theme.textPrimary }]}>
                        {order.deliveryAddress}
                    </Text>
                </View>

                {/* Help Section */}
                <View style={[styles.helpCard, { backgroundColor: theme.surface }]}>
                    <TouchableOpacity style={styles.helpItem}>
                        <View style={[styles.helpIcon, { backgroundColor: `${theme.info}15` }]}>
                            <Ionicons name="call" size={hp('2%')} color={theme.info} />
                        </View>
                        <Text style={[styles.helpText, { color: theme.textPrimary }]}>
                            Call Restaurant
                        </Text>
                        <Ionicons name="chevron-forward" size={hp('2%')} color={theme.textMuted} />
                    </TouchableOpacity>
                    
                    <View style={[styles.helpDivider, { backgroundColor: theme.border }]} />
                    
                    <TouchableOpacity style={styles.helpItem}>
                        <View style={[styles.helpIcon, { backgroundColor: `${theme.warning}15` }]}>
                            <Ionicons name="help-circle" size={hp('2%')} color={theme.warning} />
                        </View>
                        <Text style={[styles.helpText, { color: theme.textPrimary }]}>
                            Need Help?
                        </Text>
                        <Ionicons name="chevron-forward" size={hp('2%')} color={theme.textMuted} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={[styles.bottomContainer, { backgroundColor: theme.surface }]}>
                <TouchableOpacity 
                    style={[styles.homeButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.replace('/(user)/(tabs)/home')}
                >
                    <Text style={styles.homeButtonText}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
    loadingText: {
        fontSize: fontSize.body,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
        gap: spacing.md,
    },
    errorTitle: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
    },
    errorText: {
        fontSize: fontSize.body,
        textAlign: 'center',
    },
    errorButton: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.lg,
        marginTop: spacing.md,
    },
    errorButtonText: {
        color: '#fff',
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    backButton: {
        width: hp('5%'),
        height: hp('5%'),
        borderRadius: hp('2.5%'),
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.soft,
    },
    headerCenter: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
    },
    orderId: {
        fontSize: fontSize.caption,
        marginTop: hp('0.3%'),
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: hp('12%'),
    },
    successBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    cancelledBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    successContent: {
        flex: 1,
    },
    successTitle: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    successText: {
        fontSize: fontSize.caption,
        marginTop: hp('0.2%'),
    },
    restaurantCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        gap: spacing.md,
        ...shadows.soft,
    },
    restaurantIcon: {
        width: hp('5%'),
        height: hp('5%'),
        borderRadius: hp('2.5%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    restaurantInfo: {
        flex: 1,
    },
    restaurantName: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    itemCount: {
        fontSize: fontSize.caption,
        marginTop: hp('0.2%'),
    },
    timeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        gap: spacing.md,
        ...shadows.soft,
    },
    timeIconContainer: {
        width: hp('6%'),
        height: hp('6%'),
        borderRadius: hp('3%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeLabel: {
        fontSize: fontSize.caption,
    },
    timeValue: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
    },
    stepsCard: {
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        ...shadows.soft,
    },
    sectionTitle: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.md,
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        position: 'relative',
    },
    stepLine: {
        position: 'absolute',
        left: hp('2.1%'),
        top: -hp('1.5%'),
        width: 2,
        height: hp('3%'),
    },
    stepIcon: {
        width: hp('4.2%'),
        height: hp('4.2%'),
        borderRadius: hp('2.1%'),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    stepContent: {
        flex: 1,
    },
    stepLabel: {
        fontSize: fontSize.body,
    },
    stepDescription: {
        fontSize: fontSize.caption,
        marginTop: hp('0.2%'),
    },
    itemsCard: {
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        ...shadows.soft,
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        gap: spacing.sm,
    },
    itemQty: {
        paddingHorizontal: spacing.sm,
        paddingVertical: hp('0.3%'),
        borderRadius: radius.sm,
        minWidth: hp('3.5%'),
        alignItems: 'center',
    },
    itemQtyText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.bold,
    },
    itemName: {
        flex: 1,
        fontSize: fontSize.body,
    },
    itemPrice: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
    },
    addressCard: {
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        ...shadows.soft,
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    addressLabel: {
        fontSize: fontSize.caption,
    },
    addressText: {
        fontSize: fontSize.body,
        lineHeight: hp('2.5%'),
    },
    helpCard: {
        borderRadius: radius.lg,
        overflow: 'hidden',
        ...shadows.soft,
    },
    helpItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    helpIcon: {
        width: hp('4%'),
        height: hp('4%'),
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    helpText: {
        flex: 1,
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
    },
    helpDivider: {
        height: 1,
        marginLeft: hp('4%') + spacing.md * 2,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.md,
        paddingBottom: hp('4%'),
        ...shadows.floating,
    },
    homeButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: radius.xl,
    },
    homeButtonText: {
        color: '#fff',
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
});
