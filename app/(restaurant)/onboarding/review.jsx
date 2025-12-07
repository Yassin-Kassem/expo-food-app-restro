import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import Button from '../../../components/Button';
import ProgressIndicator from '../../../components/ProgressIndicator';
import { getRestaurantByOwner, publishRestaurant } from '../../../services/restaurantService';
import { getCurrentUser } from '../../../services/authService';

export default function Review() {
    const { theme } = useTheme();
    const router = useRouter();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const user = getCurrentUser();
        const result = await getRestaurantByOwner(user.uid);
        if (result.success) setRestaurant(result.data);
    };

    const handlePublish = async () => {
        setLoading(true);
        const result = await publishRestaurant(restaurant.id, restaurant.ownerId);
        if (result.success) {
            Alert.alert('Success', 'Your restaurant is now live!', [
                { text: 'OK', onPress: () => router.replace('/dashboard') }
            ]);
        }
        setLoading(false);
    };

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.surface,
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
        scrollContent: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: hp('15%'),
        },
        receiptContainer: {
            backgroundColor: theme.surface,
            borderRadius: radius.md,
            overflow: 'hidden',
            marginBottom: spacing.xxl,
            borderWidth: 1,
            borderColor: theme.surfaceAlt,
            // Card visual
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 24,
            elevation: 12,
        },
        receiptHeader: {
            backgroundColor: '#FF6B4A', // Brand color
            padding: spacing.xl,
            alignItems: 'center',
            justifyContent: 'center',
        },
        receiptTitle: {
            fontSize: fontSize.subtitle,
            fontWeight: fontWeight.bold,
            color: '#FFFFFF',
            marginTop: spacing.md,
        },
        receiptBody: {
            padding: spacing.xl,
            backgroundColor: theme.surface,
        },
        section: {
            marginBottom: spacing.lg,
        },
        sectionLabel: {
            fontSize: fontSize.caption,
            color: theme.textMuted,
            textTransform: 'uppercase',
            fontWeight: fontWeight.bold,
            letterSpacing: 1,
            marginBottom: 4,
        },
        sectionValue: {
            fontSize: fontSize.body,
            color: theme.textPrimary,
            fontWeight: fontWeight.medium,
            lineHeight: 24,
        },
        divider: {
            height: 1,
            backgroundColor: theme.surfaceAlt,
            marginVertical: spacing.lg,
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
        publishButton: {
            backgroundColor: theme.success,
            shadowColor: theme.success,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
        }
    });

    if (!restaurant) return null;

    return (
        <View style={styles.safeArea}>
            <View style={styles.header}>
                <ProgressIndicator currentStep={5} totalSteps={5} />
                <View style={{ marginTop: spacing.md }}>
                    <Text style={styles.title}>Ready to launch?</Text>
                    <Text style={styles.subtitle}>Review your details before going live.</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.receiptContainer}>
                    <View style={styles.receiptHeader}>
                        <View style={{
                            width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)',
                            justifyContent: 'center', alignItems: 'center'
                        }}>
                            <Ionicons name="storefront-outline" size={32} color="#FFFFFF" />
                        </View>
                        <Text style={styles.receiptTitle}>Restaurant Preview</Text>
                    </View>

                    <View style={styles.receiptBody}>
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Name</Text>
                            <Text style={styles.sectionValue}>{restaurant.name}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Description</Text>
                            <Text style={styles.sectionValue}>{restaurant.description}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Address</Text>
                            <Text style={styles.sectionValue}>{restaurant.address}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Categories</Text>
                            <Text style={styles.sectionValue}>{restaurant.categories?.join(', ')}</Text>
                        </View>
                    </View>

                    {/* Jagged edge visual illusion could go here if easy, but sticking to clean card for now */}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title="Publish Restaurant"
                    onPress={handlePublish}
                    loading={loading}
                    style={styles.publishButton}
                />
            </View>
        </View>
    );
}
