import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../../../constants/theme';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { getRestaurantByOwner, updateRestaurant } from '../../../services/restaurantService';
import { getCurrentUser } from '../../../services/authService';
import { uploadImage } from '../../../services/storageService';

export default function EditBusinessInfo() {
    const { theme } = useTheme();
    const router = useRouter();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [logoUri, setLogoUri] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const user = getCurrentUser();
            if (!user) return;

            const existingRestaurant = await getRestaurantByOwner(user.uid);
            if (existingRestaurant.success && existingRestaurant.data) {
                const data = existingRestaurant.data;
                setName(data.name || '');
                setDescription(data.description || '');
                setCategories(data.categories ? data.categories.join(', ') : '');
                setPhoneNumber(data.phone || '');
                setLogoUri(data.logoUrl || null);
            }
        } catch (error) {
            // Silent error - form will start empty
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

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled) setLogoUri(result.assets[0].uri);
    };

    const uploadLogoIfNeeded = async (restaurantId) => {
        if (!logoUri) return null;
        if (logoUri.startsWith('http://') || logoUri.startsWith('https://')) {
            return logoUri;
        }

        setUploading(true);
        try {
            const upload = await uploadImage(logoUri, { folder: `restaurants/${restaurantId}/logo` });
            if (upload.success) {
                return upload.downloadURL;
            } else {
                // Only show error for non-retryable errors
                if (!upload.retryable) {
                    setErrors({ general: upload.error || 'Failed to upload logo' });
                }
                return null;
            }
        } catch (error) {
            setErrors({ general: 'Failed to upload logo. Please try again.' });
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!validate()) return;
        setLoading(true);
        let isMounted = true;

        try {
            const user = getCurrentUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const existingRestaurant = await getRestaurantByOwner(user.uid);
            if (!isMounted) return;

            if (!existingRestaurant.success) {
                if (!existingRestaurant.retryable) {
                    setErrors({ general: existingRestaurant.error });
                }
                setLoading(false);
                return;
            }

            const restaurantId = existingRestaurant.data.id;
            const logoUrl = await uploadLogoIfNeeded(restaurantId);
            if (!isMounted) return;

            // If logo upload failed with non-retryable error, stop
            if (!logoUrl && logoUri && !logoUri.startsWith('http')) {
                // Error already set in uploadLogoIfNeeded
                setLoading(false);
                return;
            }

            const result = await updateRestaurant(restaurantId, {
                name: name.trim(),
                description: description.trim(),
                categories: categories.split(',').map(c => c.trim()).filter(Boolean),
                phone: phoneNumber,
                ...(logoUrl ? { logoUrl } : {})
            });

            if (!isMounted) return;

            if (!result.success) {
                if (result.errors) {
                    setErrors(result.errors);
                } else if (!result.retryable) {
                    setErrors({ general: result.error });
                }
                setLoading(false);
                return;
            }

            router.back();
        } catch (error) {
            if (!isMounted) return;
            setErrors({ general: 'An unexpected error occurred. Please try again.' });
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    };

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.surface,
            paddingTop: spacing.xxl,
        },
        header: {
            paddingHorizontal: spacing.xxl,
            paddingBottom: spacing.lg,
            backgroundColor: theme.surface,
            zIndex: 10,
        },
        title: {
            marginTop: spacing.sm,
            marginLeft: spacing.lg,
            fontSize: fontSize.title,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
            letterSpacing: -0.5,
            marginBottom: spacing.xs,
        },
        subtitle: {
            marginLeft: spacing.lg,
            fontSize: fontSize.body,
            color: theme.textSecondary,
            lineHeight: fontSize.body * 1.5,
        },
        scrollContainer: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: hp('15%'),
        },
        logoSection: {
            alignItems: 'center',
            marginBottom: spacing.xl,
            marginTop: spacing.md,
        },
        logoPicker: {
            width: 110,
            height: 110,
            borderRadius: radius.xl,
            backgroundColor: theme.surface,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: logoUri ? 'transparent' : theme.border,
            borderStyle: 'dashed',
            marginBottom: spacing.sm,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: logoUri ? 0.15 : 0.05,
            shadowRadius: 8,
            elevation: 4,
        },
        logoImage: {
            width: '100%',
            height: '100%',
            borderRadius: radius.xl,
        },
        logoLabel: {
            fontSize: fontSize.caption,
            fontWeight: fontWeight.medium,
            color: theme.primary,
            marginTop: spacing.xs,
        },
        formContainer: {
            gap: spacing.sm,
        },
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
            borderTopColor: theme.surfaceAlt,
            flexDirection: 'row',
            gap: spacing.md
        },
        nextButton: {
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 8,
        }
    });

    return (
        <View style={styles.safeArea}>
            <View style={styles.header}>
                <View style={{ marginTop: spacing.sm }}>
                    <Text style={styles.title}>Business Information</Text>
                    <Text style={styles.subtitle}>Update your restaurant details</Text>
                </View>
            </View>

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
                    <View style={styles.logoSection}>
                        <TouchableOpacity onPress={pickImage} style={styles.logoPicker} activeOpacity={0.7}>
                            {logoUri ? (
                                <Image source={{ uri: logoUri }} style={styles.logoImage} />
                            ) : (
                                <View style={{ alignItems: 'center' }}>
                                    <Ionicons name="camera-outline" size={34} color={theme.textSecondary} />
                                    <Text style={{
                                        fontSize: fontSize.caption,
                                        color: theme.textSecondary,
                                        marginTop: 4,
                                        fontWeight: fontWeight.medium
                                    }}>
                                        Add Logo
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        {logoUri && (
                            <Text style={styles.logoLabel}>Change Logo</Text>
                        )}
                    </View>

                    <View style={styles.formContainer}>
                        <Input
                            label="Restaurant name"
                            placeholder="e.g. The Golden Spoon"
                            value={name}
                            onChangeText={setName}
                            error={errors.name}
                            autoCapitalize="words"
                        />
                        <Input
                            label="Cuisine type"
                            placeholder="Select cuisine type"
                            value={categories}
                            onChangeText={setCategories}
                            error={errors.categories}
                        />
                        <Input
                            label="Phone number"
                            placeholder="(555) 123-4567"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            error={errors.phoneNumber}
                        />
                        <Input
                            label="Description"
                            placeholder="Short description..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            error={errors.description}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <Button
                    title="Cancel"
                    onPress={() => router.back()}
                    variant="secondary"
                    style={{ flex: 1 }}
                />
                <Button
                    title="Save"
                    onPress={handleSave}
                    loading={loading || uploading}
                    style={[styles.nextButton, { flex: 2 }]}
                />
            </View>
        </View>
    );
}

