import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity,
    TouchableWithoutFeedback,
    FlatList,
    RefreshControl,
    Modal,
    Animated,
    PanResponder,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLocation } from '../../../contexts/LocationContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_THRESHOLD = 100;

import SearchBar from '../../../components/user/SearchBar';
import RestaurantCard from '../../../components/user/RestaurantCard';
import CategoryGrid, { CATEGORIES } from '../../../components/user/CategoryGrid';
import EmptyState from '../../../components/user/EmptyState';
import { RestaurantCardSkeleton } from '../../../components/user/LoadingSkeleton';
import RestaurantMapView from '../../../components/user/RestaurantMapView';

// Services
import { getAllRestaurants, getRestaurantById } from '../../../services/customerRestaurantService';
import { useAuth } from '../../../hooks/useAuth';
import { listenToUserFavorites } from '../../../services/favoritesService';

const SORT_OPTIONS = [
    { id: 'default', label: 'Recommended', icon: 'sparkles-outline' },
    { id: 'distance', label: 'Nearest', icon: 'location-outline' },
    { id: 'rating', label: 'Top Rated', icon: 'star-outline' },
];

// Category ID to normalized name mapping for better matching
const CATEGORY_MAPPING = {
    'fast-food': ['fast food', 'burger', 'burgers', 'fastfood'],
    'healthy': ['healthy', 'salad', 'salads', 'vegan', 'vegetarian'],
    'desserts': ['dessert', 'desserts', 'sweet', 'sweets', 'cake', 'cakes'],
    'asian': ['asian', 'chinese', 'japanese', 'thai', 'korean', 'vietnamese'],
    'pizza': ['pizza', 'pizzas'],
    'sushi': ['sushi', 'sashimi'],
    'mexican': ['mexican', 'taco', 'tacos', 'burrito', 'burritos'],
    'coffee': ['coffee', 'cafe', 'café', 'espresso', 'latte'],
};

// Helper function to check if restaurant matches search query (pure function for performance)
const matchesSearch = (restaurant, normalizedQuery) => {
    if (!normalizedQuery) return true;
    
    const name = restaurant.name?.toLowerCase() || '';
    if (name.includes(normalizedQuery)) return true;
    
    const description = restaurant.description?.toLowerCase() || '';
    if (description.includes(normalizedQuery)) return true;
    
    const categories = restaurant.categories || [];
    return categories.some(cat => {
        const normalizedCat = cat?.toLowerCase() || '';
        return normalizedCat.includes(normalizedQuery);
    });
};

