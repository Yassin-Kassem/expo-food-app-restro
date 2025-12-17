import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Stack, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';

import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../../../constants/theme';
import ProgressIndicator from '../../../components/ProgressIndicator';

export default function OnboardingLayout() {
    const { theme } = useTheme();
    const segments = useSegments();

    // Determine current step based on route
    // segments example: ['(restaurant)', 'onboarding', 'business-info']
    const currentRoute = segments[segments.length - 1];

    let currentStep = 1;
    if (currentRoute === 'location-setup') currentStep = 2;
    if (currentRoute === 'hours') currentStep = 3;
    if (currentRoute === 'add-first-item') currentStep = 4;
    if (currentRoute === 'review') currentStep = 5;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.surface,
            paddingTop: spacing.xl,
        },
        headerContainer: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.xxl,
            paddingBottom: spacing.md,
            backgroundColor: theme.surface,
            zIndex: 100,
        },
        pillContainer: {
            alignItems: 'center',
            marginBottom: spacing.lg
        },
        pill: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFF0ED',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radius.pill,
            gap: spacing.xs
        },
        pillText: {
            color: theme.primary,
            fontWeight: fontWeight.medium,
            fontSize: fontSize.caption
        }
    });

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <View style={styles.headerContainer}>
                <View style={styles.pillContainer}>
                    <View style={styles.pill}>
                        <Ionicons name="restaurant-outline" size={14} color={theme.primary} />
                        <Text style={styles.pillText}>Restaurant Setup </Text>
                    </View>
                </View>
                <ProgressIndicator currentStep={currentStep} totalSteps={5} />
            </View>
            <View style={{ flex: 1 }}>
                <Stack screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    contentStyle: { backgroundColor: theme.surface }
                }} />
            </View>
        </View>
    );
}
