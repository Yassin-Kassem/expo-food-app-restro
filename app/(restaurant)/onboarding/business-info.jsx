import React, { useRef, useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    KeyboardAvoidingView, 
    Platform, 
    TouchableOpacity, 
    Image, 
    StyleSheet, 
    Animated,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import CustomModal from '../../../components/CustomModal';
import { createRestaurant, getRestaurantByOwner, updateRestaurant } from '../../../services/restaurantService';
import { getCurrentUser } from '../../../services/authService';
import { uploadImage } from '../../../services/storageService';
import { getUserData } from '../../../services/userService';

export default function BusinessInfo() {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();

    // Form states
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    
    // Image states
    const [logoUri, setLogoUri] = useState(null);
    const [bannerUri, setBannerUri] = useState(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    
    // UI states
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
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
    const bannerAnim = useRef(new Animated.Value(0)).current;

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
            Animated.timing(bannerAnim, {
                toValue: 1,
                duration: 600,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();

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
        if (!user) return;
        
        const existingRestaurant = await getRestaurantByOwner(user.uid);
        if (existingRestaurant.success) {
            const data = existingRestaurant.data;
            setName(data.name || '');
            setDescription(data.description || '');
            setCategories(data.categories ? data.categories.join(', ') : '');
            setPhoneNumber(data.phone || '');
            setLogoUri(data.logoUrl || null);
            setBannerUri(data.bannerUrl || null);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'Restaurant name is required';
        if (!categories.trim()) newErrors.categories = 'Cuisine type is required';
        if (!description.trim()) newErrors.description = 'Description is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const pickImage = async (type) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: type === 'logo' ? [1, 1] : [16, 9],
                quality: 0.8,
            });
            
            if (!result.canceled) {
                if (type === 'logo') {
                    setLogoUri(result.assets[0].uri);
                } else {
                    setBannerUri(result.assets[0].uri);
                }
            }
        } catch (error) {
            setModalConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to pick image. Please try again.',
                type: 'error'
            });
        }
    };

    const uploadImageIfNeeded = async (uri, folder, setUploading) => {
        if (!uri) return null;
        
        // Skip if already a remote URL
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
            return uri;
        }

        setUploading(true);
        try {
            const upload = await uploadImage(uri, { folder });
            setUploading(false);
            
            if (upload.success) {
                return upload.downloadURL;
            } else {
                throw new Error(upload.error || 'Failed to upload image');
            }
        } catch (error) {
            setUploading(false);
            throw error;
        }
    };

    const handleNext = async () => {
        if (!validate()) return;
        
        setLoading(true);
        setErrors({});

        try {
            const user = getCurrentUser();
            if (!user) {
                throw new Error('You are not signed in. Please try logging in again.');
            }

            const existingRestaurant = await getRestaurantByOwner(user.uid);
            let restaurantId;

            if (existingRestaurant.success) {
                restaurantId = existingRestaurant.data.id;
            } else {
                // Create new restaurant first to get ID for image upload paths
                const result = await createRestaurant(user.uid, {
                    name: name.trim(),
                    description: description.trim(),
                    categories: categories.split(',').map(c => c.trim()).filter(Boolean),
                    phone: phoneNumber,
                    logoUrl: '',
                    bannerUrl: ''
                });
                
                if (!result.success) {
                    throw new Error(result.error || 'Failed to create restaurant');
                }
                restaurantId = result.restaurantId;
            }

            // Upload images in parallel for better performance
            const [logoUrl, bannerUrl] = await Promise.all([
                uploadImageIfNeeded(logoUri, `restaurants/${restaurantId}/logo`, setUploadingLogo),
                uploadImageIfNeeded(bannerUri, `restaurants/${restaurantId}/banner`, setUploadingBanner)
            ]);

            // Update restaurant with all data including image URLs
            await updateRestaurant(restaurantId, {
                name: name.trim(),
                description: description.trim(),
                categories: categories.split(',').map(c => c.trim()).filter(Boolean),
                phone: phoneNumber,
                ...(logoUrl && { logoUrl }),
                ...(bannerUrl && { bannerUrl })
            });

            setLoading(false);
            
            if (isEditMode) {
                router.back();
            } else {
                router.push('/onboarding/location-setup');
            }
        } catch (error) {
            setLoading(false);
            setModalConfig({
                visible: true,
                title: 'Error',
                message: error.message || 'Something went wrong. Please try again.',
                type: 'error'
            });
        }
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
        
        // Banner Section
        bannerSection: {
            position: 'relative',
            height: hp('22%'),
            backgroundColor: theme.surfaceAlt,
            overflow: 'hidden',
        },
        bannerImage: {
            width: '100%',
            height: '100%',
        },
        bannerPlaceholder: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: isDarkMode ? theme.surfaceAlt : '#E8F5E9',
        },
        bannerPlaceholderContent: {
            alignItems: 'center',
        },
        bannerPlaceholderIcon: {
            width: hp('6%'),
            height: hp('6%'),
            borderRadius: hp('3%'),
            backgroundColor: `${theme.primary}20`,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.sm,
        },
        bannerPlaceholderText: {
            fontSize: fontSize.caption,
            color: theme.textSecondary,
            fontWeight: fontWeight.medium,
        },
        bannerOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.3)',
        },
        bannerEditButton: {
            position: 'absolute',
            bottom: spacing.md,
            right: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.95)',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: radius.pill,
            gap: spacing.xs,
            ...shadows.medium,
        },
        bannerEditText: {
            fontSize: fontSize.caption,
            fontWeight: fontWeight.semibold,
            color: theme.textPrimary,
        },
        
        // Logo Section
        logoContainer: {
            alignItems: 'center',
            marginTop: -hp('6%'),
            zIndex: 10,
        },
        logoPicker: {
            width: hp('12%'),
            height: hp('12%'),
            borderRadius: hp('6%'),
            backgroundColor: theme.surface,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 4,
            borderColor: theme.background,
            overflow: 'hidden',
            ...shadows.floating,
        },
        logoImage: {
            width: '100%',
            height: '100%',
        },
        logoPlaceholder: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        logoEditBadge: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: hp('3.5%'),
            height: hp('3.5%'),
            borderRadius: hp('1.75%'),
            backgroundColor: theme.primary,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 3,
            borderColor: theme.background,
        },
        logoLabel: {
            fontSize: fontSize.caption,
            fontWeight: fontWeight.medium,
            color: theme.primary,
            marginTop: spacing.sm,
        },
        
        // Header Section
        headerSection: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.lg,
            paddingBottom: spacing.md,
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
        
        // Form Section
        formSection: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
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
        
        // Loading overlay
        uploadingOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: hp('6%'),
        },
    });

    const isUploading = uploadingLogo || uploadingBanner;

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.scrollContainer}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Banner Section */}
                    <Animated.View style={{ opacity: bannerAnim }}>
                        <TouchableOpacity 
                            style={styles.bannerSection}
                            onPress={() => pickImage('banner')}
                            activeOpacity={0.9}
                        >
                            {bannerUri ? (
                                <>
                                    <Image 
                                        source={{ uri: bannerUri }} 
                                        style={styles.bannerImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.bannerOverlay} />
                                    {uploadingBanner && (
                                        <View style={[styles.uploadingOverlay, { borderRadius: 0 }]}>
                                            <ActivityIndicator size="large" color="#fff" />
                                        </View>
                                    )}
                                </>
                            ) : (
                                <View style={styles.bannerPlaceholder}>
                                    <View style={styles.bannerPlaceholderContent}>
                                        <View style={styles.bannerPlaceholderIcon}>
                                            <Ionicons name="image-outline" size={hp('2.5%')} color={theme.primary} />
                                        </View>
                                        <Text style={styles.bannerPlaceholderText}>Tap to add cover photo</Text>
                                    </View>
                                </View>
                            )}
                            <View style={styles.bannerEditButton}>
                                <Ionicons 
                                    name={bannerUri ? "pencil" : "camera"} 
                                    size={hp('1.6%')} 
                                    color={theme.primary} 
                                />
                                <Text style={styles.bannerEditText}>
                                    {bannerUri ? 'Change' : 'Add'} Banner
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Logo Section */}
                    <Animated.View 
                        style={[
                            styles.logoContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
                    >
                        <TouchableOpacity 
                            onPress={() => pickImage('logo')} 
                            activeOpacity={0.8}
                        >
                            <View style={styles.logoPicker}>
                                {logoUri ? (
                                    <Image source={{ uri: logoUri }} style={styles.logoImage} />
                                ) : (
                                    <View style={styles.logoPlaceholder}>
                                        <Ionicons 
                                            name="restaurant" 
                                            size={hp('3.5%')} 
                                            color={theme.textMuted} 
                                        />
                                    </View>
                                )}
                                {uploadingLogo && (
                                    <View style={styles.uploadingOverlay}>
                                        <ActivityIndicator size="small" color="#fff" />
                                    </View>
                                )}
                            </View>
                            <View style={styles.logoEditBadge}>
                                <Ionicons 
                                    name={logoUri ? "pencil" : "camera"} 
                                    size={hp('1.5%')} 
                                    color="#fff" 
                                />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.logoLabel}>
                            {logoUri ? 'Change Logo' : 'Add Logo'}
                        </Text>
                    </Animated.View>

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
                        <Text style={styles.title}>Business Information</Text>
                        <Text style={styles.subtitle}>
                            Tell us about your restaurant so customers can find you
                        </Text>
                    </Animated.View>

                    {/* Form */}
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
                            <Text style={styles.formTitle}>Restaurant Details</Text>
                            
                            <Input
                                label="Restaurant Name"
                                placeholder="e.g. The Golden Spoon"
                                value={name}
                                onChangeText={setName}
                                error={errors.name}
                                autoCapitalize="words"
                            />
                            <Input
                                label="Cuisine Type"
                                placeholder="e.g. Italian, Mexican, Asian"
                                value={categories}
                                onChangeText={setCategories}
                                error={errors.categories}
                            />
                            <Input
                                label="Phone Number"
                                placeholder="(555) 123-4567"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                                error={errors.phoneNumber}
                            />
                            <Input
                                label="Description"
                                placeholder="Tell customers what makes your restaurant special..."
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                error={errors.description}
                            />
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer */}
            <View style={styles.footer}>
                <Button
                    title="Cancel"
                    onPress={() => router.back()}
                    variant="secondary"
                    style={{ flex: 1 }}
                />
                <Button
                    title={isEditMode ? "Save Changes" : "Continue"}
                    onPress={handleNext}
                    loading={loading || isUploading}
                    disabled={isUploading}
                    style={{ flex: 2 }}
                    icon={!loading && !isUploading && (
                        <Ionicons name="arrow-forward" size={hp('2%')} color="#fff" />
                    )}
                />
            </View>

            {/* Error Modal */}
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
