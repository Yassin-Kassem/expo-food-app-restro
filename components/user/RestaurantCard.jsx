import React, { useRef, useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    TouchableOpacity, 
    Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme';

const RestaurantCard = ({ 
    restaurant, 
    onPress,
    onFavoritePress,
    variant = 'default', // 'default', 'compact', 'featured'
    style 
}) => {
    const { theme, isDarkMode } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [isFavorite, setIsFavorite] = useState(false);
    
    const {
        name,
        image,
        rating = 0,
        reviewCount = 0,
        categories = [],
        distance,
        estimatedDeliveryTime,
        priceRange = '$$',
        isOpen = true,
        deliveryFee,
    } = restaurant;

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

    const handleFavorite = () => {
        setIsFavorite(!isFavorite);
        onFavoritePress?.(restaurant, !isFavorite);
    };

    const hasFreeDelivery = deliveryFee === 0 || !deliveryFee;

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
                        { 
                            backgroundColor: theme.surface,
                            transform: [{ scale: scaleAnim }],
                        },
                        shadows.soft,
                        style
                    ]}
                >
                    <View style={styles.compactImageContainer}>
                        <Image 
                            source={{ uri: image }} 
                            style={styles.compactImage}
                            defaultSource={require('../../assets/icon.png')}
                        />
                        
                        {/* Favorite button */}
                        <TouchableOpacity 
                            style={[styles.favoriteBtn, styles.favoriteBtnCompact]}
                            onPress={handleFavorite}
                            activeOpacity={0.8}
                        >
                            <Ionicons 
                                name={isFavorite ? "heart" : "heart-outline"} 
                                size={hp('2%')} 
                                color={isFavorite ? theme.favorite : '#fff'} 
                            />
                        </TouchableOpacity>
                        
                        {!isOpen && (
                            <View style={styles.closedOverlay}>
                                <Text style={styles.closedText}>Closed</Text>
                            </View>
                        )}
                    </View>
                    
                    <View style={styles.compactContent}>
                        <Text style={[styles.compactName, { color: theme.textPrimary }]} numberOfLines={1}>
                            {name}
                        </Text>
                        
                        <View style={styles.compactMeta}>
                            <View style={[styles.ratingBadgeSmall, { backgroundColor: theme.primary }]}>
                                <Ionicons name="star" size={hp('1.2%')} color="#fff" />
                                <Text style={styles.ratingTextSmall}>{rating.toFixed(1)}</Text>
                            </View>
                            <Text style={[styles.compactDot, { color: theme.textMuted }]}>•</Text>
                            <Text style={[styles.compactInfo, { color: theme.textMuted }]}>
                                {estimatedDeliveryTime || 30} min
                            </Text>
                        </View>
                        
                        {hasFreeDelivery && (
                            <View style={styles.freeDeliveryRow}>
                                <Ionicons name="bicycle" size={hp('1.4%')} color={theme.primary} />
                                <Text style={[styles.freeDeliveryText, { color: theme.primary }]}>
                                    Free delivery
                                </Text>
                            </View>
                        )}
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
                        defaultSource={require('../../assets/icon.png')}
                    />
                    
                    {/* Gradient overlay */}
                    <View style={styles.featuredGradient} />
                    
                    {/* Rating badge */}
                    <View style={[styles.ratingBadge, { backgroundColor: theme.primary }]}>
                        <Ionicons name="star" size={hp('1.4%')} color="#fff" />
                        <Text style={styles.ratingBadgeText}>{rating.toFixed(1)}</Text>
                        <Text style={styles.ratingCount}>({reviewCount})</Text>
                    </View>
                    
                    {/* Favorite button */}
                    <TouchableOpacity 
                        style={styles.favoriteBtn}
                        onPress={handleFavorite}
                        activeOpacity={0.8}
                    >
                        <Ionicons 
                            name={isFavorite ? "heart" : "heart-outline"} 
                            size={hp('2.2%')} 
                            color={isFavorite ? theme.favorite : '#fff'} 
                        />
                    </TouchableOpacity>
                    
                    {/* Content */}
                    <View style={styles.featuredContent}>
                        <Text style={styles.featuredName} numberOfLines={1}>
                            {name}
                        </Text>
                        <View style={styles.featuredMeta}>
                            {hasFreeDelivery && (
                                <>
                                    <Ionicons name="bicycle" size={hp('1.4%')} color={theme.primary} />
                                    <Text style={[styles.freeDeliveryTextFeatured, { color: theme.primary }]}>
                                        Free delivery
                                    </Text>
                                    <Text style={styles.featuredMetaDot}>•</Text>
                                </>
                            )}
                            <Ionicons name="time-outline" size={hp('1.4%')} color="#fff" />
                            <Text style={styles.featuredMetaText}>
                                {estimatedDeliveryTime || 30} min
                            </Text>
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
                    { 
                        backgroundColor: theme.surface,
                        transform: [{ scale: scaleAnim }],
                    },
                    shadows.soft,
                    style
                ]}
            >
                {/* Image */}
                <View style={styles.imageContainer}>
                    <Image 
                        source={{ uri: image }} 
                        style={styles.defaultImage}
                        defaultSource={require('../../assets/icon.png')}
                    />
                    
                    {/* Rating badge on image */}
                    <View style={[styles.ratingBadgeOnImage, { backgroundColor: theme.primary }]}>
                        <Ionicons name="star" size={hp('1.3%')} color="#fff" />
                        <Text style={styles.ratingOnImageText}>{rating.toFixed(1)}</Text>
                        <Text style={styles.ratingOnImageCount}>({reviewCount}+)</Text>
                    </View>
                    
                    {/* Favorite button */}
                    <TouchableOpacity 
                        style={[styles.favoriteBtn, styles.favoriteBtnDefault]}
                        onPress={handleFavorite}
                        activeOpacity={0.8}
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
                </View>
                
                {/* Content */}
                <View style={styles.contentContainer}>
                    {/* Restaurant info row */}
                    <View style={styles.restaurantInfoRow}>
                        <View style={[styles.restaurantAvatar, { borderColor: theme.border }]}>
                            <Image 
                                source={{ uri: image }} 
                                style={styles.avatarImage}
                            />
                        </View>
                        <View style={styles.restaurantDetails}>
                            <Text style={[styles.restaurantName, { color: theme.textPrimary }]} numberOfLines={1}>
                                {name}
                            </Text>
                            <View style={styles.deliveryRow}>
                                {hasFreeDelivery ? (
                                    <View style={styles.freeDeliveryBadge}>
                                        <Ionicons name="bicycle" size={hp('1.4%')} color={theme.primary} />
                                        <Text style={[styles.freeDeliveryText, { color: theme.primary }]}>
                                            Free delivery
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={[styles.deliveryFee, { color: theme.textMuted }]}>
                                        ${deliveryFee?.toFixed(2)} delivery
                                    </Text>
                                )}
                                <Text style={[styles.dotSeparator, { color: theme.textMuted }]}>•</Text>
                                <Ionicons name="time-outline" size={hp('1.4%')} color={theme.textMuted} />
                                <Text style={[styles.timeText, { color: theme.textMuted }]}>
                                    {estimatedDeliveryTime || 30} min
                                </Text>
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
        gap: wp('1%'),
    },
    freeDeliveryText: {
        fontSize: hp('1.3%'),
        fontWeight: fontWeight.semibold,
    },
    deliveryFee: {
        fontSize: hp('1.3%'),
    },
    dotSeparator: {
        marginHorizontal: spacing.xs,
    },
    timeText: {
        fontSize: hp('1.3%'),
        marginLeft: wp('0.5%'),
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
        marginHorizontal: wp('1%'),
        fontSize: hp('1.2%'),
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
        gap: wp('1%'),
    },
    freeDeliveryTextFeatured: {
        fontSize: hp('1.3%'),
        fontWeight: fontWeight.semibold,
    },
    featuredMetaDot: {
        color: 'rgba(255,255,255,0.6)',
        marginHorizontal: wp('1%'),
    },
    featuredMetaText: {
        color: '#fff',
        fontSize: hp('1.3%'),
        marginLeft: wp('0.5%'),
    },
});

export default RestaurantCard;
