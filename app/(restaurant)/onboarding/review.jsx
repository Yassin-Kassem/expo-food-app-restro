import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    Platform,
    Animated,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import Button from '../../../components/Button';
import CustomModal from '../../../components/CustomModal';
import { getRestaurantByOwner, publishRestaurant } from '../../../services/restaurantService';
import { getMenuItems } from '../../../services/menuService';
import { getCurrentUser } from '../../../services/authService';

export default function Review() {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();
    const [restaurant, setRestaurant] = useState(null);
    const [firstItem, setFirstItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const card1Anim = useRef(new Animated.Value(0)).current;
    const card2Anim = useRef(new Animated.Value(0)).current;
    const card3Anim = useRef(new Animated.Value(0)).current;
    const confettiAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Stagger card animations
        Animated.stagger(150, [
            Animated.spring(card1Anim, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(card2Anim, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(card3Anim, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        loadData();
    }, []);

    const loadData = async () => {
        const user = getCurrentUser();
        const result = await getRestaurantByOwner(user.uid);
        if (result.success) {
            setRestaurant(result.data);
            const menuResult = await getMenuItems(result.data.id);
            if (menuResult.success && menuResult.data.length > 0) {
                setFirstItem(menuResult.data[0]);
            }
        }
    };

    const handlePublish = async () => {
        setLoading(true);
        const result = await publishRestaurant(restaurant.id, restaurant.ownerId);
        if (result.success) {
            // Success animation
            Animated.spring(confettiAnim, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }).start();
            
            setSuccessModalVisible(true);
        }
        setLoading(false);
    };

    const handleSuccessClose = () => {
        setSuccessModalVisible(false);
        router.replace('/dashboard');
    };

    const formatPrice = (price) => {
        if (!price) return '£0.00';
        return `£${parseFloat(price).toFixed(2)}`;
    };

    const getOpenDaysCount = () => {
        if (!restaurant?.hours) return 0;
        
        // Handle both capitalized (Monday) and lowercase (monday) day names
        const hoursEntries = Object.entries(restaurant.hours);
        if (hoursEntries.length === 0) return 0;
        
        // Count days where isOpen is true, or where open/close times exist (implicitly open)
        const openDays = hoursEntries.filter(([day, hours]) => {
            // Check if hours is an object
            if (hours && typeof hours === 'object') {
                // Explicitly check isOpen property
                if (hours.isOpen === true) {
                    return true;
                }
                // If isOpen is not explicitly false and has open/close times, consider it open
                if (hours.isOpen !== false && hours.open && hours.close) {
                    return true;
                }
            }
            return false;
        });
        
        return openDays.length;
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        scrollContent: {
            paddingBottom: hp('18%'),
        },
        
        // Header Section
        headerSection: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.lg,
            alignItems: 'center',
        },
        celebrationIcon: {
            width: hp('8%'),
            height: hp('8%'),
            borderRadius: hp('4%'),
            backgroundColor: `${theme.primary}15`,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.md,
        },
        title: {
            fontSize: fontSize.title,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
            letterSpacing: -0.5,
            marginBottom: spacing.xs,
            textAlign: 'center',
        },
        subtitle: {
            fontSize: fontSize.body,
            color: theme.textSecondary,
            lineHeight: hp('2.8%'),
            textAlign: 'center',
        },
        
        // Cards Section
        cardsSection: {
            paddingHorizontal: spacing.lg,
        },
        
        // Restaurant Card
        restaurantCard: {
            backgroundColor: theme.surface,
            borderRadius: radius.xl,
            overflow: 'hidden',
            marginBottom: spacing.lg,
            ...shadows.medium,
        },
        restaurantBanner: {
            height: hp('12%'),
            backgroundColor: isDarkMode ? theme.surfaceAlt : '#E8F5E9',
            justifyContent: 'center',
            alignItems: 'center',
        },
        restaurantBannerImage: {
            width: '100%',
            height: '100%',
        },
        restaurantLogoContainer: {
            position: 'absolute',
            bottom: -hp('4%'),
            left: spacing.lg,
            width: hp('8%'),
            height: hp('8%'),
            borderRadius: hp('4%'),
            backgroundColor: theme.surface,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: theme.surface,
            ...shadows.soft,
            overflow: 'hidden',
        },
        restaurantLogo: {
            width: '100%',
            height: '100%',
        },
        restaurantContent: {
            padding: spacing.lg,
            paddingTop: hp('5%'),
        },
        restaurantName: {
            fontSize: fontSize.subtitle,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
            marginBottom: spacing.xs / 2,
        },
        restaurantAddress: {
            fontSize: fontSize.caption,
            color: theme.textSecondary,
            marginBottom: spacing.sm,
        },
        restaurantDescription: {
            fontSize: fontSize.body,
            color: theme.textSecondary,
            lineHeight: hp('2.5%'),
            marginBottom: spacing.md,
        },
        categoriesContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.xs,
        },
        categoryPill: {
            backgroundColor: `${theme.primary}15`,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radius.pill,
        },
        categoryText: {
            fontSize: fontSize.caption,
            color: theme.primary,
            fontWeight: fontWeight.medium,
        },
        
        // Menu Item Card
        menuItemCard: {
            backgroundColor: theme.surface,
            borderRadius: radius.xl,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            ...shadows.soft,
        },
        cardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.md,
            gap: spacing.sm,
        },
        cardIconContainer: {
            width: hp('4%'),
            height: hp('4%'),
            borderRadius: radius.md,
            backgroundColor: `${theme.primary}15`,
            justifyContent: 'center',
            alignItems: 'center',
        },
        cardTitle: {
            fontSize: fontSize.caption,
            color: theme.textMuted,
            fontWeight: fontWeight.semibold,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        menuItemContent: {
            flexDirection: 'row',
            gap: spacing.md,
        },
        menuItemImage: {
            width: hp('8%'),
            height: hp('8%'),
            borderRadius: radius.lg,
            backgroundColor: theme.surfaceAlt,
        },
        menuItemImagePlaceholder: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        menuItemDetails: {
            flex: 1,
        },
        menuItemName: {
            fontSize: fontSize.body,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
            marginBottom: spacing.xs / 2,
        },
        menuItemDescription: {
            fontSize: fontSize.caption,
            color: theme.textSecondary,
            marginBottom: spacing.xs,
        },
        menuItemPrice: {
            fontSize: fontSize.body,
            fontWeight: fontWeight.bold,
            color: theme.primary,
        },
        
        // Hours Card
        hoursCard: {
            backgroundColor: theme.surface,
            borderRadius: radius.xl,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            ...shadows.soft,
        },
        hoursContent: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
        },
        hoursIconContainer: {
            width: hp('5%'),
            height: hp('5%'),
            borderRadius: hp('2.5%'),
            backgroundColor: `${theme.success}15`,
            justifyContent: 'center',
            alignItems: 'center',
        },
        hoursDetails: {
            flex: 1,
        },
        hoursTitle: {
            fontSize: fontSize.body,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
            marginBottom: spacing.xs / 2,
        },
        hoursText: {
            fontSize: fontSize.caption,
            color: theme.textSecondary,
        },
        
        // Ready Card
        readyCard: {
            backgroundColor: isDarkMode ? theme.surfaceAlt : '#E8F5E9',
            borderRadius: radius.xl,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            borderWidth: 2,
            borderColor: `${theme.primary}30`,
        },
        readyContent: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
        },
        readyIconContainer: {
            width: hp('5%'),
            height: hp('5%'),
            borderRadius: hp('2.5%'),
            backgroundColor: theme.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        readyDetails: {
            flex: 1,
        },
        readyTitle: {
            fontSize: fontSize.body,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
            marginBottom: spacing.xs / 2,
        },
        readyText: {
            fontSize: fontSize.caption,
            color: theme.textSecondary,
            lineHeight: hp('2.2%'),
        },
        
        // Stats Row
        statsRow: {
            flexDirection: 'row',
            gap: spacing.sm,
            marginBottom: spacing.lg,
        },
        statCard: {
            flex: 1,
            backgroundColor: theme.surface,
            borderRadius: radius.lg,
            padding: spacing.md,
            alignItems: 'center',
            ...shadows.soft,
        },
        statValue: {
            fontSize: fontSize.title,
            fontWeight: fontWeight.bold,
            color: theme.primary,
            marginBottom: spacing.xs / 2,
        },
        statLabel: {
            fontSize: fontSize.caption,
            color: theme.textMuted,
            fontWeight: fontWeight.medium,
        },
        
        // Footer
        footer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.surface,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            flexDirection: 'row',
            gap: spacing.md,
            ...shadows.floating,
        },
    });

    if (!restaurant) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.textSecondary }}>Loading...</Text>
            </View>
        );
    }

    const cardAnimStyle = (anim) => ({
        opacity: anim,
        transform: [{
            translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
            })
        }]
    });

    return (
        <View style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Animated.View 
                    style={[
                        styles.headerSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Animated.View 
                        style={[
                            styles.celebrationIcon,
                            {
                                transform: [{
                                    scale: confettiAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1, 1.2]
                                    })
                                }]
                            }
                        ]}
                    >
                        <Ionicons name="rocket" size={hp('3.5%')} color={theme.primary} />
                    </Animated.View>
                    <Text style={styles.title}>Ready to Launch! 🎉</Text>
                    <Text style={styles.subtitle}>
                        Review your restaurant details before going live
                    </Text>
                </Animated.View>

                <View style={styles.cardsSection}>
                    {/* Stats Row */}
                    <Animated.View style={[styles.statsRow, cardAnimStyle(card1Anim)]}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{getOpenDaysCount()}</Text>
                            <Text style={styles.statLabel}>Days Open</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>1</Text>
                            <Text style={styles.statLabel}>Menu Item</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{restaurant.categories?.length || 0}</Text>
                            <Text style={styles.statLabel}>Cuisines</Text>
                        </View>
                    </Animated.View>

                    {/* Restaurant Preview Card */}
                    <Animated.View style={[styles.restaurantCard, cardAnimStyle(card1Anim)]}>
                        <View style={styles.restaurantBanner}>
                            {restaurant.bannerUrl ? (
                                <Image 
                                    source={{ uri: restaurant.bannerUrl }} 
                                    style={styles.restaurantBannerImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <Ionicons name="storefront" size={hp('3%')} color={theme.textMuted} />
                            )}
                            <View style={styles.restaurantLogoContainer}>
                                {restaurant.logoUrl ? (
                                    <Image 
                                        source={{ uri: restaurant.logoUrl }} 
                                        style={styles.restaurantLogo}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Ionicons name="restaurant" size={hp('2.5%')} color={theme.textMuted} />
                                )}
                            </View>
                        </View>
                        <View style={styles.restaurantContent}>
                            <Text style={styles.restaurantName}>{restaurant.name}</Text>
                            <Text style={styles.restaurantAddress}>{restaurant.address}</Text>
                            <Text style={styles.restaurantDescription} numberOfLines={2}>
                                {restaurant.description}
                            </Text>
                            <View style={styles.categoriesContainer}>
                                {restaurant.categories?.map((cat, idx) => (
                                    <View key={idx} style={styles.categoryPill}>
                                        <Text style={styles.categoryText}>{cat}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </Animated.View>

                    {/* Menu Item Card */}
                    <Animated.View style={[styles.menuItemCard, cardAnimStyle(card2Anim)]}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardIconContainer}>
                                <Ionicons name="fast-food" size={hp('1.8%')} color={theme.primary} />
                            </View>
                            <Text style={styles.cardTitle}>First Menu Item</Text>
                        </View>
                        <View style={styles.menuItemContent}>
                            {firstItem?.imageUrl ? (
                                <Image 
                                    source={{ uri: firstItem.imageUrl }} 
                                    style={styles.menuItemImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.menuItemImage, styles.menuItemImagePlaceholder]}>
                                    <Ionicons name="image" size={hp('2%')} color={theme.textMuted} />
                                </View>
                            )}
                            <View style={styles.menuItemDetails}>
                                <Text style={styles.menuItemName}>
                                    {firstItem?.name || 'No item added'}
                                </Text>
                                <Text style={styles.menuItemDescription} numberOfLines={1}>
                                    {firstItem?.description || 'No description'}
                                </Text>
                                <Text style={styles.menuItemPrice}>
                                    {formatPrice(firstItem?.price)}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Hours Card */}
                    <Animated.View style={[styles.hoursCard, cardAnimStyle(card2Anim)]}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardIconContainer}>
                                <Ionicons name="time" size={hp('1.8%')} color={theme.primary} />
                            </View>
                            <Text style={styles.cardTitle}>Operating Hours</Text>
                        </View>
                        <View style={styles.hoursContent}>
                            <View style={styles.hoursIconContainer}>
                                <Ionicons name="calendar" size={hp('2%')} color={theme.success} />
                            </View>
                            <View style={styles.hoursDetails}>
                                <Text style={styles.hoursTitle}>
                                    Open {getOpenDaysCount()} days a week
                                </Text>
                                <Text style={styles.hoursText}>
                                    Hours configured and ready
                                </Text>
                            </View>
                            <Ionicons name="checkmark-circle" size={hp('2.5%')} color={theme.success} />
                        </View>
                    </Animated.View>

                    {/* Ready Card */}
                    <Animated.View style={[styles.readyCard, cardAnimStyle(card3Anim)]}>
                        <View style={styles.readyContent}>
                            <View style={styles.readyIconContainer}>
                                <Ionicons name="checkmark" size={hp('2.5%')} color="#fff" />
                            </View>
                            <View style={styles.readyDetails}>
                                <Text style={styles.readyTitle}>Ready to go live!</Text>
                                <Text style={styles.readyText}>
                                    Your restaurant will be visible to customers immediately. 
                                    You can edit all details anytime from your dashboard.
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <Button
                    title="Back"
                    onPress={() => router.back()}
                    variant="secondary"
                    style={{ flex: 1 }}
                />
                <Button
                    title="Publish Restaurant"
                    onPress={handlePublish}
                    loading={loading}
                    variant="success"
                    style={{ flex: 2 }}
                    icon={!loading && (
                        <Ionicons name="rocket" size={hp('2%')} color="#fff" />
                    )}
                />
            </View>

            {/* Success Modal */}
            <CustomModal
                visible={successModalVisible}
                title="Congratulations! 🎉"
                message="Your restaurant is now live and ready to accept orders!"
                type="success"
                primaryButtonText="Go to Dashboard"
                onPrimaryPress={handleSuccessClose}
                onClose={handleSuccessClose}
            />
        </View>
    );
}
