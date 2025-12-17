import React, { useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Animated,
    Dimensions,
    StatusBar,
    Image,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../../constants/theme';

// Import the banner
const RestroBanner = require('../../assets/restro_banner.png');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Animated decorative blob component
const AnimatedBlob = ({ style, delay = 0, color = 'rgba(61, 179, 108, 0.15)' }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Fade in
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1200,
            delay,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();

        // Slow breathing animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.1,
                    duration: 6000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 6000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View 
            style={[
                style,
                { 
                    backgroundColor: color,
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }] 
                }
            ]}
        />
    );
};

export default function WelcomeScreen() {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();

    // Animations
    const bannerScale = useRef(new Animated.Value(0.9)).current;
    const bannerOpacity = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentSlide = useRef(new Animated.Value(30)).current;
    const buttonsOpacity = useRef(new Animated.Value(0)).current;
    const buttonsSlide = useRef(new Animated.Value(40)).current;

    useEffect(() => {
        // Sequence animations
        Animated.sequence([
            // Banner fade and scale in
            Animated.parallel([
                Animated.timing(bannerOpacity, {
                    toValue: 1,
                    duration: 700,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.spring(bannerScale, {
                    toValue: 1,
                    friction: 10,
                    tension: 50,
                    useNativeDriver: true,
                }),
            ]),
            // Content fade and slide
            Animated.parallel([
                Animated.timing(contentOpacity, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.spring(contentSlide, {
                    toValue: 0,
                    friction: 12,
                    useNativeDriver: true,
                }),
            ]),
            // Buttons slide up
            Animated.parallel([
                Animated.timing(buttonsOpacity, {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.spring(buttonsSlide, {
                    toValue: 0,
                    friction: 12,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    // Theme-aware gradient colors
    const gradientColors = isDarkMode 
        ? ['#0F172A', '#1E293B', '#0F172A'] // Dark slate theme
        : ['#072e26', '#0a3830', '#072e26']; // Original dark green

    const blobColor1 = isDarkMode 
        ? 'rgba(34, 197, 94, 0.08)' 
        : 'rgba(61, 179, 108, 0.07)';
    
    const blobColor2 = isDarkMode 
        ? 'rgba(34, 197, 94, 0.05)' 
        : 'rgba(139, 195, 74, 0.05)';

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#0F172A' : '#072e26' }]}>
            <StatusBar barStyle="light-content" />
            
            {/* Background Gradient - Matching banner colors */}
            <LinearGradient
                colors={gradientColors}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Animated decorative blobs */}
            <AnimatedBlob 
                style={styles.blob1} 
                delay={300} 
                color={blobColor1}
            />
            <AnimatedBlob 
                style={styles.blob2} 
                delay={600} 
                color={blobColor2}
            />

            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                {/* Main Content */}
                <View style={styles.mainContent}>
                    {/* Banner Image */}
                    <Animated.View 
                        style={[
                            styles.bannerContainer,
                            { 
                                opacity: bannerOpacity,
                                transform: [{ scale: bannerScale }]
                            }
                        ]}
                    >
                        <Image 
                            source={RestroBanner} 
                            style={styles.bannerImage}
                            resizeMode="contain"
                        />
                    </Animated.View>

                    {/* Tagline & Features */}
                    <Animated.View 
                        style={[
                            styles.contentContainer,
                            { 
                                opacity: contentOpacity,
                                transform: [{ translateY: contentSlide }],
                            }
                        ]}
                    >
                        <Text style={styles.tagline}>
                            {"Delicious food at your doorstep "}
                        </Text>
                        
                        <View style={[styles.featuresContainer, { 
                            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.06)',
                            borderColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)',
                        }]}>
                            <View style={styles.featureItem}>
                                <Ionicons name="flash" size={hp('1.8%')} color={theme.primary} />
                                <Text style={styles.featureText} numberOfLines={1}>{"Fast "}</Text>
                            </View>
                            
                            <View style={styles.featureDivider} />
                            
                            <View style={styles.featureItem}>
                                <Ionicons name="restaurant" size={hp('1.8%')} color={theme.primary} />
                                <Text style={styles.featureText} numberOfLines={1}>{"Quality "}</Text>
                            </View>
                            
                            <View style={styles.featureDivider} />
                            
                            <View style={styles.featureItem}>
                                <Ionicons name="shield-checkmark" size={hp('1.8%')} color={theme.primary} />
                                <Text style={styles.featureText} numberOfLines={1}>{"Secure "}</Text>
                            </View>
                        </View>
                    </Animated.View>
                </View>

                {/* Buttons Section */}
                <Animated.View 
                    style={[
                        styles.buttonsContainer,
                        { 
                            opacity: buttonsOpacity,
                            transform: [{ translateY: buttonsSlide }],
                        }
                    ]}
                >
                    {/* Get Started Button */}
                    <TouchableOpacity 
                        style={[styles.primaryButton, { shadowColor: theme.primary }]}
                        onPress={() => router.push('/(auth)/register')}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={isDarkMode ? [theme.primary, theme.primaryDark] : ['#3DB86C', '#2E9D5A']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.primaryButtonGradient}
                        >
                            <Text style={styles.primaryButtonText}>{"Get Started "}</Text>
                            <View style={styles.buttonIconContainer}>
                                <Ionicons name="arrow-forward" size={hp('2%')} color="#fff" />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity 
                        style={[styles.secondaryButton, { 
                            borderColor: isDarkMode ? `${theme.primary}60` : 'rgba(61, 184, 108, 0.5)',
                            backgroundColor: isDarkMode ? `${theme.primary}15` : 'rgba(61, 184, 108, 0.1)',
                        }]}
                        onPress={() => router.push('/(auth)/login')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>{"I already have an account "}</Text>
                    </TouchableOpacity>

                    {/* Terms */}
                    <Text style={styles.termsText}>
                        {"By continuing, you agree to our "}
                        <Text style={[styles.termsLink, { color: theme.primary }]}>{"Terms of Service "}</Text>
                        {"and "}
                        <Text style={[styles.termsLink, { color: theme.primary }]}>{"Privacy Policy "}</Text>
                    </Text>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    safeArea: {
        flex: 1,
    },

    // Decorative blobs
    blob1: {
        position: 'absolute',
        width: wp('80%'),
        height: wp('80%'),
        borderRadius: wp('40%'),
        top: -wp('25%'),
        left: -wp('25%'),
    },
    blob2: {
        position: 'absolute',
        width: wp('70%'),
        height: wp('70%'),
        borderRadius: wp('35%'),
        bottom: hp('10%'),
        right: -wp('35%'),
    },

    // Main content
    mainContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: wp('5%'),
    },

    // Banner
    bannerContainer: {
        width: wp('85%'),
        height: hp('22%'),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp('4%'),
        borderRadius: 20,
        overflow: 'hidden',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },

    // Content
    contentContainer: {
        alignItems: 'center',
        width: '100%',
    },
    tagline: {
        fontSize: hp('2.6%'),
        color: '#ffffff',
        textAlign: 'center',
        fontWeight: '500',
        marginBottom: hp('3%'),
        letterSpacing: 0.5,
    },

    // Features
    featuresContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp('1.5%'),
        paddingHorizontal: wp('6%'),
        borderRadius: 50,
        borderWidth: 1,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    featureText: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: hp('1.5%'),
        fontWeight: '500',
    },
    featureDivider: {
        width: 1,
        height: hp('1.8%'),
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: wp('4%'),
    },

    // Buttons
    buttonsContainer: {
        paddingHorizontal: wp('6%'),
        paddingBottom: hp('3%'),
    },
    primaryButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: hp('1.5%'),
        elevation: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
    },
    primaryButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp('2.2%'),
    },
    primaryButtonText: {
        fontSize: hp('2%'),
        fontWeight: '700',
        color: '#fff',
        marginRight: 8,
    },
    buttonIconContainer: {
        width: hp('3.2%'),
        height: hp('3.2%'),
        borderRadius: hp('1.6%'),
        backgroundColor: 'rgba(255,255,255,0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp('2%'),
        borderRadius: 16,
        borderWidth: 1.5,
        marginBottom: hp('2%'),
    },
    secondaryButtonText: {
        fontSize: hp('1.8%'),
        fontWeight: '600',
    },
    termsText: {
        fontSize: hp('1.35%'),
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        lineHeight: hp('2.2%'),
    },
    termsLink: {
        fontWeight: '600',
    },
});
