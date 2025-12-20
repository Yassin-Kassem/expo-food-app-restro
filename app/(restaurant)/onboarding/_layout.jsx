import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Stack, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import ProgressIndicator from '../../../components/ProgressIndicator';

export default function OnboardingLayout() {
    const { theme, isDarkMode } = useTheme();
    const segments = useSegments();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-20)).current;

    // Determine current step based on route
    const currentRoute = segments[segments.length - 1];

    let currentStep = 1;
    if (currentRoute === 'location-setup') currentStep = 2;
    if (currentRoute === 'hours') currentStep = 3;
    if (currentRoute === 'add-first-item') currentStep = 4;
    if (currentRoute === 'review') currentStep = 5;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        headerContainer: {
            paddingHorizontal: spacing.lg,
            paddingTop: hp('6%'),
            paddingBottom: spacing.md,
            backgroundColor: theme.background,
            zIndex: 100,
        },
        pillContainer: {
            alignItems: 'center',
            marginBottom: spacing.lg
        },
        pill: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: `${theme.primary}15`,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radius.pill,
            gap: spacing.xs
        },
        pillText: {
            color: theme.primary,
            fontWeight: fontWeight.semibold,
            fontSize: fontSize.caption
        },
        contentContainer: {
            flex: 1,
            backgroundColor: theme.background,
        }
    });

    return (
        <View style={styles.container}>
            <Animated.View 
                style={[
                    styles.headerContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}
            >
                <View style={styles.pillContainer}>
                    <View style={styles.pill}>
                        <Ionicons name="storefront" size={hp('1.6%')} color={theme.primary} />
                        <Text style={styles.pillText}>Restaurant Setup</Text>
                    </View>
                </View>
                <ProgressIndicator currentStep={currentStep} totalSteps={5} />
            </Animated.View>
            <View style={styles.contentContainer}>
                <Stack screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    contentStyle: { backgroundColor: theme.background }
                }} />
            </View>
        </View>
    );
}
