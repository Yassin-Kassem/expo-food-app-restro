import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight } from '../constants/theme';

export default function ProgressIndicator({ currentStep, totalSteps }) {
    const { theme } = useTheme();
    const progress = useRef(new Animated.Value(0)).current;

    const percentage = Math.round((currentStep / totalSteps) * 100);

    useEffect(() => {
        Animated.timing(progress, {
            toValue: percentage,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [percentage]);

    const translateX = progress.interpolate({
        inputRange: [0, 100],
        outputRange: [-wp('100%'), 0],
    });

    const styles = StyleSheet.create({
        container: {
            marginBottom: spacing.xl,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.sm,
        },
        stepText: {
            fontSize: fontSize.caption,
            color: theme.textSecondary,
            fontWeight: fontWeight.medium,
        },
        percentageText: {
            fontSize: fontSize.caption,
            color: theme.textSecondary,
            fontWeight: fontWeight.medium,
        },
        track: {
            height: 8,
            backgroundColor: theme.surfaceAlt,
            borderRadius: radius.pill,
            overflow: 'hidden',
        },
        bar: {
            height: '100%',
            width: '100%',
            backgroundColor: theme.primary,
            borderRadius: radius.pill,
        }
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.stepText}>Step {currentStep} of {totalSteps} </Text>
                <Text style={styles.percentageText}>{percentage}%</Text>
            </View>
            <View style={styles.track}>
                <Animated.View style={[styles.bar, { transform: [{ translateX }] }]} />
            </View>
        </View>
    );
}
