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
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCart } from '../../../contexts/CartContext';
import { spacing, fontSize, fontWeight, radius } from '../../../constants/theme';
import MenuItemModal from '../../../components/user/MenuItemModal';
import { RestaurantCardSkeleton } from '../../../components/user/LoadingSkeleton';
import CustomModal from '../../../components/CustomModal';

// Services
import { getRestaurantById, getRestaurantMenu } from '../../../services/customerRestaurantService';

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
                    ${item.price.toFixed(2)}
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

const RestaurantDetailScreen = () => {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { addItem, hasConflictingRestaurant, clearCart, itemCount } = useCart();
    
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showItemModal, setShowItemModal] = useState(false);
    const [cartConflictModal, setCartConflictModal] = useState({ visible: false, item: null });
    const scrollY = new Animated.Value(0);

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
                    style={[styles.headerButton, { backgroundColor: theme.surface }]}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={hp('2.5%')} color={theme.textPrimary} />
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.surface }]}>
                    <Ionicons name="heart-outline" size={hp('2.5%')} color={theme.textPrimary} />
                </TouchableOpacity>
            </SafeAreaView>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* Hero Image */}
                <View style={styles.heroContainer}>
                    <Image 
                        source={{ uri: restaurant.image }} 
                        style={styles.heroImage}
                    />
                    <View style={styles.heroOverlay} />
                </View>

                {/* Restaurant Info */}
                <View style={[styles.infoSection, { backgroundColor: theme.background }]}>
                    <View style={styles.infoHeader}>
                        <View style={styles.infoMain}>
                            <Text style={[styles.restaurantName, { color: theme.textPrimary }]}>
                                {restaurant.name}
                            </Text>
                            <Text style={[styles.cuisineText, { color: theme.textMuted }]}>
                                {restaurant.categories?.join(' • ')}
                            </Text>
                        </View>
                        
                        <View style={[styles.ratingBadge, { backgroundColor: theme.primary }]}>
                            <Ionicons name="star" size={hp('1.6%')} color="#fff" />
                            <Text style={styles.ratingText}>{restaurant.rating?.toFixed(1)}</Text>
                        </View>
                    </View>

                    {/* Quick Info Pills */}
                    <View style={styles.pillsRow}>
                        <View style={[styles.infoPill, { backgroundColor: theme.surfaceAlt }]}>
                            <Ionicons name="time-outline" size={hp('1.8%')} color={theme.primary} />
                            <Text style={[styles.pillText, { color: theme.textPrimary }]}>
                                {restaurant.estimatedDeliveryTime} min
                            </Text>
                        </View>
                        <View style={[styles.infoPill, { backgroundColor: theme.surfaceAlt }]}>
                            <Ionicons name="bicycle-outline" size={hp('1.8%')} color={theme.primary} />
                            <Text style={[styles.pillText, { color: theme.textPrimary }]}>
                                ${restaurant.deliveryFee?.toFixed(2)}
                            </Text>
                        </View>
                        <View style={[styles.infoPill, { backgroundColor: theme.surfaceAlt }]}>
                            <Text style={[styles.pillText, { color: theme.primary, fontWeight: fontWeight.bold }]}>
                                {restaurant.priceRange}
                            </Text>
                        </View>
                    </View>

                    {/* Description */}
                    <Text style={[styles.description, { color: theme.textSecondary }]}>
                        {restaurant.description}
                    </Text>
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
        width: hp('4.5%'),
        height: hp('4.5%'),
        borderRadius: hp('2.25%'),
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
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    infoSection: {
        padding: spacing.md,
        marginTop: -spacing.lg,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
    },
    infoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    infoMain: {
        flex: 1,
        marginRight: spacing.md,
    },
    restaurantName: {
        fontSize: fontSize.title,
        fontWeight: fontWeight.bold,
        letterSpacing: -0.5,
        marginBottom: hp('0.2%'),
    },
    cuisineText: {
        fontSize: fontSize.caption,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: hp('0.4%'),
        borderRadius: radius.pill,
        gap: wp('1%'),
    },
    ratingText: {
        color: '#fff',
        fontSize: fontSize.caption,
        fontWeight: fontWeight.bold,
    },
    pillsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    infoPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: hp('0.5%'),
        borderRadius: radius.pill,
        gap: wp('1%'),
    },
    pillText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.medium,
    },
    description: {
        fontSize: fontSize.body,
        lineHeight: hp('2.6%'),
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

