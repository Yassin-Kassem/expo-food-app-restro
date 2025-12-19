import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity, 
    RefreshControl,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLocation } from '../../../contexts/LocationContext';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../hooks/useAuth';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';

// Components
import HeroBanner from '../../../components/user/HeroBanner';
import CategoryGrid from '../../../components/user/CategoryGrid';
import RestaurantCard from '../../../components/user/RestaurantCard';
import AddressModal from '../../../components/user/AddressModal';
import ActiveOrderCard from '../../../components/user/ActiveOrderCard';
import { HomeScreenSkeleton } from '../../../components/user/LoadingSkeleton';

// Services
import { getAllRestaurants } from '../../../services/customerRestaurantService';
import { listenToActiveUserOrder } from '../../../services/orderService';

const HomeScreen = () => {
    const { theme, isDarkMode } = useTheme();
    const { location, address, getCurrentLocation, hasLocation } = useLocation();
    const { itemCount } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [restaurants, setRestaurants] = useState([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [activeOrder, setActiveOrder] = useState(null);

    // Load restaurants from Firebase
    const loadRestaurants = useCallback(async () => {
        try {
            const userLocation = hasLocation ? {
                latitude: location?.latitude,
                longitude: location?.longitude
            } : null;
            
            const result = await getAllRestaurants(userLocation);
            
            if (result.success) {
                setRestaurants(result.data);
            } else {
                console.error('Error loading restaurants:', result.error);
            }
        } catch (error) {
            console.error('Error loading restaurants:', error);
        } finally {
            setLoading(false);
        }
    }, [hasLocation, location]);

    useEffect(() => {
        loadRestaurants();
    }, [loadRestaurants]);

    useEffect(() => {
        if (!hasLocation) {
            getCurrentLocation();
        }
    }, []);

    // Listen to user's active order for the active order card
    useEffect(() => {
        if (!user?.uid) {
            setActiveOrder(null);
            return;
        }

        const unsubscribe = listenToActiveUserOrder(user.uid, (result) => {
            if (result.success) {
                setActiveOrder(result.data);
            } else {
                setActiveOrder(null);
            }
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user?.uid]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadRestaurants();
        setRefreshing(false);
    };

    // Filter restaurants by category
    const filteredRestaurants = useMemo(() => {
        if (selectedCategory === 'all') return restaurants;
        return restaurants.filter(r => 
            r.categories?.some(cat => 
                cat.toLowerCase().includes(selectedCategory.replace('-', ' '))
            )
        );
    }, [restaurants, selectedCategory]);

    // Nearby restaurants (Kitchen Near You)
    const nearbyRestaurants = useMemo(() => {
        if (!hasLocation) return restaurants.slice(0, 6);
        return [...restaurants]
            .filter(r => r.distance)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 6);
    }, [restaurants, hasLocation]);

    const handleRestaurantPress = (restaurant) => {
        router.push(`/(user)/restaurant/${restaurant.id}`);
    };

    const handleSeeAll = (section) => {
        router.push({
            pathname: '/(user)/(tabs)/browse',
            params: { section },
        });
    };

    const handleSearchPress = () => {
        router.push('/(user)/(tabs)/browse');
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category.id);
    };

    if (loading) {
        return <HomeScreenSkeleton />;
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
            
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={theme.primary}
                        colors={[theme.primary]}
                    />
                }
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header: Location + Cart */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.locationButton}
                        onPress={() => setShowAddressModal(true)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.locationIcon, { backgroundColor: `${theme.primary}15` }]}>
                            <Ionicons name="location" size={hp('2.2%')} color={theme.primary} />
                        </View>
                        <View style={styles.locationContent}>
                            <Text style={[styles.locationLabel, { color: theme.textMuted }]}>
                                Delivery To
                            </Text>
                            <View style={styles.locationAddressRow}>
                                <Text style={[styles.locationText, { color: theme.textPrimary }]} numberOfLines={1}>
                                    {address || 'Set delivery location'}
                                </Text>
                                <Ionicons name="chevron-down" size={hp('2%')} color={theme.textPrimary} />
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.cartButton, { backgroundColor: theme.surface }]}
                        onPress={() => router.push('/(user)/cart')}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="bag-outline" size={hp('2.4%')} color={theme.textPrimary} />
                        {itemCount > 0 && (
                            <View style={[styles.cartBadge, { backgroundColor: theme.primary }]}>
                                <Text style={styles.cartBadgeText}>{itemCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Active Order Card - shown when user has an active order */}
                {activeOrder && (
                    <ActiveOrderCard order={activeOrder} />
                )}

                {/* Search Bar */}
                <TouchableOpacity 
                    style={[styles.searchBar, { backgroundColor: theme.surfaceAlt }]}
                    onPress={handleSearchPress}
                    activeOpacity={0.8}
                >
                    <Ionicons name="search" size={hp('2.2%')} color={theme.textMuted} />
                    <Text style={[styles.searchPlaceholder, { color: theme.textMuted }]}>
                        Search foods and Kitchen
                    </Text>
                    <TouchableOpacity 
                        style={[styles.filterButton, { backgroundColor: theme.primary }]}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="options-outline" size={hp('2%')} color="#fff" />
                    </TouchableOpacity>
                </TouchableOpacity>

                {/* Quick Filter Pills */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quickFilters}
                >
                    {['Steak', 'Wings', 'Breakfast', 'Lunch', 'Dinner'].map((filter, index) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterPill,
                                { 
                                    backgroundColor: index === 0 ? theme.primary : theme.surface,
                                    borderColor: index === 0 ? theme.primary : theme.border,
                                }
                            ]}
                            activeOpacity={0.8}
                        >
                            <Text style={[
                                styles.filterPillText,
                                { color: index === 0 ? '#fff' : theme.textPrimary }
                            ]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Promo Banner */}
                <HeroBanner />

                {/* Category Icons */}
                <CategoryGrid
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                    variant="circular"
                />

                {/* Kitchen Near You Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                            Kitchen Near You
                        </Text>
                        <TouchableOpacity 
                            onPress={() => handleSeeAll('nearby')}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.seeAllText, { color: theme.primary }]}>
                                See all
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalList}
                    >
                        {nearbyRestaurants.map((restaurant) => (
                            <RestaurantCard
                                key={restaurant.id}
                                restaurant={restaurant}
                                variant="compact"
                                onPress={() => handleRestaurantPress(restaurant)}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* All Restaurants / Filtered Results */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                            {selectedCategory === 'all' 
                                ? 'All Restaurants' 
                                : selectedCategory.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())
                            }
                        </Text>
                        <TouchableOpacity 
                            onPress={() => handleSeeAll('all')}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.seeAllText, { color: theme.primary }]}>
                                See all
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.verticalList}>
                        {(selectedCategory === 'all' ? restaurants : filteredRestaurants)
                            .slice(0, 4)
                            .map((restaurant) => (
                                <RestaurantCard
                                    key={restaurant.id}
                                    restaurant={restaurant}
                                    variant="default"
                                    onPress={() => handleRestaurantPress(restaurant)}
                                />
                            ))
                        }
                    </View>
                </View>

                {/* Bottom spacing */}
                <View style={{ height: hp('10%') }} />
            </ScrollView>

            {/* Address Modal */}
            <AddressModal
                visible={showAddressModal}
                onClose={() => setShowAddressModal(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: spacing.sm,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: spacing.md,
    },
    locationIcon: {
        width: hp('4.5%'),
        height: hp('4.5%'),
        borderRadius: hp('2.25%'),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    locationContent: {
        flex: 1,
    },
    locationLabel: {
        fontSize: hp('1.2%'),
        fontWeight: fontWeight.medium,
    },
    locationAddressRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
        flex: 1,
    },
    cartButton: {
        width: hp('5%'),
        height: hp('5%'),
        borderRadius: hp('2.5%'),
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.soft,
    },
    cartBadge: {
        position: 'absolute',
        top: -hp('0.3%'),
        right: -hp('0.3%'),
        minWidth: hp('2%'),
        height: hp('2%'),
        borderRadius: hp('1%'),
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: hp('0.3%'),
    },
    cartBadgeText: {
        color: '#fff',
        fontSize: hp('1%'),
        fontWeight: fontWeight.bold,
    },

    // Search Bar
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        paddingLeft: spacing.md,
        paddingRight: spacing.xs,
        paddingVertical: hp('0.8%'),
        borderRadius: radius.lg,
        gap: spacing.sm,
    },
    searchPlaceholder: {
        flex: 1,
        fontSize: fontSize.body,
        fontWeight: fontWeight.regular,
    },
    filterButton: {
        width: hp('4.5%'),
        height: hp('4.5%'),
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Quick Filters
    quickFilters: {
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    filterPill: {
        paddingHorizontal: spacing.md,
        paddingVertical: hp('0.9%'),
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    filterPillText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
    },

    // Section
    section: {
        marginTop: spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
    },
    seeAllText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
    },
    horizontalList: {
        paddingLeft: spacing.md,
    },
    verticalList: {
        paddingHorizontal: spacing.md,
    },
});

export default HomeScreen;
