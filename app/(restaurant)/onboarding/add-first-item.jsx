import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import ProgressIndicator from '../../../components/ProgressIndicator';
import { getRestaurantByOwner } from '../../../services/restaurantService';
import { addMenuItem, getMenuItems, updateMenuItem } from '../../../services/menuService';
import { uploadImage } from '../../../services/storageService';
import { getCurrentUser } from '../../../services/authService';

export default function AddFirstItem() {
    const { theme } = useTheme();
    const router = useRouter();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [loading, setLoading] = useState(false);
    const [existingItemId, setExistingItemId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
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
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });
        if (!result.canceled) setImageUri(result.assets[0].uri);
    };

    const handleNext = async () => {
        if (!name || !price) {
            setError('Name and price are required.');
            return;
        }
        setLoading(true);
        setError('');
        
        try {
            const user = getCurrentUser();
            const restaurant = await getRestaurantByOwner(user.uid);
            
            if (!restaurant.success) {
                setError('Restaurant not found. Please try again.');
                setLoading(false);
                return;
            }

            let imageUrl = imageUri;

            // Upload image to Firebase Storage if it's a local file
            if (imageUri && !imageUri.startsWith('http://') && !imageUri.startsWith('https://')) {
                const upload = await uploadImage(imageUri, { folder: `restaurants/${restaurant.data.id}/menu` });
                if (!upload.success) {
                    setError(upload.error || 'Failed to upload image. Please try again.');
                    setLoading(false);
                    return;
                }
                imageUrl = upload.downloadURL;
            }

            const numericPrice = parseFloat(price);
            if (isNaN(numericPrice) || numericPrice <= 0) {
                setError('Please enter a valid price.');
                setLoading(false);
                return;
            }

            const itemData = {
                name: name.trim(),
                description: description.trim(),
                price: numericPrice,
                imageUrl,
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
                setError(result.error || 'Failed to save menu item. Please try again.');
                setLoading(false);
                return;
            }

            router.push('/onboarding/review');
        } catch (error) {
            console.error('Error saving menu item:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.surface,
        },
        header: {
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.lg,
            backgroundColor: theme.surface,
            zIndex: 10,
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
            lineHeight: fontSize.body * 1.5,
        },
        previewSection: {
            backgroundColor: theme.surfaceAlt,
            padding: spacing.lg,
            borderRadius: radius.xl,
            marginBottom: spacing.xl,
        },
        previewLabel: {
            fontSize: fontSize.caption,
            fontWeight: fontWeight.bold,
            color: theme.textMuted,
            marginBottom: spacing.md,
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        menuCard: {
            backgroundColor: theme.surface,
            borderRadius: radius.lg,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
        },
        cardImage: {
            width: '100%',
            height: 160,
            backgroundColor: '#E5E7EB',
            justifyContent: 'center',
            alignItems: 'center',
        },
        cardContent: {
            padding: spacing.md,
        },
        cardTitle: {
            fontSize: fontSize.subtitle,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
            marginBottom: 4,
        },
        cardDesc: {
            fontSize: fontSize.caption,
            color: theme.textSecondary,
            marginBottom: spacing.sm,
            lineHeight: 18,
        },
        cardPrice: {
            fontSize: fontSize.body,
            fontWeight: fontWeight.bold,
            color: theme.primary,
        },
        uploadButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.surface,
            padding: spacing.md,
            borderRadius: radius.lg,
            borderWidth: 1.5,
            borderColor: theme.border,
            borderStyle: 'dashed',
            marginBottom: spacing.lg,
            height: 60,
        },
        uploadText: {
            marginLeft: spacing.sm,
            color: theme.textPrimary,
            fontWeight: fontWeight.medium,
        },
        scrollContent: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: hp('15%'),
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
                <View style={{ marginTop: spacing.md }}>
                    <Text style={styles.title}>Add your first item </Text>
                    <Text style={styles.subtitle}>Give customers a taste of what's to come. </Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {error ? (
                    <Text style={{ color: theme.error, marginBottom: spacing.sm }}>{error}</Text>
                ) : null}

                <View style={styles.previewSection}>
                    <Text style={styles.previewLabel}>Live Card Preview </Text>
                    <View style={styles.menuCard}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.cardImage} resizeMode="cover" />
                        ) : (
                            <View style={styles.cardImage}>
                                <Ionicons name="fast-food-outline" size={40} color={theme.textMuted} />
                            </View>
                        )}
                        <View style={styles.cardContent}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <View style={{ flex: 1, marginRight: spacing.sm }}>
                                    <Text style={styles.cardTitle}>{name || 'Item Name '} </Text>
                                    <Text style={styles.cardDesc} numberOfLines={2}>
                                        {description || 'Delicious description goes here... '}
                                    </Text>
                                </View>
                                <Text style={styles.cardPrice}>${price || '0.00 '}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <TouchableOpacity onPress={pickImage} style={styles.uploadButton} activeOpacity={0.7}>
                    <Ionicons name={imageUri ? "refresh" : "camera"} size={20} color={theme.primary} />
                    <Text style={styles.uploadText}>{imageUri ? 'Change Photo ' : 'Upload Food Photo '}</Text>
                </TouchableOpacity>

                <View style={{ gap: spacing.sm }}>
                    <Input
                        label="Item Name "
                        placeholder="e.g. Classic Cheeseburger "
                        value={name}
                        onChangeText={setName}
                    />
                    <Input
                        label="Price (EGP) "
                        placeholder="9.99 "
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="decimal-pad"
                    />
                    <Input
                        label="Description "
                        placeholder="Juicy beef patty with... "
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                    />
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title="Back "
                    onPress={() => router.back()}
                    variant="secondary"
                    style={{ flex: 1 }}
                />
                <Button
                    title="Next Step "
                    onPress={handleNext}
                    loading={loading}
                    style={[styles.nextButton, { flex: 2 }]}
                />
            </View>
        </View>
    );
}
