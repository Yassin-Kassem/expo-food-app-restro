import React, { useRef, useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    Image,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - spacing.md * 2;
const BANNER_HEIGHT = hp('18%');

// Banner data with dark theme style (like reference image)
const DEFAULT_BANNERS = [
    {
        id: '1',
        tag: 'UPTO',
        title: '20%',
        titleSuffix: 'OFF',
        subtitle: 'On your first order',
        buttonText: 'Order Now',
        gradient: ['#1F2937', '#111827'],
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    },
    {
        id: '2',
        tag: 'FREE',
        title: 'Delivery',
        titleSuffix: '',
        subtitle: 'This weekend only',
        buttonText: 'Order Now',
        gradient: ['#1DB954', '#16A34A'],
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    },
    {
        id: '3',
        tag: 'SPECIAL',
        title: '30%',
        titleSuffix: 'OFF',
        subtitle: 'On selected restaurants',
        buttonText: 'Explore',
        gradient: ['#7C3AED', '#5B21B6'],
        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    },
];

const BannerItem = ({ banner, isActive }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        if (isActive) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            slideAnim.setValue(20);
        }
    }, [isActive]);

    return (
        <View style={styles.bannerItem}>
            <LinearGradient
                colors={banner.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.bannerGradient}
            >
                {/* Content */}
                <Animated.View 
                    style={[
                        styles.bannerContent,
                        { 
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }
                    ]}
                >
                    <Text style={styles.bannerTag}>{banner.tag}</Text>
                    <View style={styles.titleRow}>
                        <Text style={styles.bannerTitle}>{banner.title}</Text>
                        {banner.titleSuffix && (
                            <Text style={styles.bannerTitleSuffix}>{banner.titleSuffix}</Text>
                        )}
                    </View>
                    <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                    
                    {/* CTA Button */}
                    <TouchableOpacity 
                        style={styles.bannerButton}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.bannerButtonText}>
                            {banner.buttonText}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Food Image */}
                <View style={styles.bannerImageContainer}>
                    <Image 
                        source={{ uri: banner.image }}
                        style={styles.bannerImage}
                    />
                </View>

                {/* Decorative elements */}
                <View style={styles.decorCircle1} />
                <View style={styles.decorCircle2} />
            </LinearGradient>
        </View>
    );
};

const HeroBanner = ({ 
    banners = DEFAULT_BANNERS,
    autoPlay = true,
    autoPlayInterval = 4000,
    onBannerPress,
}) => {
    const { theme } = useTheme();
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef(null);
    const autoPlayRef = useRef(null);

    // Auto-play functionality
    useEffect(() => {
        if (autoPlay && banners.length > 1) {
            autoPlayRef.current = setInterval(() => {
                setActiveIndex(prev => {
                    const nextIndex = (prev + 1) % banners.length;
                    scrollRef.current?.scrollTo({
                        x: nextIndex * BANNER_WIDTH,
                        animated: true,
                    });
                    return nextIndex;
                });
            }, autoPlayInterval);

            return () => {
                if (autoPlayRef.current) {
                    clearInterval(autoPlayRef.current);
                }
            };
        }
    }, [autoPlay, autoPlayInterval, banners.length]);

    const handleScroll = (event) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / BANNER_WIDTH);
        if (index !== activeIndex && index >= 0 && index < banners.length) {
            setActiveIndex(index);
        }
    };

    const handleScrollBegin = () => {
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                onScrollBeginDrag={handleScrollBegin}
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToInterval={BANNER_WIDTH}
                contentContainerStyle={styles.scrollContent}
            >
                {banners.map((banner, index) => (
                    <TouchableOpacity
                        key={banner.id}
                        activeOpacity={0.95}
                        onPress={() => onBannerPress?.(banner)}
                    >
                        <BannerItem 
                            banner={banner} 
                            isActive={index === activeIndex}
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Pagination Dots */}
            {banners.length > 1 && (
                <View style={styles.pagination}>
                    {banners.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.paginationDot,
                                {
                                    backgroundColor: index === activeIndex 
                                        ? theme.primary 
                                        : theme.border,
                                    width: index === activeIndex ? wp('5%') : wp('2%'),
                                }
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
    },
    bannerItem: {
        width: BANNER_WIDTH,
        height: BANNER_HEIGHT,
        borderRadius: radius.xl,
        overflow: 'hidden',
        marginRight: spacing.md,
    },
    bannerGradient: {
        flex: 1,
        flexDirection: 'row',
        padding: spacing.lg,
        position: 'relative',
    },
    
    // Content styles
    bannerContent: {
        flex: 1,
        justifyContent: 'center',
        zIndex: 2,
    },
    bannerTag: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: hp('1.3%'),
        fontWeight: fontWeight.semibold,
        letterSpacing: 1,
        marginBottom: hp('0.3%'),
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: hp('0.3%'),
    },
    bannerTitle: {
        color: '#fff',
        fontSize: hp('4.5%'),
        fontWeight: fontWeight.bold,
        letterSpacing: -0.5,
    },
    bannerTitleSuffix: {
        color: '#fff',
        fontSize: hp('2.5%'),
        fontWeight: fontWeight.bold,
        marginLeft: spacing.xs,
    },
    bannerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: fontSize.caption,
        fontWeight: fontWeight.medium,
        marginBottom: spacing.md,
    },
    bannerButton: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        paddingHorizontal: spacing.lg,
        paddingVertical: hp('1%'),
        borderRadius: radius.md,
    },
    bannerButtonText: {
        color: '#1F2937',
        fontSize: fontSize.caption,
        fontWeight: fontWeight.bold,
    },

    // Image styles
    bannerImageContainer: {
        position: 'absolute',
        right: -wp('5%'),
        top: '50%',
        transform: [{ translateY: -hp('8%') }],
        zIndex: 1,
    },
    bannerImage: {
        width: hp('16%'),
        height: hp('16%'),
        borderRadius: hp('8%'),
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.2)',
    },

    // Decorative elements
    decorCircle1: {
        position: 'absolute',
        width: wp('20%'),
        height: wp('20%'),
        borderRadius: wp('10%'),
        backgroundColor: 'rgba(255,255,255,0.05)',
        top: -wp('5%'),
        right: wp('25%'),
    },
    decorCircle2: {
        position: 'absolute',
        width: wp('30%'),
        height: wp('30%'),
        borderRadius: wp('15%'),
        backgroundColor: 'rgba(255,255,255,0.03)',
        bottom: -wp('15%'),
        right: -wp('10%'),
    },

    // Pagination
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.md,
        gap: spacing.xs,
    },
    paginationDot: {
        height: wp('2%'),
        borderRadius: wp('1%'),
    },
});

export default HeroBanner;
