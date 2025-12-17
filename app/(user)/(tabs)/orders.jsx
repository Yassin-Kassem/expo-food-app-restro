import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import EmptyState from '../../../components/user/EmptyState';

// Placeholder order data for UI development
const DUMMY_ORDERS = [
    {
        id: '1',
        restaurantName: 'Bodega Taqueria y Tequila',
        restaurantImage: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=200',
        status: 'preparing',
        items: ['Carnitas Tacos x2', 'Guacamole'],
        total: 32.99,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
        estimatedDelivery: '25-35 min',
    },
    {
        id: '2',
        restaurantName: 'Osteria Francescana',
        restaurantImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200',
        status: 'completed',
        items: ['Truffle Risotto', 'Tiramisu'],
        total: 54.00,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
];

const OrderStatusBadge = ({ status }) => {
    const { theme, isDarkMode } = useTheme();
    
    const statusConfig = isDarkMode ? {
        pending: { color: '#FBBF24', bg: '#78350F', label: 'Pending' },
        confirmed: { color: '#60A5FA', bg: '#1E3A5F', label: 'Confirmed' },
        preparing: { color: '#A78BFA', bg: '#4C1D95', label: 'Preparing' },
        ready: { color: '#34D399', bg: '#064E3B', label: 'Ready' },
        out_for_delivery: { color: '#38BDF8', bg: '#0C4A6E', label: 'On the way' },
        completed: { color: '#9CA3AF', bg: '#374151', label: 'Delivered' },
        cancelled: { color: '#F87171', bg: '#7F1D1D', label: 'Cancelled' },
    } : {
        pending: { color: '#F59E0B', bg: '#FEF3C7', label: 'Pending' },
        confirmed: { color: '#3B82F6', bg: '#DBEAFE', label: 'Confirmed' },
        preparing: { color: '#8B5CF6', bg: '#EDE9FE', label: 'Preparing' },
        ready: { color: '#10B981', bg: '#D1FAE5', label: 'Ready' },
        out_for_delivery: { color: '#0EA5E9', bg: '#E0F2FE', label: 'On the way' },
        completed: { color: '#6B7280', bg: '#F3F4F6', label: 'Delivered' },
        cancelled: { color: '#EF4444', bg: '#FEE2E2', label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: config.color }]} />
            <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
    );
};

const OrderCard = ({ order, onPress }) => {
    const { theme } = useTheme();
    const isActive = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status);

    const formatDate = (date) => {
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            if (hours === 0) {
                const minutes = Math.floor(diff / (1000 * 60));
                return `${minutes} min ago`;
            }
            return `${hours}h ago`;
        }
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
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
                        {order.restaurantName}
                    </Text>
                    <Text style={[styles.orderDate, { color: theme.textMuted }]}>
                        {formatDate(order.createdAt)}
                    </Text>
                </View>
                <OrderStatusBadge status={order.status} />
            </View>

            <View style={styles.orderItems}>
                <Text style={[styles.itemsText, { color: theme.textSecondary }]} numberOfLines={1}>
                    {order.items.join(' • ')}
                </Text>
            </View>

            <View style={styles.orderFooter}>
                <Text style={[styles.totalLabel, { color: theme.textMuted }]}>Total</Text>
                <Text style={[styles.totalAmount, { color: theme.textPrimary }]}>
                    ${order.total.toFixed(2)}
                </Text>
                
                {isActive && order.estimatedDelivery && (
                    <View style={[styles.etaBadge, { backgroundColor: `${theme.primary}15` }]}>
                        <Ionicons name="time-outline" size={hp('1.6%')} color={theme.primary} />
                        <Text style={[styles.etaText, { color: theme.primary }]}>
                            {order.estimatedDelivery}
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
    const [activeTab, setActiveTab] = useState('active');
    const [refreshing, setRefreshing] = useState(false);
    const [orders, setOrders] = useState(DUMMY_ORDERS);

    const activeOrders = orders.filter(o => 
        ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)
    );
    const pastOrders = orders.filter(o => 
        ['completed', 'cancelled'].includes(o.status)
    );

    const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

    const handleRefresh = async () => {
        setRefreshing(true);
        // TODO: Fetch real orders
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    const handleOrderPress = (order) => {
        router.push(`/(user)/order-tracking?orderId=${order.id}`);
    };

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
                        Past Orders
                    </Text>
                </TouchableOpacity>
            </View>

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

