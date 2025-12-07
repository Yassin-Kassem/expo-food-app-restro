import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Image, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import ProgressIndicator from '../../../components/ProgressIndicator';
import { createRestaurant, getRestaurantByOwner } from '../../../services/restaurantService';
import { getCurrentUser } from '../../../services/authService';

export default function BusinessInfo() {
    const { theme } = useTheme();
    const router = useRouter();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState('');
    const [logoUri, setLogoUri] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'Restaurant name is required';
        if (!description.trim()) newErrors.description = 'Description is required';
        if (!categories.trim()) newErrors.categories = 'At least one category is required';
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

    const handleNext = async () => {
        if (!validate()) return;
        setLoading(true);
        const user = getCurrentUser();
        const existingRestaurant = await getRestaurantByOwner(user.uid);

        let restaurantId;
        if (existingRestaurant.success) {
            restaurantId = existingRestaurant.data.id;
        } else {
            const result = await createRestaurant(user.uid, {
                name: name.trim(),
                description: description.trim(),
                categories: categories.split(',').map(c => c.trim()),
                logoUri: logoUri || ''
            });
            if (!result.success) {
                setErrors({ general: result.error });
                setLoading(false);
                return;
            }
            restaurantId = result.restaurantId;
        }
        setLoading(false);
        router.push('/onboarding/location-setup');
    };

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.surface, // Pure white background
            paddingTop: spacing.xl,
        },
        header: {
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.lg,
            backgroundColor: theme.surface,
            zIndex: 10,
            paddingTop: spacing.xxl,
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
            borderStyle: 'solid',
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
                <ProgressIndicator currentStep={1} totalSteps={5} />
                <View style={{ marginTop: spacing.md }}>
                    <Text style={styles.title}>Tell us about your business</Text>
                    <Text style={styles.subtitle}>This information creates your storefront on the app.</Text>
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
                            label="Restaurant Name"
                            placeholder="e.g. Tasty Bites"
                            value={name}
                            onChangeText={setName}
                            error={errors.name}
                            autoCapitalize="words"
                        />
                        <Input
                            label="Description"
                            placeholder="Short description of your cuisine..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            error={errors.description}
                        />
                        <Input
                            label="Categories (comma separated)"
                            placeholder="Burger, Pizza, Fast Food..."
                            value={categories}
                            onChangeText={setCategories}
                            error={errors.categories}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <Button
                    title="Continue"
                    onPress={handleNext}
                    loading={loading}
                    style={styles.nextButton}
                />
            </View>
        </View>
    );
}
