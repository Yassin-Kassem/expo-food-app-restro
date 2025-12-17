import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import OrderCard from '../../../components/restaurant/OrderCard';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../hooks/useAuth';
import { useRestaurant } from '../../../hooks/useRestaurant';
import { listenOrdersByRestaurant } from '../../../services/orderService';

export default function OrdersScreen() {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();
    const { user } = useAuth();
    const { restaurant, loading: restaurantLoading } = useRestaurant(user?.uid);
    const [activeTab, setActiveTab] = useState('active');
    const slideAnim = useRef(new Animated.Value(0)).current;
    const tabsContainerRef = useRef(null);
    const [tabWidth, setTabWidth] = useState(0);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    useEffect(() => {
        if (!restaurant?.id) return;

        setOrdersLoading(true);
        const unsubscribe = listenOrdersByRestaurant(restaurant.id, (result) => {
            if (result.success) {
                setOrders(result.data);
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

    const filteredOrders = useMemo(() => {
        return ordersWithDerivedFields.filter(order => {
            if (activeTab === 'active') {
                return ['Pending', 'Cooking', 'Ready'].includes(order.status);
            }
            return ['Completed', 'Cancelled'].includes(order.status);
        });
    }, [ordersWithDerivedFields, activeTab]);

    const activeCount = useMemo(
        () => ordersWithDerivedFields.filter(o => ['Pending', 'Cooking', 'Ready'].includes(o.status)).length,
        [ordersWithDerivedFields]
    );
    const completedCount = useMemo(
        () => ordersWithDerivedFields.filter(o => ['Completed', 'Cancelled'].includes(o.status)).length,
        [ordersWithDerivedFields]
    );
    const pendingCount = useMemo(
        () => ordersWithDerivedFields.filter(o => o.status === 'Pending').length,
        [ordersWithDerivedFields]
    );

    // Animate tab switch
    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: activeTab === 'active' ? 0 : 1,
            useNativeDriver: true,
            tension: 68,
            friction: 8,
        }).start();
    }, [activeTab]);

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Orders </Text>

            {/* Stats Cards */}
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border, ...shadows.soft }]}>
                    <View style={[styles.statIconContainer, { backgroundColor: isDarkMode ? theme.pendingBg : '#FEF3C7' }]}>
                        <Ionicons name="time-outline" size={20} color={isDarkMode ? theme.pendingText : '#D97706'} />
                    </View>
                    <Text style={[styles.statValue, { color: theme.textPrimary }]}>{pendingCount}</Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending </Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border, ...shadows.soft }]}>
                    <View style={[styles.statIconContainer, { backgroundColor: isDarkMode ? theme.activeBg : '#DBEAFE' }]}>
                        <Ionicons name="flame-outline" size={20} color={isDarkMode ? theme.activeText : '#2563EB'} />
                    </View>
                    <Text style={[styles.statValue, { color: theme.textPrimary }]}>{activeCount}</Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active </Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border, ...shadows.soft }]}>
                    <View style={[styles.statIconContainer, { backgroundColor: isDarkMode ? theme.completedBg : '#D1FAE5' }]}>
                        <Ionicons name="checkmark-circle-outline" size={20} color={isDarkMode ? theme.completedText : '#059669'} />
                    </View>
                    <Text style={[styles.statValue, { color: theme.textPrimary }]}>{completedCount}</Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed </Text>
                </View>
            </View>

            {/* Tabs */}
            <View 
                ref={tabsContainerRef}
                style={[styles.tabsContainer, { backgroundColor: theme.surfaceAlt }]}
                onLayout={(event) => {
                    const width = event.nativeEvent.layout.width;
                    setTabWidth((width - 8) / 2); // Subtract container padding (4px on each side)
                }}
            >
                {/* Animated sliding indicator */}
                {tabWidth > 0 && (
                    <Animated.View
                        style={[
                            styles.slidingIndicator,
                            {
                                backgroundColor: theme.surface,
                                width: tabWidth,
                                transform: [{
                                    translateX: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, tabWidth],
                                    })
                                }]
                            },
                            shadows.soft
                        ]}
                    />
                )}
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => setActiveTab('active')}
                    activeOpacity={0.8}
                >
                    <Ionicons 
                        name={activeTab === 'active' ? 'flame' : 'flame-outline'} 
                        size={16} 
                        color={activeTab === 'active' ? theme.primary : theme.textSecondary}
                        style={{ marginRight: spacing.xs }}
                    />
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'active' ? theme.primary : theme.textSecondary }
                    ]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => setActiveTab('completed')}
                    activeOpacity={0.8}
                >
                    <Ionicons 
                        name={activeTab === 'completed' ? 'checkmark-circle' : 'checkmark-circle-outline'} 
                        size={16} 
                        color={activeTab === 'completed' ? theme.primary : theme.textSecondary}
                        style={{ marginRight: spacing.xs }}
                    />
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'completed' ? theme.primary : theme.textSecondary }
                    ]}>Completed</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <FlatList
                data={filteredOrders}
                keyExtractor={item => item.id}
                renderItem={({ item }) =>
                    <OrderCard
                        order={item}
                        onPress={() => router.push(`/(restaurant)/order/${item.id}`)}
                        actionLabel={item.status === 'Pending' ? 'Accept ' : undefined}
                    />
                }
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={renderHeader}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    ordersLoading || restaurantLoading ? (
                        <View style={styles.emptyContainer}>
                            <ActivityIndicator color={theme.primary} />
                            <Text style={[styles.emptyText, { color: theme.textMuted, marginTop: spacing.sm }]}>
                                Loading orders...
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <View style={[styles.emptyIconContainer, { backgroundColor: theme.surfaceAlt }]}>
                                <Ionicons name="receipt-outline" size={48} color={theme.textMuted} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No orders yet</Text>
                            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                                {activeTab === 'active' 
                                    ? 'All caught up! New orders will appear here.' 
                                    : 'No completed orders to show.'}
                            </Text>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: spacing.xl,
    },
    listContent: {
        padding: spacing.md,
        zIndex: 1,
    },
    header: {
        marginBottom: spacing.md,
    },
    title: {
        fontSize: fontSize.titleXL,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.lg,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    statCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        alignItems: 'center',
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    statValue: {
        fontSize: fontSize.title,
        fontWeight: fontWeight.bold,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.medium,
    },
    tabsContainer: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: radius.pill,
        height: 48,
        alignItems: 'center',
        position: 'relative',
    },
    slidingIndicator: {
        position: 'absolute',
        height: '100%',
        borderRadius: radius.pill,
        left: 4,
    },
    tab: {
        flex: 1,
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.pill,
        zIndex: 1,
    },
    tabText: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
    },
    emptyContainer: {
        padding: spacing.xxl,
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: radius.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.sm,
    },
    emptyText: {
        fontSize: fontSize.body,
        textAlign: 'center',
        lineHeight: 22,
    },
});
