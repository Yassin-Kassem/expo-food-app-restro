import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Input from '../../../components/Input';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../../../services/storageService';
import { addMenuItem } from '../../../services/menuService';
import { useAuth } from '../../../hooks/useAuth';
import { useRestaurant } from '../../../hooks/useRestaurant';

export default function AddMenuItemScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { user } = useAuth();
    const { restaurant } = useRestaurant(user?.uid);

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [available, setAvailable] = useState(true);
    const [image, setImage] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            setError('Permission to access media library is required.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8
        });

        if (!result.canceled && result.assets?.length) {
            setImage(result.assets[0]);
        }
    };

    const handleSave = async () => {
        if (!name.trim() || !price.trim() || !category.trim()) {
            setError('Name, price, and category are required.');
            return;
        }
        if (!restaurant?.id) {
            setError('Restaurant not found for this user.');
            return;
        }

        setSaving(true);
        setError('');
        let isMounted = true;

        try {
            let imageUrl = null;

            if (image?.uri) {
                const upload = await uploadImage(image.uri, { folder: `restaurants/${restaurant.id}/menu` });
                if (!isMounted) return;

                if (!upload.success) {
                    // Only show error for non-retryable errors
                    if (!upload.retryable) {
                        setError(upload.error);
                    }
                    setSaving(false);
                    return;
                }
                imageUrl = upload.downloadURL;
            }

            const numericPrice = parseFloat(price);
            if (isNaN(numericPrice) || numericPrice <= 0) {
                setError('Please enter a valid price.');
                setSaving(false);
                return;
            }

            const result = await addMenuItem(restaurant.id, {
                name: name.trim(),
                price: numericPrice,
                description: description.trim(),
                category: category.trim(),
                available,
                imageUrl
            });

            if (!isMounted) return;

            if (result.success) {
                router.back();
            } else {
                // Show validation errors or non-retryable errors
                if (result.errors) {
                    const firstError = Object.values(result.errors)[0];
                    setError(firstError);
                } else if (!result.retryable) {
                    setError(result.error || 'Failed to save menu item.');
                } else {
                    // Retryable error - show generic message
                    setError('Failed to save. Please try again.');
                }
            }
        } catch (error) {
            if (!isMounted) return;
            setError('An unexpected error occurred. Please try again.');
        } finally {
            if (isMounted) {
                setSaving(false);
            }
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <StatusBar style="dark" />
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Add Menu Item </Text>
                <TouchableOpacity onPress={handleSave} disabled={saving}>
                    {saving ? (
                        <ActivityIndicator color={theme.primary} />
                    ) : (
                        <Text style={[styles.saveText, { color: theme.primary }]}>Save </Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {error ? <Text style={{ color: theme.error, marginBottom: spacing.sm }}>{error}</Text> : null}

                {/* Image Placeholder */}
                <TouchableOpacity
                    style={[styles.imageUpload, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
                    onPress={pickImage}
                    disabled={saving}
                >
                    {image?.uri ? (
                        <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                    ) : (
                        <>
                            <View style={[styles.imageIconCircle, { backgroundColor: theme.surface }]}>
                                <Ionicons name="camera-outline" size={30} color={theme.textSecondary} />
                            </View>
                            <Text style={[styles.imageText, { color: theme.textSecondary }]}>Add Photo </Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Form Fields */}
                <View style={[styles.formSection, { backgroundColor: theme.surface }]}>
                    <Input
                        label="Item Name "
                        placeholder="e.g. Classic Burger "
                        value={name}
                        onChangeText={setName}
                    />

                    <Input
                        label="Price (£) "
                        placeholder="0.00 "
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="decimal-pad"
                    />

                    <Input
                        label="Category "
                        placeholder="e.g. Burgers, Drinks "
                        value={category}
                        onChangeText={setCategory}
                    />

                    <Input
                        label="Description "
                        placeholder="Describe ingredients, taste, etc. "
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {/* Options / Toggles */}
                <View style={[styles.toggleRow, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                    <Text style={[styles.toggleLabel, { color: theme.textPrimary }]}>Available for Order </Text>
                    <Switch
                        value={available}
                        onValueChange={setAvailable}
                        trackColor={{ false: theme.border, true: theme.success }}
                        thumbColor={'#fff'}
                    />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    saveText: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    scrollContent: {
        padding: spacing.md,
        zIndex: 1,
    },
    imageUpload: {
        height: 180,
        borderRadius: radius.md,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    imageIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    imageText: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        borderRadius: radius.md,
    },
    formSection: {
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: radius.md,
    },
    toggleLabel: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
    },
});
