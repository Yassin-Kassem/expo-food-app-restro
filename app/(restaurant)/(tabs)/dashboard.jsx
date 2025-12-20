import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import OrderCard from '../../../components/restaurant/OrderCard';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useAuth } from '../../../hooks/useAuth';
import { useRestaurant } from '../../../hooks/useRestaurant';
import { listenOrdersByRestaurant } from '../../../services/orderService';
import { updateRestaurant } from '../../../services/restaurantService';

export default function Dashboard() {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();
    const { user } = useAuth();
    const { restaurant, loading: restaurantLoading } = useRestaurant(user?.uid);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    
    // Initialize isOpen from restaurant data, default to true if not set
    const isOpen = restaurant?.isOpen ?? true;

    const currentDate = new Date();
    const dateString = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    const handleToggleStatus = async (newValue) => {
        if (!restaurant?.id || updatingStatus) return;
        
        setUpdatingStatus(true);
        let isMounted = true;

        try {
            const result = await updateRestaurant(restaurant.id, { 
                isOpen: newValue,
                restaurantStatus: newValue ? 'open' : 'closed'
            });
            
            if (!isMounted) return;

            if (!result.success) {
                // Only show error for non-retryable errors
                // Retryable errors will be handled silently (user can try again)
                if (!result.retryable) {
                    // Could show error toast here
                    // showErrorToast(result.error);
                }
            }
        } catch (error) {
            if (!isMounted) return;
            // Silent error - user can try again
        } finally {
            if (isMounted) {
                setUpdatingStatus(false);
            }
        }
    };

    useEffect(() => {
        if (!restaurant?.id) {
            setOrders([]);
            setOrdersLoading(false);
            return;
        }

        setOrdersLoading(true);
        const unsubscribe = listenOrdersByRestaurant(restaurant.id, (result) => {
            if (result.success) {
                setOrders(result.data || []);
            } else {
                // Only clear orders on non-retryable errors
                if (!result.retryable) {
                    setOrders([]);
                }
            }
            setOrdersLoading(false);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [restaurant?.id]);

    const ordersWithDerivedFields = useMemo(
        () =>
            orders.map((order) => {
                const createdAt = order.createdAt ? new Date(order.createdAt) : null;
                const formattedTime = createdAt
                    ? createdAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                    : '';

                return {
                    ...order,
                    time: order.time || formattedTime,
                    total: typeof order.total === 'number' ? order.total.toFixed(2) : order.total || '0.00',
                    itemsCount: order.itemsCount ?? order.items?.length ?? 0,
                    customerName: order.customerName || 'Customer'
                };
            }),
        [orders]
    );

    const stats = useMemo(() => {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Total orders today: Only count accepted orders (exclude Pending)
        const todayAcceptedOrders = ordersWithDerivedFields.filter((order) => {
            if (!order.createdAt) return false;
            const orderDate = new Date(order.createdAt);
            const isToday = orderDate >= startOfDay;
            // Exclude pending orders - only count accepted orders
            const isAccepted = order.status !== 'Pending';
            return isToday && isAccepted;
        });

        // Revenue today: Only count delivered orders (fully completed)
        const todayDeliveredOrders = ordersWithDerivedFields.filter((order) => {
            if (!order.createdAt) return false;
            const orderDate = new Date(order.createdAt);
            const isToday = orderDate >= startOfDay;
            // Only count delivered orders for revenue
            const isDelivered = order.status === 'Delivered';
            return isToday && isDelivered;
        });

        const revenueToday = todayDeliveredOrders.reduce(
            (sum, order) => sum + (typeof order.total === 'string' ? parseFloat(order.total) || 0 : order.total || 0),
            0
        );

        return {
            ordersToday: todayAcceptedOrders.length,
            revenueToday: revenueToday.toLocaleString('en-US', {
                style: 'currency',
                currency: 'GBP'
            })
        };
    }, [ordersWithDerivedFields]);

    const activeOrders = useMemo(
        () =>
            ordersWithDerivedFields
                .filter((order) => ['Pending', 'Preparing', 'Cooking', 'Ready', 'Out for Delivery'].includes(order.status))
                .slice(0, 3),
        [ordersWithDerivedFields]
    );

    const isLoading = restaurantLoading || ordersLoading;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header: Restaurant Name & Date */}
                <View style={[styles.headerSection, { marginBottom: spacing.lg }]}>
                    <View>
                        <Text style={[styles.restaurantName, { color: theme.textPrimary }]}>
                            {restaurant?.name || 'Your Restaurant'}
                        </Text>
                        <View style={styles.dateRow}>
                            <Ionicons name="calendar-outline" size={hp('1.75%')} color={theme.textSecondary} />
                            <Text style={[styles.dateText, { color: theme.textSecondary }]}>{dateString}</Text>
                        </View>
                    </View>
                    <View style={[styles.statusContainer, { backgroundColor: isOpen ? theme.statusOpen : theme.surfaceAlt, ...shadows.soft }]}>
                        <View style={[styles.statusDot, { backgroundColor: isOpen ? theme.success : theme.textMuted }]} />
                        <Text style={[
                            styles.statusText,
                            { color: isOpen ? theme.statusOpenText : theme.textMuted },
                        ]}>
                            {isOpen ? 'Open' : 'Closed'}
                        </Text>
                        <Switch
                            value={isOpen}
                            onValueChange={handleToggleStatus}
                            trackColor={{ false: theme.border, true: theme.success }}
                            thumbColor={'#fff'}
                            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                            disabled={updatingStatus || !restaurant?.id}
                        />
                    </View>
                </View>

                {/* Stats Row */}
                <View style={[styles.statsRow, { marginBottom: spacing.xl }]}>
                    <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border, ...shadows.soft }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: isDarkMode ? theme.activeBg : '#DBEAFE' }]}>
                            <Ionicons name="receipt-outline" size={hp('2.5%')} color={isDarkMode ? theme.activeText : '#2563EB'} />
                        </View>
                        <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                            {isLoading ? '...' : stats.ordersToday}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Today's Orders</Text>
                        <View style={[styles.trendBadge, { backgroundColor: theme.statusOpen }]}>
                            <Ionicons name="arrow-up" size={hp('1.2%')} color={theme.statusOpenText} />
                            <Text style={[styles.trendText, { color: theme.statusOpenText }]}>Live</Text>
                        </View>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border, ...shadows.soft }]}>
                        <View style={[styles.statIconContainer, { backgroundColor: isDarkMode ? theme.completedBg : '#D1FAE5' }]}>
                            <Ionicons name="cash-outline" size={hp('2.5%')} color={isDarkMode ? theme.completedText : '#059669'} />
                        </View>
                        <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                            {isLoading ? '...' : stats.revenueToday}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Revenue</Text>
                        <View style={[styles.trendBadge, { backgroundColor: theme.statusOpen }]}>
                            <Ionicons name="arrow-up" size={hp('1.2%')} color={theme.statusOpenText} />
                            <Text style={[styles.trendText, { color: theme.statusOpenText }]}>Live</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Quick Actions</Text>
                </View>
                <View style={[styles.quickActions, { marginBottom: spacing.xl }]}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.primary, ...shadows.soft }]}
                        onPress={() => router.push('/(restaurant)/menu/add-item')}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                            <Ionicons name="add-circle-outline" size={hp('2.5%')} color="#FFF" />
                        </View>
                        <Text style={styles.actionButtonText}>Add New Item</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, ...shadows.soft }]}
                        onPress={() => router.push('/(restaurant)/(tabs)/orders')}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.actionIconContainer, { backgroundColor: theme.surfaceAlt }]}>
                            <Ionicons name="list-outline" size={hp('2.5%')} color={theme.primary} />
                        </View>
                        <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>Manage Orders</Text>
                    </TouchableOpacity>
                </View>

                {/* Active Orders */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Active Orders</Text>
                    <TouchableOpacity onPress={() => router.push('/(restaurant)/(tabs)/orders')}>
                        <Text style={[styles.seeAll, { color: theme.primary }]}>See All </Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.ordersList, { paddingBottom: 80 }]}>
                    {isLoading ? (
                        <View style={{ padding: spacing.lg, alignItems: 'center' }}>
                            <ActivityIndicator color={theme.primary} />
                            <Text style={{ marginTop: spacing.sm, color: theme.textSecondary }}>Loading orders... </Text>
                        </View>
                    ) : activeOrders.length === 0 ? (
                        <View style={{ padding: spacing.lg, alignItems: 'center' }}>
                            <Ionicons name="fast-food-outline" size={32} color={theme.textMuted} />
                            <Text style={{ marginTop: spacing.sm, color: theme.textSecondary }}>No active orders </Text>
                        </View>
                    ) : (
                        activeOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onPress={() => router.push(`/(restaurant)/order/${order.id}`)}
                                actionLabel={order.status === 'Pending' ? 'Accept Order' : 'Update Status'}
                                onActionPress={() => router.push(`/(restaurant)/order/${order.id}`)}
                            />
                        ))
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: spacing.xl,
    },
    scrollContent: {
        padding: spacing.md,
        zIndex: 1,
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    restaurantName: {
        fontSize: fontSize.hero,
        fontWeight: fontWeight.bold,
        letterSpacing: -1,
        marginBottom: spacing.xs,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: hp('0.25%'),
    },
    dateText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.medium,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: spacing.sm,
        paddingRight: spacing.xs,
        paddingVertical: spacing.xs,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    statusDot: {
        width: wp('1.5%'),
        height: wp('1.5%'),
        borderRadius: wp('0.75%'),
        marginRight: spacing.xs,
    },
    statusText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
        marginRight: spacing.xs,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    statIconContainer: {
        width: wp('10%'),
        height: wp('10%'),
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    statValue: {
        fontSize: fontSize.title,
        fontWeight: fontWeight.bold,
        marginBottom: hp('0.25%'),
        letterSpacing: -0.5,
        textAlign: 'center',
        width: '100%',
    },
    statLabel: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.medium,
        marginBottom: spacing.xs,
        textAlign: 'center',
        width: '100%',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: wp('1.5%'),
        paddingVertical: hp('0.25%'),
        borderRadius: radius.sm,
        marginTop: spacing.xs,
    },
    trendText: {
        fontSize: hp('1.2%'),
        fontWeight: fontWeight.bold,
        marginLeft: wp('0.5%'),
    },
    sectionTitle: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.semibold,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    seeAll: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
    },
    quickActions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: radius.lg,
        minHeight: hp('10%'),
    },
    actionIconContainer: {
        width: wp('10%'),
        height: wp('10%'),
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    actionButtonText: {
        fontWeight: fontWeight.semibold,
        fontSize: fontSize.body,
        color: '#FFF',
    },
    ordersList: {
        gap: spacing.sm,
    },
});
