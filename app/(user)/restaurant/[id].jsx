import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity,
    Image,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCart } from '../../../contexts/CartContext';
import { useLocation } from '../../../contexts/LocationContext';
import { useAuth } from '../../../hooks/useAuth';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import MenuItemModal from '../../../components/user/MenuItemModal';
import { RestaurantCardSkeleton } from '../../../components/user/LoadingSkeleton';
import CustomModal from '../../../components/CustomModal';

// Services
import { getRestaurantById, getRestaurantMenu } from '../../../services/customerRestaurantService';
import { toggleFavorite, isRestaurantFavorited } from '../../../services/favoritesService';

const MenuItemCard = ({ item, onPress }) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: theme.surface }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemName, { color: theme.textPrimary }]} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={[styles.menuItemDesc, { color: theme.textMuted }]} numberOfLines={2}>
                    {item.description}
                </Text>
                <Text style={[styles.menuItemPrice, { color: theme.primary }]}>
                    £{item.price.toFixed(2)}
                </Text>
            </View>
            
            <View style={styles.menuItemRight}>
                <Image 
                    source={{ uri: item.imageUrl }} 
                    style={styles.menuItemImage}
                    defaultSource={require('../../../assets/icon.png')}
                />
                <View style={[styles.tapIndicator, { backgroundColor: theme.primary }]}>
                    <Ionicons name="add" size={hp('2%')} color="#fff" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

// Calculate delivery fee based on distance
// Base fee: £2.50, then £0.50 per km after first 2km
const calculateDeliveryFee = (restaurantLocation, userLocation) => {
    // If no location data, return default fee
    if (!restaurantLocation || !userLocation) {
        return 2.50; // Default base fee
    }
    
    const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        restaurantLocation.lat,
        restaurantLocation.lng
    );
    
    // Base fee for first 2km
    const baseFee = 2.50;
    const perKmFee = 0.50;
    const freeKm = 2;
    
    if (distance <= freeKm) {
        return baseFee;
    }
    
    // Calculate fee: base + (distance - freeKm) * perKmFee
    const additionalKm = distance - freeKm;
    const fee = baseFee + (additionalKm * perKmFee);
    
    // Round to 2 decimal places
    return Math.round(fee * 100) / 100;
};

// Calculate estimated delivery time based on distance
// Base time: 25 min, then ~3 min per km after first 2km
const calculateDeliveryTime = (restaurantLocation, userLocation, baseTime = 25) => {
    // If no location data, return base time
    if (!restaurantLocation || !userLocation) {
        return baseTime;
    }
    
    const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        restaurantLocation.lat,
        restaurantLocation.lng
    );
    
    // Base time for first 2km
    const freeKm = 2;
    const minutesPerKm = 3;
    
    if (distance <= freeKm) {
        return baseTime;
    }
    
    // Calculate time: base + (distance - freeKm) * minutesPerKm
    const additionalKm = distance - freeKm;
    const totalTime = baseTime + (additionalKm * minutesPerKm);
    
    // Round to nearest 5 minutes for cleaner display
    return Math.round(totalTime / 5) * 5;
};