// Helper function to check if restaurant matches category (pure function for performance)
const matchesCategory = (restaurant, categoryId) => {
    if (categoryId === 'all') return true;
    
    const categories = restaurant.categories || [];
    if (categories.length === 0) return false;
    
    // Get normalized category names to match against
    const categoryKeywords = CATEGORY_MAPPING[categoryId] || [categoryId.replace('-', ' ')];
    const normalizedCategoryId = categoryId.replace('-', ' ').toLowerCase();
    
    return categories.some(cat => {
        if (!cat) return false;
        const normalizedCat = cat.toLowerCase();
        
        // Check exact match or if category contains any of the keywords
        return normalizedCat === normalizedCategoryId || 
               categoryKeywords.some(keyword => normalizedCat.includes(keyword));
    });
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

// Helper function to sort restaurants (pure function for performance)
const sortRestaurants = (restaurants, sortType, userLocation = null) => {
    if (!restaurants.length) return restaurants;
    
    const sorted = [...restaurants];
    
    switch (sortType) {
        case 'distance':
            // Sort by delivery time: fastest delivery first (same logic as restaurant card)
            sorted.sort((a, b) => {
                const timeA = userLocation && a.location
                    ? calculateDeliveryTime(a.location, userLocation, a.estimatedDeliveryTime || 25)
                    : (a.estimatedDeliveryTime ?? 999);
                const timeB = userLocation && b.location
                    ? calculateDeliveryTime(b.location, userLocation, b.estimatedDeliveryTime || 25)
                    : (b.estimatedDeliveryTime ?? 999);
                // Sort ascending: smaller delivery time (faster) comes first
                return timeA - timeB;
            });
            break;
        case 'rating':
            sorted.sort((a, b) => {
                const ratingA = a.rating ?? 0;
                const ratingB = b.rating ?? 0;
                return ratingB - ratingA;
            });
            break;
        default:
            // Recommended: open first, then by rating
            sorted.sort((a, b) => {
                const aOpen = a.status === 'active' ? 1 : 0;
                const bOpen = b.status === 'active' ? 1 : 0;
                if (aOpen !== bOpen) return bOpen - aOpen;
                const ratingA = a.rating ?? 0;
                const ratingB = b.rating ?? 0;
                return ratingB - ratingA;
            });
    }
    
    return sorted;
};

const BrowseScreen = () => {
    const { theme, isDarkMode } = useTheme();
    const { location, hasLocation } = useLocation();
    const { user } = useAuth();
    const router = useRouter();
    const params = useLocalSearchParams();

    const [searchQuery, setSearchQuery] = useState(params.search || '');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSort, setSelectedSort] = useState('default');
    const [showSortModal, setShowSortModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [restaurants, setRestaurants] = useState([]);
    const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [favoritesLoading, setFavoritesLoading] = useState(true);
    // Initialize view mode from params or default to 'list'
    const [viewMode, setViewMode] = useState(params.view || 'list'); // 'list', 'map', or 'favorites'
    const sortModalTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const [isSortModalClosing, setIsSortModalClosing] = useState(false);

    // Animate sort modal in when visible
    useEffect(() => {
        if (showSortModal && !isSortModalClosing) {
            sortModalTranslateY.setValue(SCREEN_HEIGHT);
            Animated.spring(sortModalTranslateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        }
    }, [showSortModal, isSortModalClosing]);

    const closeSortModal = () => {
        setIsSortModalClosing(true);
        Animated.timing(sortModalTranslateY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setIsSortModalClosing(false);
            setShowSortModal(false);
        });
    };

    const sortModalPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 5;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    sortModalTranslateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > DISMISS_THRESHOLD || gestureState.vy > 0.5) {
                    closeSortModal();
                } else {
                    Animated.spring(sortModalTranslateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 100,
                        friction: 10,
                    }).start();
                }
            },
        })
    ).current;

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

    // Listen to user favorites
    useEffect(() => {
        if (!user?.uid) {
            setFavoriteIds([]);
            setFavoriteRestaurants([]);
            setFavoritesLoading(false);
            return;
        }

        setFavoritesLoading(true);
        const unsubscribe = listenToUserFavorites(user.uid, (result) => {
            if (result.success) {
                setFavoriteIds(result.data || []);
            } else {
                setFavoriteIds([]);
            }
            setFavoritesLoading(false);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user?.uid]);

    // Load favorite restaurants when favorite IDs change or when switching to favorites view
    useEffect(() => {
        if (favoriteIds.length === 0) {
            setFavoriteRestaurants([]);
            setFavoritesLoading(false);
            return;
        }

        const loadFavorites = async () => {
            setFavoritesLoading(true);
            try {
                const userLocation = hasLocation ? {
                    latitude: location?.latitude,
                    longitude: location?.longitude
                } : null;

                const favoritePromises = favoriteIds.map(id => 
                    getRestaurantById(id, userLocation)
                );
                
                const results = await Promise.all(favoritePromises);
                const favorites = results
                    .filter(r => r.success && r.data)
                    .map(r => r.data);
                
                setFavoriteRestaurants(favorites);
            } catch (error) {
                console.error('Error loading favorite restaurants:', error);
                setFavoriteRestaurants([]);
            } finally {
                setFavoritesLoading(false);
            }
        };

        loadFavorites();
    }, [favoriteIds, hasLocation, location]);

    const handleRefresh = async () => {
        setRefreshing(true);
        if (viewMode === 'favorites') {
            // Reload favorites when in favorites view
            if (favoriteIds.length > 0) {
                try {
                    const userLocation = hasLocation ? {
                        latitude: location?.latitude,
                        longitude: location?.longitude
                    } : null;

                    const favoritePromises = favoriteIds.map(id => 
                        getRestaurantById(id, userLocation)
                    );
                    
                    const results = await Promise.all(favoritePromises);
                    const favorites = results
                        .filter(r => r.success && r.data)
                        .map(r => r.data);
                    
                    setFavoriteRestaurants(favorites);
                } catch (error) {
                    console.error('Error refreshing favorite restaurants:', error);
                }
            }
        } else {
            // Reload all restaurants for list/map views
            await loadRestaurants();
        }
        setRefreshing(false);
    };

    // Filter and sort restaurants (optimized with proper memoization)
    const filteredRestaurants = useMemo(() => {
        // Handle favorites view
        if (viewMode === 'favorites') {
            if (favoritesLoading) {
                return [];
            }
            
            // Safety check for empty array
            if (!Array.isArray(favoriteRestaurants) || favoriteRestaurants.length === 0) {
                return [];
            }
            
            let result = favoriteRestaurants;
            
            // Normalize search query once
            const normalizedQuery = searchQuery?.trim().toLowerCase() || '';
            
            // Apply search filter
            if (normalizedQuery) {
                result = result.filter(r => r && matchesSearch(r, normalizedQuery));
            }
            
            // Apply category filter
            if (selectedCategory !== 'all') {
                result = result.filter(r => r && matchesCategory(r, selectedCategory));
            }
            
            // Sort results
            return sortRestaurants(result, selectedSort, location);
        }

        // For list and map views, use all restaurants
        // Safety check for empty array
        if (!Array.isArray(restaurants) || restaurants.length === 0) {
            return [];
        }
        
        let result = restaurants;
        
        // Normalize search query once
        const normalizedQuery = searchQuery?.trim().toLowerCase() || '';
        
        // Apply search filter
        if (normalizedQuery) {
            result = result.filter(r => r && matchesSearch(r, normalizedQuery));
        }
        
        // Apply category filter
        if (selectedCategory !== 'all') {
            result = result.filter(r => r && matchesCategory(r, selectedCategory));
        }
        
        // Sort results
        return sortRestaurants(result, selectedSort, location);
    }, [
        viewMode, 
        restaurants, 
        favoriteRestaurants, 
        favoritesLoading,
        searchQuery, 
        selectedCategory, 
        selectedSort,
        location
    ]);

    const handleRestaurantPress = (restaurant) => {
        router.push(`/(user)/restaurant/${restaurant.id}`);
    };

    const renderRestaurant = ({ item }) => (
        <RestaurantCard
            restaurant={item}
            variant="default"
            onPress={() => handleRestaurantPress(item)}
        />
    );

    const ListHeader = () => (
        <>
            {/* Categories */}
            <View style={styles.categoriesContainer}>
                <CategoryGrid
                    selectedCategory={selectedCategory}
                    onCategorySelect={(cat) => setSelectedCategory(cat.id)}
                    variant="pill"
                />
            </View>

            {/* Results Header */}
            <View style={styles.resultsHeader}>
                <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
                    {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
                </Text>
                
                <TouchableOpacity
                    style={[styles.sortButton, { backgroundColor: theme.surfaceAlt }]}
                    onPress={() => setShowSortModal(true)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="swap-vertical-outline" size={hp('2%')} color={theme.primary} />
                    <Text style={[styles.sortButtonText, { color: theme.textPrimary }]}>
                        {SORT_OPTIONS.find(s => s.id === selectedSort)?.label}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                    Browse
                </Text>
                
                {/* View Mode Toggle */}
                <View style={[styles.viewToggle, { backgroundColor: theme.surfaceAlt }]}>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            viewMode === 'list' && { backgroundColor: theme.primary }
                        ]}
                        onPress={() => setViewMode('list')}
                        activeOpacity={0.7}
                    >
                        <Ionicons 
                            name="list" 
                            size={hp('2%')} 
                            color={viewMode === 'list' ? '#fff' : theme.textMuted} 
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            viewMode === 'favorites' && { backgroundColor: theme.primary }
                        ]}
                        onPress={() => setViewMode('favorites')}
                        activeOpacity={0.7}
                    >
                        <Ionicons 
                            name="heart" 
                            size={hp('2%')} 
                            color={viewMode === 'favorites' ? '#fff' : theme.textMuted} 
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            viewMode === 'map' && { backgroundColor: theme.primary }
                        ]}
                        onPress={() => setViewMode('map')}
                        activeOpacity={0.7}
                    >
                        <Ionicons 
                            name="map" 
                            size={hp('2%')} 
                            color={viewMode === 'map' ? '#fff' : theme.textMuted} 
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar - show in list and favorites views */}
            {(viewMode === 'list' || viewMode === 'favorites') && (
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={viewMode === 'favorites' ? "Search favorites..." : "Search restaurants..."}
                    showFilter={false}
                />
            )}

            {/* Content */}
            {viewMode === 'map' ? (
                RestaurantMapView ? (
                    <RestaurantMapView
                        restaurants={filteredRestaurants}
                        onRestaurantPress={handleRestaurantPress}
                    />
                ) : (
                    <View style={styles.loadingContainer}>
                        <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
                            Loading map...
                        </Text>
                    </View>
                )
            ) : (viewMode === 'favorites' && favoritesLoading) || (viewMode !== 'favorites' && loading) ? (
                <View style={styles.loadingContainer}>
                    <RestaurantCardSkeleton />
                    <RestaurantCardSkeleton />
                    <RestaurantCardSkeleton />
                </View>
            ) : (
                <FlatList
                    data={filteredRestaurants}
                    renderItem={renderRestaurant}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={viewMode === 'favorites' ? null : ListHeader}
                    ListEmptyComponent={
                        viewMode === 'favorites' ? (
                            <EmptyState
                                icon="heart-outline"
                                title="No favorites yet"
                                message={user?.uid ? "Start favoriting restaurants to see them here" : "Sign in to save your favorite restaurants"}
                                variant="search"
                            />
                        ) : (
                            <EmptyState
                                icon="search-outline"
                                title="No restaurants found"
                                message="Try adjusting your search or filters"
                                variant="search"
                            />
                        )
                    }
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.primary}
                        />
                    }
                    // Performance optimizations
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    initialNumToRender={10}
                    updateCellsBatchingPeriod={50}
                />
            )}

            {/* Sort Modal */}
            <Modal
                visible={showSortModal}
                transparent
                animationType="none"
                onRequestClose={closeSortModal}
            >
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={closeSortModal}>
                        <View style={styles.overlayTouchable} />
                    </TouchableWithoutFeedback>
                    
                    <Animated.View 
                        style={[
                            styles.modalContent, 
                            { 
                                backgroundColor: theme.surface,
                                transform: [{ translateY: sortModalTranslateY }],
                            }
                        ]}
                    >
                        {/* Drag Handle Area */}
                        <View {...sortModalPanResponder.panHandlers} style={styles.dragHandleArea}>
                            <View style={[styles.modalHandle, { backgroundColor: isDarkMode ? theme.border : '#E0E0E0' }]} />
                        </View>
                        
                        <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                            Sort By
                        </Text>
                        
                        {SORT_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.sortOption,
                                    selectedSort === option.id && { backgroundColor: `${theme.primary}10` }
                                ]}
                                onPress={() => {
                                    setSelectedSort(option.id);
                                    closeSortModal();
                                }}
                            >
                                <View style={styles.sortOptionLeft}>
                                    <Ionicons 
                                        name={option.icon} 
                                        size={hp('2.5%')} 
                                        color={selectedSort === option.id ? theme.primary : theme.textSecondary} 
                                    />
                                    <Text style={[
                                        styles.sortOptionText,
                                        { color: selectedSort === option.id ? theme.primary : theme.textPrimary }
                                    ]}>
                                        {option.label}
                                    </Text>
                                </View>
                                {selectedSort === option.id && (
                                    <Ionicons name="checkmark-circle" size={hp('2.5%')} color={theme.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </Animated.View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        fontSize: fontSize.hero,
        fontWeight: fontWeight.bold,
        letterSpacing: -0.5,
    },
    viewToggle: {
        flexDirection: 'row',
        borderRadius: radius.md,
        padding: hp('0.3%'),
        gap: hp('0.3%'),
    },
    toggleButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: hp('0.8%'),
        borderRadius: radius.sm,
    },
    categoriesContainer: {
        marginBottom: spacing.md,
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    resultsCount: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: hp('0.8%'),
        borderRadius: radius.pill,
        gap: wp('1%'),
    },
    sortButtonText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
    },
    listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: hp('12%'),
    },
    loadingContainer: {
        paddingHorizontal: spacing.md,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    overlayTouchable: {
        flex: 1,
    },
    modalContent: {
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        paddingBottom: hp('4%'),
        paddingHorizontal: spacing.md,
    },
    dragHandleArea: {
        alignItems: 'center',
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
        width: '100%',
    },
    modalHandle: {
        width: wp('12%'),
        height: 5,
        borderRadius: 3,
    },
    modalTitle: {
        fontSize: fontSize.title,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.xs,
    },
    sortOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    sortOptionText: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
    },
});

export default BrowseScreen;

