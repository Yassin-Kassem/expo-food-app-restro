import React, { useRef, useState, memo, useMemo, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Animated 
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocation } from '../../contexts/LocationContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { toggleFavorite, isRestaurantFavorited } from '../../services/favoritesService';

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

const RestaurantCard = ({ 
    restaurant, 
    onPress,
    onFavoritePress,
    variant = 'default', // 'default', 'compact', 'featured'
    style 
}) => {
    const { theme, isDarkMode } = useTheme();
    const { user } = useAuth();
    const { location: userLocation } = useLocation();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [isFavorite, setIsFavorite] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    // Check favorite status on mount and when restaurant changes
    useEffect(() => {
        if (user?.uid && restaurant?.id) {
            checkFavoriteStatus();
        }
    }, [user?.uid, restaurant?.id]);

    const checkFavoriteStatus = async () => {
        try {
            const result = await isRestaurantFavorited(user.uid, restaurant.id);
            if (result.success) {
                setIsFavorite(result.isFavorite);
            }
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };
    
    const {
        name,
        image,
        logoUrl,
        rating = 0,
        reviewCount = 0,
        categories = [],
        distance,
        estimatedDeliveryTime,
        priceRange = '££',
        isOpen = true,
        deliveryFee,
    } = restaurant;
    
    // Use logoUrl for avatar if available, otherwise fall back to image
    const avatarImage = logoUrl || image;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
            friction: 8,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
        }).start();
    };

    const handleFavorite = async () => {
        if (!user?.uid || isToggling) return;

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
            
            // Call optional callback
            onFavoritePress?.(restaurant, newFavoriteState);
        } catch (error) {
            // Revert on error
            setIsFavorite(isFavorite);
            console.error('Error toggling favorite:', error);
        } finally {
            setIsToggling(false);
        }
    };

    // Calculate delivery fee and time based on user location (same as restaurant details page)
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

    const hasFreeDelivery = calculatedDeliveryFee === 0;

    // Memoize dynamic styles to prevent recreation on every render
    const dynamicStyles = useMemo(() => ({
        compactCardBg: { backgroundColor: theme.surface },
        defaultCardBg: { backgroundColor: theme.surface },
        ratingBadge: { backgroundColor: theme.primary },
        avatarBorder: { borderColor: theme.border },
        textPrimary: { color: theme.textPrimary },
        textMuted: { color: theme.textMuted },
        primaryText: { color: theme.primary },
    }), [theme.surface, theme.primary, theme.border, theme.textPrimary, theme.textMuted]);

    // Compact variant - square card for horizontal scroll
    if (variant === 'compact') {
        return (
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <Animated.View 
                    style={[
                        styles.compactCard, 
                        dynamicStyles.compactCardBg,
                        { transform: [{ scale: scaleAnim }] },
                        shadows.soft,
                        style
                    ]}
                >
                    <View style={styles.compactImageContainer}>
                        <Image 
                            source={{ uri: image }} 
                            style={styles.compactImage}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                            transition={200}
                            placeholder={require('../../assets/icon.png')}
                        />
                        
                        {/* Favorite button */}
                        {user?.uid && (
                            <TouchableOpacity 
                                style={[styles.favoriteBtn, styles.favoriteBtnCompact]}
                                onPress={handleFavorite}
                                activeOpacity={0.8}
                                disabled={isToggling}
                            >
                                <Ionicons 
                                    name={isFavorite ? "heart" : "heart-outline"} 
                                    size={hp('2%')} 
                                    color={isFavorite ? theme.favorite : '#fff'} 
                                />
                            </TouchableOpacity>
                        )}
                        
                        {!isOpen && (
                            <View style={styles.closedOverlay}>
                                <Text style={styles.closedText}>Closed</Text>
                            </View>
                        )}
                    </View>
                    
                    <View style={styles.compactContent}>
                        <Text style={[styles.compactName, dynamicStyles.textPrimary]} numberOfLines={1}>
                            {name}
                        </Text>
                        
                        <View style={styles.compactMeta}>
                            <View style={[styles.ratingBadgeSmall, dynamicStyles.ratingBadge]}>
                                <Ionicons name="star" size={hp('1.2%')} color="#fff" />
                                <Text style={styles.ratingTextSmall}>{rating.toFixed(1)}</Text>
                            </View>
                            <Text style={[styles.compactDot, dynamicStyles.textMuted]}>•</Text>
                            <View style={styles.statGroup}>
                                <Ionicons name="time-outline" size={hp('1.2%')} color={theme.textMuted} />
                                <Text style={[styles.compactInfo, dynamicStyles.textMuted]}>
                                    {calculatedDeliveryTime} minutes
                                </Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        );
    }

    // Featured variant - large hero card
    if (variant === 'featured') {
        return (
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <Animated.View 
                    style={[
                        styles.featuredCard,
                        { transform: [{ scale: scaleAnim }] },
                        shadows.medium,
                        style
                    ]}
                >
                    <Image 
                        source={{ uri: image }} 
                        style={styles.featuredImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={200}
                        placeholder={require('../../assets/icon.png')}
                    />
                    
                    {/* Gradient overlay */}
                    <View style={styles.featuredGradient} />
                    
                    {/* Rating badge */}
                    <View style={[styles.ratingBadge, dynamicStyles.ratingBadge]}>
                        <Ionicons name="star" size={hp('1.4%')} color="#fff" />
                        <Text style={styles.ratingBadgeText}>{rating.toFixed(1)}</Text>
                        <Text style={styles.ratingCount}>({reviewCount})</Text>
                    </View>
                    
                    {/* Favorite button */}
                    {user?.uid && (
                        <TouchableOpacity 
                            style={styles.favoriteBtn}
                            onPress={handleFavorite}
                            activeOpacity={0.8}
                            disabled={isToggling}
                        >
                            <Ionicons 
                                name={isFavorite ? "heart" : "heart-outline"} 
                                size={hp('2.2%')} 
                                color={isFavorite ? theme.favorite : '#fff'} 
                            />
                        </TouchableOpacity>
                    )}
                    
                    {/* Content */}
                    <View style={styles.featuredContent}>
                        <Text style={styles.featuredName} numberOfLines={1}>
                            {name}
                        </Text>
                        <View style={styles.featuredMeta}>
                            <View style={styles.statGroup}>
                                <Ionicons name="time-outline" size={hp('1.4%')} color="#fff" />
                                <Text style={styles.featuredMetaText}>
                                    {calculatedDeliveryTime} {"minutes "} 
                                </Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        );
    }

    // Default variant - full width card (like "Kitchen Near You")
    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
        >
            <Animated.View 
                style={[
                    styles.defaultCard, 
                    dynamicStyles.defaultCardBg,
                    { transform: [{ scale: scaleAnim }] },
                    shadows.soft,
                    style
                ]}
            >
                {/* Image */}
                <View style={styles.imageContainer}>
                    <Image 
                        source={{ uri: image }} 
                        style={styles.defaultImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={200}
                        placeholder={require('../../assets/icon.png')}
                    />
                    
                    {/* Rating badge on image */}
                    <View style={[styles.ratingBadgeOnImage, dynamicStyles.ratingBadge]}>
                        <Ionicons name="star" size={hp('1.3%')} color="#fff" />
                        <Text style={styles.ratingOnImageText}>{rating.toFixed(1)}</Text>
                        <Text style={styles.ratingOnImageCount}>({reviewCount}+)</Text>
                    </View>
                    
                    {/* Favorite button */}
                    {user?.uid && (
                        <TouchableOpacity 
                            style={[styles.favoriteBtn, styles.favoriteBtnDefault]}
                            onPress={handleFavorite}
                            activeOpacity={0.8}
                            disabled={isToggling}
                        >
                            <View style={[
                                styles.favoriteBtnBg,
                                { backgroundColor: isFavorite ? theme.favorite : 'rgba(0,0,0,0.3)' }
                            ]}>
                                <Ionicons 
                                    name={isFavorite ? "heart" : "heart-outline"} 
                                    size={hp('2%')} 
                                    color="#fff" 
                                />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
                
                {/* Content */}
                <View style={styles.contentContainer}>
                    {/* Restaurant info row */}
                    <View style={styles.restaurantInfoRow}>
                        <View style={[styles.restaurantAvatar, dynamicStyles.avatarBorder]}>
                            <Image 
                                source={{ uri: avatarImage }} 
                                style={styles.avatarImage}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                                transition={200}
                            />
                        </View>
                        <View style={styles.restaurantDetails}>
                            <Text style={[styles.restaurantName, dynamicStyles.textPrimary]} numberOfLines={1}>
                                {name}
                            </Text>
                            <View style={styles.deliveryRow}>
                                <View style={styles.statGroup}>
                                    <Ionicons name="time-outline" size={hp('1.4%')} color={theme.textMuted} />
                                    <Text style={[styles.timeText, dynamicStyles.textMuted]}>
                                        {calculatedDeliveryTime} {"minutes "}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    // Default Card
    defaultCard: {
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    imageContainer: {
        height: hp('18%'),
        position: 'relative',
    },
    defaultImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    ratingBadgeOnImage: {
        position: 'absolute',
        top: spacing.sm,
        left: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: hp('0.4%'),
        borderRadius: radius.pill,
        gap: wp('1%'),
    },
    ratingOnImageText: {
        color: '#fff',
        fontSize: hp('1.4%'),
        fontWeight: fontWeight.bold,
    },
    ratingOnImageCount: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: hp('1.2%'),
    },
    favoriteBtn: {
        position: 'absolute',
    },
    favoriteBtnDefault: {
        top: spacing.sm,
        right: spacing.sm,
    },
    favoriteBtnBg: {
        width: hp('4%'),
        height: hp('4%'),
        borderRadius: hp('2%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        padding: spacing.md,
    },
    restaurantInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    restaurantAvatar: {
        width: hp('5%'),
        height: hp('5%'),
        borderRadius: hp('2.5%'),
        overflow: 'hidden',
        marginRight: spacing.sm,
        borderWidth: 2,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    restaurantDetails: {
        flex: 1,
    },
    restaurantName: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
        marginBottom: hp('0.3%'),
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    freeDeliveryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp('0.5%'),
    },
    freeDeliveryText: {
        fontSize: hp('1.3%'),
        fontWeight: fontWeight.semibold,
    },
    deliveryFee: {
        fontSize: hp('1.3%'),
    },
    dotSeparator: {
        fontSize: hp('1.1%'),
    },
    statGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp('0.3%'),
    },
    timeText: {
        fontSize: hp('1.3%'),
    },
    priceRangeText: {
        fontSize: hp('1.3%'),
    },

    // Compact Card
    compactCard: {
        width: wp('42%'),
        borderRadius: radius.lg,
        overflow: 'hidden',
        marginRight: spacing.md,
    },
    compactImageContainer: {
        height: hp('13%'),
        position: 'relative',
    },
    compactImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    favoriteBtnCompact: {
        top: spacing.xs,
        right: spacing.xs,
        backgroundColor: 'rgba(0,0,0,0.3)',
        width: hp('3.5%'),
        height: hp('3.5%'),
        borderRadius: hp('1.75%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    closedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closedText: {
        color: '#fff',
        fontSize: fontSize.caption,
        fontWeight: fontWeight.bold,
    },
    compactContent: {
        padding: spacing.sm,
    },
    compactName: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
        marginBottom: hp('0.4%'),
    },
    compactMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp('0.4%'),
    },
    ratingBadgeSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.xs,
        paddingVertical: hp('0.2%'),
        borderRadius: radius.xs,
        gap: wp('0.5%'),
    },
    ratingTextSmall: {
        color: '#fff',
        fontSize: hp('1.2%'),
        fontWeight: fontWeight.bold,
    },
    compactDot: {
        fontSize: hp('1.1%'),
    },
    compactInfo: {
        fontSize: hp('1.2%'),
    },
    freeDeliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp('1%'),
    },

    // Featured Card
    featuredCard: {
        width: wp('70%'),
        height: hp('22%'),
        borderRadius: radius.xl,
        overflow: 'hidden',
        marginRight: spacing.md,
    },
    featuredImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    featuredGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    ratingBadge: {
        position: 'absolute',
        top: spacing.md,
        left: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: hp('0.4%'),
        borderRadius: radius.pill,
        gap: wp('1%'),
    },
    ratingBadgeText: {
        color: '#fff',
        fontSize: hp('1.4%'),
        fontWeight: fontWeight.bold,
    },
    ratingCount: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: hp('1.2%'),
    },
    featuredContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.md,
    },
    featuredName: {
        color: '#fff',
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
        marginBottom: hp('0.4%'),
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    featuredMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    freeDeliveryTextFeatured: {
        fontSize: hp('1.3%'),
        fontWeight: fontWeight.semibold,
    },
    featuredMetaDot: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: hp('1.1%'),
    },
    featuredMetaText: {
        color: '#fff',
        fontSize: hp('1.3%'),
    },
});

// Memoize with custom comparison to prevent unnecessary re-renders
export default memo(RestaurantCard, (prevProps, nextProps) => {
    return (
        prevProps.restaurant.id === nextProps.restaurant.id &&
        prevProps.restaurant.isOpen === nextProps.restaurant.isOpen &&
        prevProps.restaurant.rating === nextProps.restaurant.rating &&
        prevProps.restaurant.distance === nextProps.restaurant.distance &&
        prevProps.restaurant.location?.lat === nextProps.restaurant.location?.lat &&
        prevProps.restaurant.location?.lng === nextProps.restaurant.location?.lng &&
        prevProps.restaurant.estimatedDeliveryTime === nextProps.restaurant.estimatedDeliveryTime &&
        prevProps.restaurant.deliveryFee === nextProps.restaurant.deliveryFee &&
        prevProps.restaurant.priceRange === nextProps.restaurant.priceRange &&
        prevProps.variant === nextProps.variant &&
        prevProps.style === nextProps.style
    );
});