const RestaurantDetailScreen = () => {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { addItem, hasConflictingRestaurant, clearCart, itemCount } = useCart();
    const { location: userLocation } = useLocation();
    const { user } = useAuth();
    
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showItemModal, setShowItemModal] = useState(false);
    const [cartConflictModal, setCartConflictModal] = useState({ visible: false, item: null });
    const [isFavorite, setIsFavorite] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const scrollY = new Animated.Value(0);
    
    // Calculate delivery fee and time based on user location
    const calculatedDeliveryFee = useMemo(() => {
        if (restaurant?.location && userLocation) {
            return calculateDeliveryFee(restaurant.location, userLocation);
        }
        return restaurant?.deliveryFee || 2.50;
    }, [restaurant?.location, restaurant?.deliveryFee, userLocation]);
    
    const calculatedDeliveryTime = useMemo(() => {
        if (restaurant?.location && userLocation) {
            return calculateDeliveryTime(
                restaurant.location, 
                userLocation, 
                restaurant?.estimatedDeliveryTime || 25
            );
        }
        return restaurant?.estimatedDeliveryTime || 25;
    }, [restaurant?.location, restaurant?.estimatedDeliveryTime, userLocation]);

    // Fetch restaurant and menu from Firebase
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch restaurant details
                const restaurantResult = await getRestaurantById(id);
                if (restaurantResult.success) {
                    setRestaurant(restaurantResult.data);
                }

                // Fetch menu items
                const menuResult = await getRestaurantMenu(id);
                if (menuResult.success) {
                    setMenuItems(menuResult.data.items || []);
                }
            } catch (error) {
                console.error('Error fetching restaurant data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id]);

    // Check favorite status when restaurant and user are available
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (user?.uid && restaurant?.id) {
                try {
                    const result = await isRestaurantFavorited(user.uid, restaurant.id);
                    if (result.success) {
                        setIsFavorite(result.isFavorite || false);
                    }
                } catch (error) {
                    console.error('Error checking favorite status:', error);
                }
            }
        };

        checkFavoriteStatus();
    }, [user?.uid, restaurant?.id]);

    // Handle favorite toggle
    const handleToggleFavorite = useCallback(async () => {
        if (!user?.uid || !restaurant?.id || isToggling) return;

        setIsToggling(true);
        const newFavoriteState = !isFavorite;
        
        // Optimistically update UI
        setIsFavorite(newFavoriteState);
        
        try {
            const result = await toggleFavorite(user.uid, restaurant.id, isFavorite);
            
            if (!result.success) {
                // Revert on error
                setIsFavorite(isFavorite);
                console.error('Error toggling favorite:', result.error);
            }
        } catch (error) {
            // Revert on error
            setIsFavorite(isFavorite);
            console.error('Error toggling favorite:', error);
        } finally {
            setIsToggling(false);
        }
    }, [user?.uid, restaurant?.id, isFavorite, isToggling]);

    const menuByCategory = useMemo(() => {
        const grouped = {};
        menuItems.forEach(item => {
            const cat = item.category || 'Other';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(item);
        });
        return grouped;
    }, [menuItems]);

    const categories = Object.keys(menuByCategory);

    useEffect(() => {
        if (categories.length > 0 && !activeCategory) {
            setActiveCategory(categories[0]);
        }
    }, [categories]);

    const handleItemPress = (item) => {
        setSelectedItem(item);
        setShowItemModal(true);
    };

    const handleAddToCart = useCallback((item) => {
        if (hasConflictingRestaurant(restaurant.id)) {
            setCartConflictModal({ visible: true, item });
        } else {
            addItem(item, restaurant);
        }
    }, [restaurant, hasConflictingRestaurant, addItem]);

    const handleClearAndAdd = useCallback(() => {
        if (cartConflictModal.item) {
            clearCart();
            addItem(cartConflictModal.item, restaurant);
        }
        setCartConflictModal({ visible: false, item: null });
    }, [cartConflictModal.item, clearCart, addItem, restaurant]);

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.loadingContainer}>
                    <RestaurantCardSkeleton />
                    <RestaurantCardSkeleton />
                </View>
            </SafeAreaView>
        );
    }

    if (!restaurant) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: theme.textPrimary }]}>
                        Restaurant not found
                    </Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={[styles.errorLink, { color: theme.primary }]}>Go back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Fixed Header */}
            <Animated.View style={[
                styles.fixedHeader, 
                { 
                    backgroundColor: theme.surface,
                    opacity: headerOpacity,
                }
            ]} />
            
            <SafeAreaView edges={['top']} style={styles.headerButtons}>
                <TouchableOpacity 
                    style={[styles.headerButton, { backgroundColor: theme.surface }, shadows.soft]}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={hp('2.5%')} color={theme.textPrimary} />
                </TouchableOpacity>
                
                {user?.uid && (
                    <TouchableOpacity 
                        style={[styles.headerButton, { backgroundColor: theme.surface }, shadows.soft]}
                        onPress={handleToggleFavorite}
                        activeOpacity={0.7}
                        disabled={isToggling}
                    >
                        <Ionicons 
                            name={isFavorite ? "heart" : "heart-outline"} 
                            size={hp('2.5%')} 
                            color={isFavorite ? theme.favorite : theme.textPrimary} 
                        />
                    </TouchableOpacity>
                )}
            </SafeAreaView>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* Hero Image with Gradient Overlay */}
                <View style={styles.heroContainer}>
                    <Image 
                        source={{ uri: restaurant.image }} 
                        style={styles.heroImage}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
                        style={styles.heroGradient}
                    />
                </View>

                {/* Restaurant Info Card */}
                <View style={[styles.infoCard, { backgroundColor: theme.surface }, shadows.medium]}>
                    {/* Header Section with Logo */}
                    <View style={styles.infoHeader}>
                        {/* Restaurant Logo */}
                        {restaurant.logoUrl && (
                            <View style={[styles.infoLogoContainer, { backgroundColor: theme.surfaceAlt }]}>
                                <Image 
                                    source={{ uri: restaurant.logoUrl }} 
                                    style={styles.infoLogo}
                                    resizeMode="cover"
                                />
                            </View>
                        )}
                        <View style={styles.infoMain}>
                            <View style={styles.nameRow}>
                                <Text style={[styles.restaurantName, { color: theme.textPrimary }]}>
                                    {restaurant.name}
                                </Text>
                                {/* Rating Badge in Info Card */}
                                <View style={[styles.infoRatingBadge, { backgroundColor: theme.primary }]}>
                                    <Ionicons name="star" size={hp('1.4%')} color="#fff" />
                                    <Text style={styles.infoRatingText}>{restaurant.rating?.toFixed(1)}</Text>
                                </View>
                            </View>
                            <View style={styles.cuisineRow}>
                                <Ionicons name="restaurant-outline" size={hp('1.6%')} color={theme.primary} />
                                <Text style={[styles.cuisineText, { color: theme.textMuted }]}>
                                    {restaurant.categories?.join(' • ')}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Quick Info Pills - Enhanced */}
                    <View style={styles.pillsRow}>
                        <View style={[styles.infoPill, { backgroundColor: `${theme.primary}15` }]}>
                            <View style={[styles.pillIconContainer, { backgroundColor: theme.primary }]}>
                                <Ionicons name="time" size={hp('1.6%')} color="#fff" />
                            </View>
                            <View style={styles.pillContent}>
                                <Text style={[styles.pillLabel, { color: theme.textMuted }]}>Delivery</Text>
                                <Text style={[styles.pillValue, { color: theme.textPrimary }]}>
                                    {calculatedDeliveryTime} min
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.infoPill, { backgroundColor: `${theme.primary}15` }]}>
                            <View style={[styles.pillIconContainer, { backgroundColor: theme.primary }]}>
                                <Ionicons name="bicycle" size={hp('1.6%')} color="#fff" />
                            </View>
                            <View style={styles.pillContent}>
                                <Text style={[styles.pillLabel, { color: theme.textMuted }]}>Fee</Text>
                                <Text style={[styles.pillValue, { color: theme.textPrimary }]}>
                                    £{calculatedDeliveryFee.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.infoPill, { backgroundColor: `${theme.primary}15` }]}>
                            <View style={[styles.pillIconContainer, { backgroundColor: theme.primary }]}>
                                <Ionicons name="cash" size={hp('1.6%')} color="#fff" />
                            </View>
                            <View style={styles.pillContent}>
                                <Text style={[styles.pillLabel, { color: theme.textMuted }]}>Price</Text>
                                <Text style={[styles.pillValue, { color: theme.textPrimary }]}>
                                    {restaurant.priceRange}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Category Tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryTabs}
                >
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.categoryTab,
                                { 
                                    backgroundColor: activeCategory === cat ? theme.primary : theme.surface,
                                    borderColor: activeCategory === cat ? theme.primary : theme.border,
                                }
                            ]}
                            onPress={() => setActiveCategory(cat)}
                        >
                            <Text style={[
                                styles.categoryTabText,
                                { color: activeCategory === cat ? '#fff' : theme.textSecondary }
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Menu */}
                <View style={styles.menuSection}>
                    {categories.map((category) => (
                        <View key={category} style={styles.categorySection}>
                            <View style={styles.categoryHeader}>
                                <View style={[styles.categoryAccent, { backgroundColor: theme.primary }]} />
                                <Text style={[styles.categoryTitle, { color: theme.textPrimary }]}>
                                    {category}
                                </Text>
                                <Text style={[styles.categoryCount, { color: theme.textMuted }]}>
                                    {menuByCategory[category].length} items
                                </Text>
                            </View>
                            {menuByCategory[category].map((item) => (
                                <MenuItemCard
                                    key={item.id}
                                    item={item}
                                    onPress={() => handleItemPress(item)}
                                />
                            ))}
                        </View>
                    ))}
                </View>

                <View style={{ height: hp('12%') }} />
            </Animated.ScrollView>

            {/* Cart FAB */}
            {itemCount > 0 && (
                <TouchableOpacity
                    style={[styles.cartFab, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/(user)/cart')}
                >
                    <View style={styles.cartFabContent}>
                        <View style={styles.cartCount}>
                            <Text style={styles.cartCountText}>{itemCount}</Text>
                        </View>
                        <Text style={styles.cartFabText}>View Cart</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={hp('2%')} color="#fff" />
                </TouchableOpacity>
            )}

            {/* Menu Item Modal */}
            <MenuItemModal
                visible={showItemModal}
                item={selectedItem}
                restaurant={restaurant}
                onClose={() => {
                    setShowItemModal(false);
                    setSelectedItem(null);
                }}
                onAddToCart={handleAddToCart}
            />

            {/* Cart Conflict Modal */}
            <CustomModal
                visible={cartConflictModal.visible}
                title="Start new cart?"
                message="Your cart has items from another restaurant."
                type="warning"
                primaryButtonText="Clear & Add"
                secondaryButtonText="Cancel"
                onPrimaryPress={handleClearAndAdd}
                onSecondaryPress={() => setCartConflictModal({ visible: false, item: null })}
                onClose={() => setCartConflictModal({ visible: false, item: null })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fixedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: hp('12%'),
        zIndex: 10,
    },
    headerButtons: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
    },
    headerButton: {
        width: hp('5%'),
        height: hp('5%'),
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroContainer: {
        height: hp('25%'),
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    heroGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    infoCard: {
        marginTop: -spacing.xl,
        marginHorizontal: spacing.md,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.md,
        borderRadius: radius.xl,
        ...shadows.medium,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    infoLogoContainer: {
        width: hp('6%'),
        height: hp('6%'),
        borderRadius: radius.lg,
        padding: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    infoLogo: {
        width: '100%',
        height: '100%',
        borderRadius: radius.md,
    },
    infoMain: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    restaurantName: {
        fontSize: fontSize.title,
        fontWeight: fontWeight.bold,
        letterSpacing: -0.5,
        flex: 1,
    },
    infoRatingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: hp('0.3%'),
        borderRadius: radius.pill,
        gap: wp('1%'),
    },
    infoRatingText: {
        color: '#fff',
        fontSize: fontSize.caption,
        fontWeight: fontWeight.bold,
    },
    cuisineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    cuisineText: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
    },
    pillsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: 0,
    },
    infoPill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.sm,
        borderRadius: radius.lg,
        gap: spacing.sm,
    },
    pillIconContainer: {
        width: hp('3.5%'),
        height: hp('3.5%'),
        borderRadius: hp('1.75%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillContent: {
        flex: 1,
    },
    pillLabel: {
        fontSize: hp('1.2%'),
        fontWeight: fontWeight.regular,
        marginBottom: hp('0.1%'),
    },
    pillValue: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.bold,
    },
    categoryTabs: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    categoryTab: {
        paddingHorizontal: spacing.md,
        paddingVertical: hp('0.8%'),
        borderRadius: radius.pill,
        borderWidth: 1,
        marginRight: spacing.sm,
    },
    categoryTabText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
    },
    menuSection: {
        paddingHorizontal: spacing.md,
    },
    categorySection: {
        marginBottom: spacing.lg,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    categoryAccent: {
        width: wp('1%'),
        height: hp('2%'),
        borderRadius: wp('0.5%'),
    },
    categoryTitle: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
        flex: 1,
    },
    categoryCount: {
        fontSize: fontSize.caption,
    },
    menuItem: {
        flexDirection: 'row',
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.sm,
    },
    menuItemContent: {
        flex: 1,
        marginRight: spacing.md,
    },
    menuItemName: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
        marginBottom: hp('0.2%'),
    },
    menuItemDesc: {
        fontSize: fontSize.caption,
        lineHeight: hp('2%'),
        marginBottom: hp('0.5%'),
    },
    menuItemPrice: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    menuItemRight: {
        position: 'relative',
    },
    menuItemImage: {
        width: hp('9%'),
        height: hp('9%'),
        borderRadius: radius.md,
    },
    tapIndicator: {
        position: 'absolute',
        bottom: -hp('0.8%'),
        right: -hp('0.8%'),
        width: hp('3.5%'),
        height: hp('3.5%'),
        borderRadius: hp('1.75%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartFab: {
        position: 'absolute',
        bottom: hp('3%'),
        left: spacing.md,
        right: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.xl,
    },
    cartFabContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    cartCount: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: spacing.sm,
        paddingVertical: hp('0.2%'),
        borderRadius: radius.sm,
    },
    cartCountText: {
        color: '#fff',
        fontSize: fontSize.caption,
        fontWeight: fontWeight.bold,
    },
    cartFabText: {
        color: '#fff',
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    loadingContainer: {
        flex: 1,
        padding: spacing.md,
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: fontSize.body,
        marginBottom: spacing.sm,
    },
    errorLink: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
    },
});

export default RestaurantDetailScreen;

