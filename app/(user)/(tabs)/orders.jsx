import React, { useState, useEffect, useMemo } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import EmptyState from '../../../components/user/EmptyState';
import { listenToUserOrders, ACTIVE_STATUSES, COMPLETED_STATUSES } from '../../../services/orderService';

// Status badge component with proper status mapping
const OrderStatusBadge = ({ status }) => {
    const { theme, isDarkMode } = useTheme();
    
    // Map status to lowercase for consistent matching
    const normalizedStatus = status?.toLowerCase().replace(/ /g, '_') || 'pending';
    
    const statusConfig = isDarkMode ? {
        pending: { color: '#FBBF24', bg: '#78350F', label: 'Pending' },
        preparing: { color: '#A78BFA', bg: '#4C1D95', label: 'Preparing' },
        ready: { color: '#34D399', bg: '#064E3B', label: 'Ready' },
        out_for_delivery: { color: '#38BDF8', bg: '#0C4A6E', label: 'On the way' },
        delivered: { color: '#9CA3AF', bg: '#374151', label: 'Delivered' },
        cancelled: { color: '#F87171', bg: '#7F1D1D', label: 'Cancelled' },
    } : {
        pending: { color: '#F59E0B', bg: '#FEF3C7', label: 'Pending' },
        preparing: { color: '#8B5CF6', bg: '#EDE9FE', label: 'Preparing' },
        ready: { color: '#10B981', bg: '#D1FAE5', label: 'Ready' },
        out_for_delivery: { color: '#0EA5E9', bg: '#E0F2FE', label: 'On the way' },
        delivered: { color: '#6B7280', bg: '#F3F4F6', label: 'Delivered' },
        cancelled: { color: '#EF4444', bg: '#FEE2E2', label: 'Cancelled' },
    };

    const config = statusConfig[normalizedStatus] || statusConfig.pending;

    return (
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: config.color }]} />
            <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
    );
};

