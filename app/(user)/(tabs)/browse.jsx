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
import { getAllRestaurants } from '../../../services/customerRestaurantService';

const SORT_OPTIONS = [
    { id: 'default', label: 'Recommended', icon: 'sparkles-outline' },
    { id: 'distance', label: 'Nearest', icon: 'location-outline' },
    { id: 'rating', label: 'Top Rated', icon: 'star-outline' },
    { id: 'deliveryTime', label: 'Fastest', icon: 'time-outline' },
    { id: 'priceLow', label: 'Price: Low to High', icon: 'trending-down-outline' },
    { id: 'priceHigh', label: 'Price: High to Low', icon: 'trending-up-outline' },
];

const BrowseScreen = () => {
    const { theme, isDarkMode } = useTheme();
    const { location, hasLocation } = useLocation();
    const router = useRouter();
    const params = useLocalSearchParams();

    const [searchQuery, setSearchQuery] = useState(params.search || '');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedSort, setSelectedSort] = useState('default');
    const [showSortModal, setShowSortModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [restaurants, setRestaurants] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
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

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadRestaurants();
        setRefreshing(false);
    };

    // Filter and sort restaurants
    const filteredRestaurants = useMemo(() => {
        let result = [...restaurants];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(r =>
                r.name.toLowerCase().includes(query) ||
                r.categories?.some(c => c.toLowerCase().includes(query)) ||
                r.description?.toLowerCase().includes(query)
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            result = result.filter(r =>
                r.categories?.some(cat =>
                    cat.toLowerCase().includes(selectedCategory.replace('-', ' '))
                )
            );
        }

        // Sort
        switch (selectedSort) {
            case 'distance':
                result.sort((a, b) => (a.distance || 999) - (b.distance || 999));
                break;
            case 'rating':
                result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'deliveryTime':
                result.sort((a, b) => 
                    (a.estimatedDeliveryTime || 60) - (b.estimatedDeliveryTime || 60)
                );
                break;
            case 'priceLow':
                const priceOrder = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
                result.sort((a, b) => 
                    (priceOrder[a.priceRange] || 2) - (priceOrder[b.priceRange] || 2)
                );
                break;
            case 'priceHigh':
                const priceOrderDesc = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
                result.sort((a, b) => 
                    (priceOrderDesc[b.priceRange] || 2) - (priceOrderDesc[a.priceRange] || 2)
                );
                break;
            default:
                // Recommended: open first, then by rating
                result.sort((a, b) => {
                    const aOpen = a.status === 'active' ? 1 : 0;
                    const bOpen = b.status === 'active' ? 1 : 0;
                    if (aOpen !== bOpen) return bOpen - aOpen;
                    return (b.rating || 0) - (a.rating || 0);
                });
        }

        return result;
    }, [restaurants, searchQuery, selectedCategory, selectedSort]);

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

            {/* Search Bar - only show in list view */}
            {viewMode === 'list' && (
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search restaurants..."
                    showFilter={false}
                />
            )}

            {/* Content */}
            {viewMode === 'map' ? (
                <RestaurantMapView
                    restaurants={filteredRestaurants}
                    onRestaurantPress={handleRestaurantPress}
                />
            ) : loading ? (
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
                    ListHeaderComponent={ListHeader}
                    ListEmptyComponent={
                        <EmptyState
                            icon="search-outline"
                            title="No restaurants found"
                            message="Try adjusting your search or filters"
                            variant="search"
                        />
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

