import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius } from '../../constants/theme';

// Skeleton shimmer component
const SkeletonBox = ({ width, height, borderRadius = radius.md, style }) => {
    const { theme } = useTheme();
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: theme.surfaceAlt,
                    opacity,
                },
                style,
            ]}
        />
    );
};

// Restaurant Card Skeleton
export const RestaurantCardSkeleton = ({ variant = 'default' }) => {
    const { theme } = useTheme();

    if (variant === 'compact') {
        return (
            <View style={[styles.compactCard, { backgroundColor: theme.surface }]}>
                <SkeletonBox width="100%" height={hp('12%')} borderRadius={radius.lg} />
                <View style={styles.compactContent}>
                    <SkeletonBox width="80%" height={hp('2%')} />
                    <SkeletonBox width="50%" height={hp('1.5%')} style={{ marginTop: spacing.xs }} />
                    <SkeletonBox width="70%" height={hp('1.5%')} style={{ marginTop: spacing.xs }} />
                </View>
            </View>
        );
    }

    if (variant === 'featured') {
        return (
            <View style={styles.featuredCard}>
                <SkeletonBox width={wp('75%')} height={hp('22%')} borderRadius={radius.xl} />
            </View>
        );
    }

    // Default variant
    return (
        <View style={[styles.defaultCard, { backgroundColor: theme.surface }]}>
            <SkeletonBox width="100%" height={hp('18%')} borderRadius={0} />
            <View style={styles.defaultContent}>
                <View style={styles.headerRow}>
                    <SkeletonBox width="70%" height={hp('2.5%')} />
                    <SkeletonBox width="15%" height={hp('2%')} />
                </View>
                <SkeletonBox width="40%" height={hp('2%')} style={{ marginTop: spacing.sm }} />
                <View style={styles.footerRow}>
                    <SkeletonBox width="30%" height={hp('1.5%')} />
                    <SkeletonBox width="30%" height={hp('1.5%')} />
                </View>
            </View>
        </View>
    );
};

// Category Skeleton
export const CategorySkeleton = () => {
    return (
        <View style={styles.categoryRow}>
            {[...Array(5)].map((_, i) => (
                <SkeletonBox
                    key={i}
                    width={wp('20%')}
                    height={hp('4.5%')}
                    borderRadius={radius.pill}
                    style={{ marginRight: spacing.sm }}
                />
            ))}
        </View>
    );
};

// Banner Skeleton
export const BannerSkeleton = () => {
    return (
        <View style={styles.bannerContainer}>
            <SkeletonBox
                width={wp('100%') - spacing.md * 2}
                height={hp('20%')}
                borderRadius={radius.xl}
            />
        </View>
    );
};

// Search Bar Skeleton
export const SearchBarSkeleton = () => {
    const { theme } = useTheme();
    return (
        <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <SkeletonBox width={hp('2.5%')} height={hp('2.5%')} borderRadius={hp('1.25%')} />
            <SkeletonBox width="60%" height={hp('2%')} style={{ marginLeft: spacing.sm }} />
        </View>
    );
};

// Full Home Screen Skeleton
export const HomeScreenSkeleton = () => {
    const { theme } = useTheme();

    return (
        <View style={[styles.homeContainer, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.homeHeader}>
                <View>
                    <SkeletonBox width={wp('40%')} height={hp('2%')} />
                    <SkeletonBox width={wp('50%')} height={hp('3%')} style={{ marginTop: spacing.xs }} />
                </View>
                <SkeletonBox width={hp('5%')} height={hp('5%')} borderRadius={hp('2.5%')} />
            </View>

            {/* Search */}
            <SearchBarSkeleton />

            {/* Banner */}
            <BannerSkeleton />

            {/* Categories */}
            <CategorySkeleton />

            {/* Restaurant Section */}
            <View style={styles.sectionHeader}>
                <SkeletonBox width={wp('30%')} height={hp('2.5%')} />
                <SkeletonBox width={wp('15%')} height={hp('2%')} />
            </View>

            {/* Restaurant Cards */}
            <View style={styles.restaurantRow}>
                <RestaurantCardSkeleton variant="compact" />
                <RestaurantCardSkeleton variant="compact" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // Compact card
    compactCard: {
        width: wp('42%'),
        borderRadius: radius.lg,
        overflow: 'hidden',
        marginRight: spacing.md,
    },
    compactContent: {
        padding: spacing.sm,
    },

    // Featured card
    featuredCard: {
        marginRight: spacing.md,
    },

    // Default card
    defaultCard: {
        borderRadius: radius.lg,
        overflow: 'hidden',
        marginBottom: spacing.md,
    },
    defaultContent: {
        padding: spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md,
    },

    // Category
    categoryRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },

    // Banner
    bannerContainer: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },

    // Search bar
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        padding: spacing.md,
        borderRadius: radius.xl,
        borderWidth: 2,
    },

    // Home screen
    homeContainer: {
        flex: 1,
        paddingTop: spacing.lg,
    },
    homeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    restaurantRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
    },
});

export default SkeletonBox;
export { SkeletonBox };