// Order card component
const OrderCard = ({ order, onPress }) => {
    const { theme } = useTheme();
    const isActive = ACTIVE_STATUSES.includes(order.status);

    // Format relative time
    const formatDate = (date) => {
        if (!date) return '';
        const now = new Date();
        const orderDate = date instanceof Date ? date : new Date(date);
        const diff = now - orderDate;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            if (hours === 0) {
                const minutes = Math.floor(diff / (1000 * 60));
                if (minutes < 1) return 'Just now';
                return `${minutes} min ago`;
            }
            return `${hours}h ago`;
        }
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return orderDate.toLocaleDateString();
    };

    // Format items list for display
    const formatItems = (items) => {
        if (!items || items.length === 0) return 'No items';
        return items.map(item => `${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}`).join(' • ');
    };

    // Get estimated delivery time string
    const getEstimatedTime = () => {
        if (!order.estimatedDeliveryTime) return null;
        const time = order.estimatedDeliveryTime;
        return `${time - 5}-${time + 5} min`;
    };

    return (
        <TouchableOpacity
            style={[
                styles.orderCard,
                { 
                    backgroundColor: theme.surface,
                    borderLeftColor: isActive ? theme.primary : 'transparent',
                }
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                    <Text style={[styles.restaurantName, { color: theme.textPrimary }]}>
                        {order.restaurantName || 'Restaurant'}
                    </Text>
                    <Text style={[styles.orderDate, { color: theme.textMuted }]}>
                        {formatDate(order.createdAt)}
                    </Text>
                </View>
                <OrderStatusBadge status={order.status} />
            </View>

            <View style={styles.orderItems}>
                <Text style={[styles.itemsText, { color: theme.textSecondary }]} numberOfLines={1}>
                    {formatItems(order.items)}
                </Text>
            </View>

            <View style={styles.orderFooter}>
                <Text style={[styles.totalLabel, { color: theme.textMuted }]}>Total</Text>
                <Text style={[styles.totalAmount, { color: theme.textPrimary }]}>
                    ${order.total?.toFixed(2) || '0.00'}
                </Text>
                
                {isActive && getEstimatedTime() && (
                    <View style={[styles.etaBadge, { backgroundColor: `${theme.primary}15` }]}>
                        <Ionicons name="time-outline" size={hp('1.6%')} color={theme.primary} />
                        <Text style={[styles.etaText, { color: theme.primary }]}>
                            {getEstimatedTime()}
                        </Text>
                    </View>
                )}
            </View>

            {isActive && (
                <View style={[styles.trackButton, { borderTopColor: theme.border }]}>
                    <Text style={[styles.trackButtonText, { color: theme.primary }]}>
                        Track Order
                    </Text>
                    <Ionicons name="arrow-forward" size={hp('2%')} color={theme.primary} />
                </View>
            )}
        </TouchableOpacity>
    );
};

const OrdersScreen = () => {
    const { theme } = useTheme();
    const router = useRouter();
    const { user } = useAuth();
    
    const [activeTab, setActiveTab] = useState('active');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Set up real-time listener for user's orders
    useEffect(() => {
        if (!user?.uid) {
            setLoading(false);
            setOrders([]);
            return;
        }

        setLoading(true);
        
        const unsubscribe = listenToUserOrders(user.uid, (result) => {
            setLoading(false);
            setRefreshing(false);
            
            if (result.success) {
                setOrders(result.data || []);
                setError(null);
            } else {
                setError(result.error);
                setOrders([]);
            }
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user?.uid]);

    // Filter orders into active and past
    const activeOrders = useMemo(() => 
        orders.filter(o => ACTIVE_STATUSES.includes(o.status)),
        [orders]
    );
    
    const pastOrders = useMemo(() => 
        orders.filter(o => COMPLETED_STATUSES.includes(o.status)),
        [orders]
    );

    const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

    // Handle pull-to-refresh (triggers re-render with latest data)
    const handleRefresh = () => {
        setRefreshing(true);
        // The listener will automatically provide fresh data
        // Set a timeout to stop refreshing if no update comes
        setTimeout(() => setRefreshing(false), 2000);
    };

    const handleOrderPress = (order) => {
        router.push(`/(user)/order-tracking?orderId=${order.id}`);
    };

    // Loading state
    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                        My Orders
                    </Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.loadingText, { color: theme.textMuted }]}>
                        Loading your orders...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                    My Orders
                </Text>
            </View>

            {/* Tabs */}
            <View style={[styles.tabsContainer, { backgroundColor: theme.surfaceAlt }]}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'active' && [styles.activeTab, { backgroundColor: theme.surface }]
                    ]}
                    onPress={() => setActiveTab('active')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'active' ? theme.primary : theme.textMuted }
                    ]}>
                        Active ({activeOrders.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'past' && [styles.activeTab, { backgroundColor: theme.surface }]
                    ]}
                    onPress={() => setActiveTab('past')}
                >
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'past' ? theme.primary : theme.textMuted }
                    ]}>
                        Past Orders ({pastOrders.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Error State */}
            {error && (
                <View style={[styles.errorBanner, { backgroundColor: `${theme.error}15` }]}>
                    <Ionicons name="alert-circle" size={hp('2%')} color={theme.error} />
                    <Text style={[styles.errorText, { color: theme.error }]}>
                        {error}
                    </Text>
                </View>
            )}

            {/* Orders List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={theme.primary}
                    />
                }
            >
                {displayedOrders.length > 0 ? (
                    displayedOrders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onPress={() => handleOrderPress(order)}
                        />
                    ))
                ) : (
                    <EmptyState
                        icon="receipt-outline"
                        title={activeTab === 'active' ? 'No active orders' : 'No past orders'}
                        message={activeTab === 'active' 
                            ? "Your active orders will appear here" 
                            : "Your order history will appear here"
                        }
                        actionText="Browse Restaurants"
                        onActionPress={() => router.push('/(user)/(tabs)/browse')}
                        variant="orders"
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        fontSize: fontSize.hero,
        fontWeight: fontWeight.bold,
        letterSpacing: -0.5,
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
    tabsContainer: {
        flexDirection: 'row',
        marginHorizontal: spacing.md,
        padding: spacing.xs,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderRadius: radius.md,
    },
    activeTab: {
        ...shadows.soft,
    },
    tabText: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        padding: spacing.md,
        borderRadius: radius.md,
        gap: spacing.sm,
    },
    errorText: {
        fontSize: fontSize.caption,
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: hp('12%'),
    },
    orderCard: {
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderLeftWidth: 4,
        ...shadows.soft,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    orderInfo: {
        flex: 1,
        marginRight: spacing.sm,
    },
    restaurantName: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
        marginBottom: hp('0.3%'),
    },
    orderDate: {
        fontSize: fontSize.caption,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: hp('0.4%'),
        borderRadius: radius.pill,
        gap: wp('1%'),
    },
    statusDot: {
        width: wp('1.5%'),
        height: wp('1.5%'),
        borderRadius: wp('1%'),
    },
    statusText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
    },
    orderItems: {
        marginBottom: spacing.sm,
    },
    itemsText: {
        fontSize: fontSize.caption,
    },
    orderFooter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: fontSize.caption,
        marginRight: wp('1%'),
    },
    totalAmount: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
        flex: 1,
    },
    etaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: hp('0.4%'),
        borderRadius: radius.pill,
        gap: wp('1%'),
    },
    etaText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
    },
    trackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: spacing.md,
        marginTop: spacing.md,
        borderTopWidth: 1,
        gap: wp('1%'),
    },
    trackButtonText: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
    },
});

export default OrdersScreen;
