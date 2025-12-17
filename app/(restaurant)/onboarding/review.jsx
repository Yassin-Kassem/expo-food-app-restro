import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import Button from '../../../components/Button';
import ProgressIndicator from '../../../components/ProgressIndicator';
import CustomModal from '../../../components/CustomModal';
import { getRestaurantByOwner, publishRestaurant } from '../../../services/restaurantService';
import { getMenuItems } from '../../../services/menuService';
import { getCurrentUser } from '../../../services/authService';

export default function Review() {
    const { theme } = useTheme();
    const router = useRouter();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const [firstItem, setFirstItem] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const user = getCurrentUser();
        const result = await getRestaurantByOwner(user.uid);
        if (result.success) {
            setRestaurant(result.data);
            const menuResult = await getMenuItems(result.data.id);
            if (menuResult.success && menuResult.data.length > 0) {
                setFirstItem(menuResult.data[0]);
            }
        }
    };

    const handlePublish = async () => {
        setLoading(true);
        const result = await publishRestaurant(restaurant.id, restaurant.ownerId);
        if (result.success) {
            setSuccessModalVisible(true);
        }
        setLoading(false);
    };

    const handleSuccessClose = () => {
        setSuccessModalVisible(false);
        router.replace('/dashboard');
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
        scrollContent: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: hp('15%'),
        },
        card: {
            backgroundColor: theme.surface,
            borderRadius: radius.xl,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
        },
        cardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.md,
            gap: spacing.sm,
        },
        iconContainer: {
            width: 36,
            height: 36,
            borderRadius: radius.md,
            backgroundColor: '#FFF0ED',
            justifyContent: 'center',
            alignItems: 'center',
        },
        headerTitle: {
            fontSize: fontSize.caption,
            color: theme.textSecondary,
            fontWeight: fontWeight.medium,
        },
        itemContent: {
            gap: spacing.xs,
        },
        itemRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        itemName: {
            fontSize: fontSize.subtitle,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
        },
        itemPrice: {
            fontSize: fontSize.body,
            fontWeight: fontWeight.bold,
            color: theme.primary,
        },
        itemDescription: {
            fontSize: fontSize.caption,
            color: theme.textSecondary,
            lineHeight: 20,
            marginBottom: spacing.xs,
        },
        pill: {
            backgroundColor: theme.surfaceAlt,
            alignSelf: 'flex-start',
            paddingHorizontal: spacing.md,
            paddingVertical: 4,
            borderRadius: radius.sm,
            marginTop: spacing.xs,
        },
        pillText: {
            fontSize: fontSize.caption * 0.9,
            color: theme.textSecondary,
            fontWeight: fontWeight.medium,
        },
        infoCard: {
            backgroundColor: '#FFF0ED',
            borderColor: '#FFE0D6',
        },
        infoHeader: {
            marginBottom: spacing.sm,
        },
        infoTitle: {
            fontSize: fontSize.body,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
        },
        infoText: {
            fontSize: fontSize.caption,
            color: theme.textSecondary,
            lineHeight: 20,
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
                <View style={{ marginTop: spacing.md }}>
                    <Text style={styles.title}>Ready to launch? </Text>
                    <Text style={styles.subtitle}>Review your details before going live. </Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Restaurant Preview Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="storefront-outline" size={20} color={theme.primary} />
                        </View>
                        <Text style={styles.headerTitle}>Restaurant Preview </Text>
                    </View>

                    <View style={styles.itemContent}>
                        <Text style={styles.itemName}>{restaurant.name} </Text>
                        <Text style={styles.infoText}>{restaurant.address} </Text>
                        <Text style={[styles.itemDescription, { marginTop: spacing.xs }]} numberOfLines={2}>
                            {restaurant.description}
                        </Text>

                        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs }}>
                            {restaurant.categories?.map((cat, idx) => (
                                <View key={idx} style={styles.pill}>
                                    <Text style={styles.pillText}>{cat} </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* First Menu Item Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="restaurant-outline" size={20} color={theme.primary} />
                        </View>
                        <Text style={styles.headerTitle}>First Menu Item </Text>
                    </View>

                    <View style={styles.itemContent}>
                        <View style={styles.itemRow}>
                            <Text style={styles.itemName}>{firstItem?.name || 'Menu Item '} </Text>
                            <Text style={styles.itemPrice}>${firstItem?.price || '0.00 '} </Text>
                        </View>
                        <Text style={styles.itemDescription} numberOfLines={2}>
                            {firstItem?.description || 'No description provided '}
                        </Text>
                        <View style={styles.pill}>
                            <Text style={styles.pillText}>Appetizers </Text>
                        </View>
                    </View>
                </View>

                {/* Ready to go live Card */}
                <View style={[styles.card, styles.infoCard]}>
                    <View style={styles.infoHeader}>
                        <Text style={styles.infoTitle}>🎉 Ready to go live? </Text>
                    </View>
                    <Text style={styles.infoText}>
                        Your restaurant will be visible to customers immediately. You can edit all details anytime from your dashboard.
                    </Text>
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
                    title="Publish Restaurant "
                    onPress={handlePublish}
                    loading={loading}
                    style={[styles.publishButton, { flex: 2 }]}
                />
            </View>

            <CustomModal
                visible={successModalVisible}
                title="Success"
                message="Your restaurant is now live!"
                type="success"
                primaryButtonText="OK"
                onPrimaryPress={handleSuccessClose}
                onClose={handleSuccessClose}
            />
        </View>
    );
}
