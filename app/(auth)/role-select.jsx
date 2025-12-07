import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme';
import { createUserDocument } from '../../services/userService';
import { getCurrentUser } from '../../services/authService';

export default function RoleSelect() {
    const { theme } = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    const handleRoleSelection = async (role) => {
        setSelectedRole(role);
        setLoading(true);

        const user = getCurrentUser();
        if (!user) {
            setLoading(false);
            return;
        }

        const result = await createUserDocument(user.uid, role);
        if (!result.success) {
            setLoading(false);
        }
    };

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.background
        },
        scrollContent: {
            flexGrow: 1,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xxl,
            paddingBottom: spacing.xxl
        },
        header: {
            alignItems: 'center',
            marginBottom: hp('5%')
        },
        title: {
            fontSize: hp('3.5%'),
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
            marginBottom: spacing.sm,
            textAlign: 'center',
            letterSpacing: -0.5
        },
        subtitle: {
            fontSize: fontSize.body,
            color: theme.textSecondary,
            textAlign: 'center',
            lineHeight: fontSize.body * 1.5
        },
        cardContainer: {
            gap: spacing.lg
        },
        roleCard: {
            backgroundColor: theme.surface,
            borderRadius: radius.xl,
            padding: spacing.xl,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: 'transparent',
            ...shadows.soft
        },
        roleCardSelected: {
            borderColor: theme.primary,
            backgroundColor: theme.primary + '08'
        },
        iconContainer: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.surfaceAlt,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.lg
        },
        roleTitle: {
            fontSize: fontSize.title,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
            marginBottom: spacing.xs,
            textAlign: 'center'
        },
        roleDescription: {
            fontSize: fontSize.body,
            color: theme.textSecondary,
            textAlign: 'center',
            lineHeight: 22
        },
        checkIcon: {
            position: 'absolute',
            top: spacing.md,
            right: spacing.md
        }
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <Text style={styles.title}>Welcome!</Text>
                    <Text style={styles.subtitle}>Choose how you want to use the app to get started.</Text>
                </View>

                <View style={styles.cardContainer}>
                    <TouchableOpacity
                        onPress={() => handleRoleSelection('user')}
                        disabled={loading}
                        activeOpacity={0.9}
                    >
                        <View style={[styles.roleCard, selectedRole === 'user' && styles.roleCardSelected]}>
                            {selectedRole === 'user' && (
                                <View style={styles.checkIcon}>
                                    <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                                </View>
                            )}
                            <View style={[styles.iconContainer, selectedRole === 'user' && { backgroundColor: theme.primary + '20' }]}>
                                <Ionicons name="fast-food" size={40} color={selectedRole === 'user' ? theme.primary : theme.textPrimary} />
                            </View>
                            <Text style={styles.roleTitle}>I want to order food</Text>
                            <Text style={styles.roleDescription}>
                                Find nearby restaurants and get food delivered to your door.
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleRoleSelection('restaurant')}
                        disabled={loading}
                        activeOpacity={0.9}
                    >
                        <View style={[styles.roleCard, selectedRole === 'restaurant' && styles.roleCardSelected]}>
                            {selectedRole === 'restaurant' && (
                                <View style={styles.checkIcon}>
                                    <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                                </View>
                            )}
                            <View style={[styles.iconContainer, selectedRole === 'restaurant' && { backgroundColor: theme.primary + '20' }]}>
                                <Ionicons name="storefront" size={40} color={selectedRole === 'restaurant' ? theme.primary : theme.textPrimary} />
                            </View>
                            <Text style={styles.roleTitle}>I want to sell food</Text>
                            <Text style={styles.roleDescription}>
                                List your restaurant, manage your menu, and receive orders.
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
