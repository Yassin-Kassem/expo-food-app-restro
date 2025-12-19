import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity, 
    Image, 
    Platform,
    Animated,
    KeyboardAvoidingView,
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
import { getRestaurantByOwner } from '../../../services/restaurantService';
import { addMenuItem, getMenuItems, updateMenuItem } from '../../../services/menuService';
import { uploadImage } from '../../../services/storageService';
import { getCurrentUser } from '../../../services/authService';

export default function AddFirstItem() {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [existingItemId, setExistingItemId] = useState(null);
    const [modalConfig, setModalConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info'
    });

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const cardAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

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
            Animated.timing(cardAnim, {
                toValue: 1,
                duration: 600,
                delay: 200,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();

        loadData();
    }, []);

    const loadData = async () => {
        const user = getCurrentUser();
        const restaurant = await getRestaurantByOwner(user.uid);
        if (restaurant.success) {
            const menuItems = await getMenuItems(restaurant.data.id);
            if (menuItems.success && menuItems.data.length > 0) {
                const item = menuItems.data[0];
                setExistingItemId(item.id);
                setName(item.name || '');
                setDescription(item.description || '');
                setPrice(item.price ? item.price.toString() : '');
                setImageUri(item.imageUrl || null);
            }
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });
            if (!result.canceled) {
                setImageUri(result.assets[0].uri);
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

    const handleNext = async () => {
        if (!name.trim()) {
            setModalConfig({
                visible: true,
                title: 'Missing Information',
                message: 'Please enter a name for your menu item.',
                type: 'warning'
            });
            return;
        }

        if (!price.trim()) {
            setModalConfig({
                visible: true,
                title: 'Missing Information',
                message: 'Please enter a price for your menu item.',
                type: 'warning'
            });
            return;
        }

        const numericPrice = parseFloat(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            setModalConfig({
                visible: true,
                title: 'Invalid Price',
                message: 'Please enter a valid price greater than 0.',
                type: 'warning'
            });
            return;
        }

        setLoading(true);
        
        try {
            const user = getCurrentUser();
            const restaurant = await getRestaurantByOwner(user.uid);
            
            if (!restaurant.success) {
                throw new Error('Restaurant not found. Please try again.');
            }

            let imageUrl = imageUri;

            // Upload image if it's a local file
            if (imageUri && !imageUri.startsWith('http://') && !imageUri.startsWith('https://')) {
                setUploading(true);
                const upload = await uploadImage(imageUri, { 
                    folder: `restaurants/${restaurant.data.id}/menu` 
                });
                setUploading(false);
                
                if (!upload.success) {
                    throw new Error(upload.error || 'Failed to upload image');
                }
                imageUrl = upload.downloadURL;
            }

            const itemData = {
                name: name.trim(),
                description: description.trim(),
                price: numericPrice,
                imageUrl: imageUrl || '',
                available: true,
                category: 'Featured'
            };

            let result;
            if (existingItemId) {
                result = await updateMenuItem(restaurant.data.id, existingItemId, itemData);
            } else {
                result = await addMenuItem(restaurant.data.id, itemData);
            }

            if (!result.success) {
                throw new Error(result.error || 'Failed to save menu item');
            }

            router.push('/onboarding/review');
        } catch (error) {
            setModalConfig({
                visible: true,
                title: 'Error',
                message: error.message || 'Something went wrong. Please try again.',
                type: 'error'
            });
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    const formatPrice = (value) => {
        if (!value) return 'EGP 0.00';
        const num = parseFloat(value);
        if (isNaN(num)) return 'EGP 0.00';
        return `EGP ${num.toFixed(2)}`;
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
            paddingBottom: spacing.md,
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
        
        // Preview Section
        previewSection: {
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.lg,
        },
        previewLabel: {
            fontSize: fontSize.caption,
            fontWeight: fontWeight.bold,
            color: theme.textMuted,
            marginBottom: spacing.sm,
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        previewCard: {
            backgroundColor: theme.surface,
            borderRadius: radius.xl,
            overflow: 'hidden',
            ...shadows.medium,
        },
        cardImageContainer: {
            width: '100%',
            height: hp('20%'),
            backgroundColor: isDarkMode ? theme.surfaceAlt : '#F3F4F6',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
        },
        cardImage: {
            width: '100%',
            height: '100%',
        },
        cardImagePlaceholder: {
            alignItems: 'center',
        },
        placeholderIconContainer: {
            width: hp('7%'),
            height: hp('7%'),
            borderRadius: hp('3.5%'),
            backgroundColor: `${theme.primary}15`,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.sm,
        },
        placeholderText: {
            fontSize: fontSize.caption,
            color: theme.textMuted,
            fontWeight: fontWeight.medium,
        },
        uploadBadge: {
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
            ...shadows.soft,
        },
        uploadBadgeText: {
            fontSize: fontSize.caption,
            fontWeight: fontWeight.semibold,
            color: theme.textPrimary,
        },
        cardContent: {
            padding: spacing.lg,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: spacing.sm,
        },
        cardTitleContainer: {
            flex: 1,
            marginRight: spacing.md,
        },
        cardTitle: {
            fontSize: fontSize.subtitle,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
            marginBottom: spacing.xs / 2,
        },
        cardCategory: {
            fontSize: fontSize.caption,
            color: theme.textMuted,
        },
        cardPrice: {
            fontSize: fontSize.subtitle,
            fontWeight: fontWeight.bold,
            color: theme.primary,
        },
        cardDescription: {
            fontSize: fontSize.body,
            color: theme.textSecondary,
            lineHeight: hp('2.5%'),
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
        
        // Tips Section
        tipsSection: {
            paddingHorizontal: spacing.lg,
            marginTop: spacing.lg,
        },
        tipsCard: {
            backgroundColor: isDarkMode ? theme.surfaceAlt : '#FFF8E1',
            borderRadius: radius.xl,
            padding: spacing.lg,
            flexDirection: 'row',
            gap: spacing.md,
        },
        tipsIconContainer: {
            width: hp('4.5%'),
            height: hp('4.5%'),
            borderRadius: hp('2.25%'),
            backgroundColor: `${theme.warning}20`,
            justifyContent: 'center',
            alignItems: 'center',
        },
        tipsContent: {
            flex: 1,
        },
        tipsTitle: {
            fontSize: fontSize.body,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
            marginBottom: spacing.xs,
        },
        tipsText: {
            fontSize: fontSize.caption,
            color: theme.textSecondary,
            lineHeight: hp('2.2%'),
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
        
        // Upload Overlay
        uploadingOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView 
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
                        <Text style={styles.title}>Add your first item</Text>
                        <Text style={styles.subtitle}>
                            Create a delicious menu item to attract customers
                        </Text>
                    </Animated.View>

                    {/* Live Preview */}
                    <Animated.View 
                        style={[
                            styles.previewSection,
                            {
                                opacity: cardAnim,
                                transform: [{ scale: scaleAnim }]
                            }
                        ]}
                    >
                        <Text style={styles.previewLabel}>Live Preview</Text>
                        <View style={styles.previewCard}>
                            <TouchableOpacity 
                                style={styles.cardImageContainer}
                                onPress={pickImage}
                                activeOpacity={0.9}
                            >
                                {imageUri ? (
                                    <>
                                        <Image 
                                            source={{ uri: imageUri }} 
                                            style={styles.cardImage} 
                                            resizeMode="cover" 
                                        />
                                        {uploading && (
                                            <View style={styles.uploadingOverlay}>
                                                <ActivityIndicator size="large" color="#fff" />
                                            </View>
                                        )}
                                    </>
                                ) : (
                                    <View style={styles.cardImagePlaceholder}>
                                        <View style={styles.placeholderIconContainer}>
                                            <Ionicons 
                                                name="fast-food" 
                                                size={hp('3%')} 
                                                color={theme.primary} 
                                            />
                                        </View>
                                        <Text style={styles.placeholderText}>
                                            {"Tap to add photo "}
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.uploadBadge}>
                                    <Ionicons 
                                        name={imageUri ? "pencil" : "camera"} 
                                        size={hp('1.6%')} 
                                        color={theme.primary} 
                                    />
                                    <Text style={styles.uploadBadgeText}>
                                        {imageUri ? 'Change' : 'Add'} Photo
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <View style={styles.cardContent}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardTitleContainer}>
                                        <Text style={styles.cardTitle} numberOfLines={1}>
                                            {name || 'Item Name'}
                                        </Text>
                                        <Text style={styles.cardCategory}>Featured</Text>
                                    </View>
                                    <Text style={styles.cardPrice}>
                                        {formatPrice(price)}
                                    </Text>
                                </View>
                                <Text style={styles.cardDescription} numberOfLines={2}>
                                    {description || 'Add a mouthwatering description...'}
                                </Text>
                            </View>
                        </View>
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
                            <Text style={styles.formTitle}>Item Details</Text>
                            
                            <Input
                                label="Item Name"
                                placeholder="e.g. Classic Cheeseburger"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                            <Input
                                label="Price (EGP)"
                                placeholder="e.g. 99.99"
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="decimal-pad"
                            />
                            <Input
                                label="Description"
                                placeholder="Describe what makes this item special..."
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    </Animated.View>

                    {/* Tips */}
                    <Animated.View 
                        style={[
                            styles.tipsSection,
                            { opacity: fadeAnim }
                        ]}
                    >
                        <View style={styles.tipsCard}>
                            <View style={styles.tipsIconContainer}>
                                <Ionicons name="bulb" size={hp('2%')} color={theme.warning} />
                            </View>
                            <View style={styles.tipsContent}>
                                <Text style={styles.tipsTitle}>Pro Tip</Text>
                                <Text style={styles.tipsText}>
                                    Items with high-quality photos get 3x more orders. 
                                    Use natural lighting for best results!
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer */}
            <View style={styles.footer}>
                <Button
                    title="Back"
                    onPress={() => router.back()}
                    variant="secondary"
                    style={{ flex: 1 }}
                />
                <Button
                    title="Continue"
                    onPress={handleNext}
                    loading={loading || uploading}
                    disabled={uploading}
                    style={{ flex: 2 }}
                    icon={!loading && !uploading && (
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
