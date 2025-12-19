import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity, 
    Platform,
    Animated,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import CustomModal from '../../../components/CustomModal';
import { updateRestaurant, getRestaurantByOwner } from '../../../services/restaurantService';
import { getCurrentUser } from '../../../services/authService';
import { getUserData } from '../../../services/userService';

export default function LocationSetup() {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();

    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [location, setLocation] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info'
    });

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const mapAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

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
            Animated.timing(mapAnim, {
                toValue: 1,
                duration: 600,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();

        // Pulse animation for location button
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        checkEditMode();
        loadData();
    }, []);

    const checkEditMode = async () => {
        const user = getCurrentUser();
        if (user) {
            const userData = await getUserData(user.uid);
            if (userData.success && userData.data?.onboardingCompleted) {
                setIsEditMode(true);
            }
        }
    };

    const loadData = async () => {
        const user = getCurrentUser();
        const existingRestaurant = await getRestaurantByOwner(user.uid);
        if (existingRestaurant.success) {
            const data = existingRestaurant.data;
            if (data.address) setAddress(data.address);
            if (data.city) setCity(data.city);
            if (data.postalCode) setPostalCode(data.postalCode);
            if (data.location) setLocation(data.location);
        }
    };

    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
    };

    const getCurrentLocation = async () => {
        setGettingLocation(true);
        const hasPermission = await requestLocationPermission();
        
        if (!hasPermission) {
            setModalConfig({
                visible: true,
                title: 'Permission Required',
                message: 'We need location permission to help customers find your restaurant. Please enable it in your device settings.',
                type: 'warning'
            });
            setGettingLocation(false);
            return;
        }

        try {
            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            const { latitude, longitude } = currentLocation.coords;
            setLocation({ lat: latitude, lng: longitude });

            const addressResults = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (addressResults.length > 0) {
                const addr = addressResults[0];
                const streetAddress = [addr.streetNumber, addr.street].filter(Boolean).join(' ');
                setAddress(streetAddress || addr.name || '');
                setCity(addr.city || addr.subregion || '');
                setPostalCode(addr.postalCode || '');
            }
        } catch (error) {
            setModalConfig({
                visible: true,
                title: 'Location Error',
                message: 'We couldn\'t detect your location. Please enter your address manually.',
                type: 'error'
            });
        }
        setGettingLocation(false);
    };

    const handleNext = async () => {
        const newErrors = {};
        if (!address.trim()) newErrors.address = 'Street address is required';
        if (!city.trim()) newErrors.city = 'City is required';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        const user = getCurrentUser();
        const restaurantResult = await getRestaurantByOwner(user.uid);

        if (restaurantResult.success) {
            const fullAddress = [address, city, postalCode].filter(Boolean).join(', ');
            await updateRestaurant(restaurantResult.data.id, { 
                location, 
                address: fullAddress,
                city,
                postalCode
            });
            
            if (isEditMode) {
                router.back();
            } else {
                router.push('/onboarding/hours');
            }
        }
        setLoading(false);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        scrollContainer: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: hp('18%'),
        },
        
        // Header Section
        headerSection: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.lg,
        },
        title: {
            fontSize: fontSize.title,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
            letterSpacing: -0.5,
            marginBottom: spacing.xs,
        },
        subtitle: {
            fontSize: fontSize.body,
            color: theme.textSecondary,
            lineHeight: hp('2.8%'),
        },
        
        // Map Preview Section
        mapSection: {
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.lg,
        },
        mapPreview: {
            height: hp('20%'),
            backgroundColor: isDarkMode ? theme.surfaceAlt : '#E8F5E9',
            borderRadius: radius.xl,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            ...shadows.soft,
        },
        mapGradient: {
            ...StyleSheet.absoluteFillObject,
            opacity: 0.1,
        },
        mapIconContainer: {
            alignItems: 'center',
        },
        mapIconCircle: {
            width: hp('8%'),
            height: hp('8%'),
            borderRadius: hp('4%'),
            backgroundColor: theme.surface,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.sm,
            ...shadows.medium,
        },
        mapIconInner: {
            width: hp('6%'),
            height: hp('6%'),
            borderRadius: hp('3%'),
            backgroundColor: `${theme.primary}15`,
            justifyContent: 'center',
            alignItems: 'center',
        },
        mapLabel: {
            fontSize: fontSize.caption,
            color: theme.textSecondary,
            fontWeight: fontWeight.medium,
        },
        locationDetected: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: `${theme.success}15`,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radius.pill,
            gap: spacing.xs,
            marginTop: spacing.sm,
        },
        locationDetectedText: {
            fontSize: fontSize.caption,
            color: theme.success,
            fontWeight: fontWeight.semibold,
        },
        
        // Location Button
        locationBtnContainer: {
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.xl,
        },
        locationBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.md,
            borderRadius: radius.lg,
            backgroundColor: `${theme.primary}10`,
            borderWidth: 2,
            borderColor: theme.primary,
            gap: spacing.sm,
        },
        locationBtnActive: {
            backgroundColor: theme.primary,
        },
        locationBtnText: {
            color: theme.primary,
            fontWeight: fontWeight.bold,
            fontSize: fontSize.body,
        },
        locationBtnTextActive: {
            color: '#fff',
        },
        
        // Form Section
        formSection: {
            paddingHorizontal: spacing.lg,
        },
        formCard: {
            backgroundColor: theme.surface,
            borderRadius: radius.xl,
            padding: spacing.lg,
            ...shadows.soft,
        },
        formTitle: {
            fontSize: fontSize.caption,
            fontWeight: fontWeight.bold,
            color: theme.textMuted,
            marginBottom: spacing.md,
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        dividerContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: spacing.lg,
            paddingHorizontal: spacing.lg,
        },
        dividerLine: {
            flex: 1,
            height: 1,
            backgroundColor: theme.border,
        },
        dividerText: {
            color: theme.textMuted,
            fontSize: fontSize.caption,
            fontWeight: fontWeight.medium,
            paddingHorizontal: spacing.md,
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

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
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
                    <Text style={styles.title}>Where are you located?</Text>
                    <Text style={styles.subtitle}>
                        Help customers find your restaurant with an accurate address
                    </Text>
                </Animated.View>

                {/* Map Preview */}
                <Animated.View 
                    style={[
                        styles.mapSection,
                        { opacity: mapAnim }
                    ]}
                >
                    <View style={styles.mapPreview}>
                        <View style={styles.mapIconContainer}>
                            <View style={styles.mapIconCircle}>
                                <View style={styles.mapIconInner}>
                                    <Ionicons 
                                        name="location" 
                                        size={hp('2.5%')} 
                                        color={theme.primary} 
                                    />
                                </View>
                            </View>
                            <Text style={styles.mapLabel}>
                                {location ? 'Location detected' : 'Set your location '}
                            </Text>
                            {location && (
                                <View style={styles.locationDetected}>
                                    <Ionicons name="checkmark-circle" size={hp('1.6%')} color={theme.success} />
                                    <Text style={styles.locationDetectedText}>Coordinates saved</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </Animated.View>

                {/* Auto-detect Location Button */}
                <Animated.View 
                    style={[
                        styles.locationBtnContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: pulseAnim }]
                        }
                    ]}
                >
                    <TouchableOpacity
                        style={[
                            styles.locationBtn,
                            gettingLocation && styles.locationBtnActive
                        ]}
                        onPress={getCurrentLocation}
                        disabled={gettingLocation}
                        activeOpacity={0.8}
                    >
                        {gettingLocation ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons 
                                name="navigate-circle" 
                                size={hp('2.5%')} 
                                color={theme.primary} 
                            />
                        )}
                        <Text style={[
                            styles.locationBtnText,
                            gettingLocation && styles.locationBtnTextActive
                        ]}>
                            {gettingLocation ? 'Detecting location...' : 'Use Current Location'}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or enter manually</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Address Form */}
                <Animated.View 
                    style={[
                        styles.formSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>Address Details</Text>
                        
                        <Input
                            label="Street Address"
                            placeholder="e.g. 123 Main Street"
                            value={address}
                            onChangeText={setAddress}
                            error={errors.address}
                        />
                        <Input
                            label="City"
                            placeholder="e.g. New York"
                            value={city}
                            onChangeText={setCity}
                            error={errors.city}
                        />
                        <Input
                            label="Postal Code (Optional)"
                            placeholder="e.g. 10001"
                            value={postalCode}
                            onChangeText={setPostalCode}
                            keyboardType="numeric"
                        />
                    </View>
                </Animated.View>
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
                    title={isEditMode ? "Save Changes" : "Continue"}
                    onPress={handleNext}
                    loading={loading}
                    style={{ flex: 2 }}
                    icon={!loading && (
                        <Ionicons name="arrow-forward" size={hp('2%')} color="#fff" />
                    )}
                />
            </View>

            {/* Modal */}
            <CustomModal
                visible={modalConfig.visible}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                primaryButtonText="OK"
                onPrimaryPress={() => setModalConfig(prev => ({ ...prev, visible: false }))}
                onClose={() => setModalConfig(prev => ({ ...prev, visible: false }))}
            />
        </View>
    );
}
