import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight } from '../constants/theme';

export default function ProgressIndicator({ currentStep, totalSteps }) {
    const { theme } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing.xs,
            marginBottom: spacing.xl,
        },
        segment: {
            flex: 1,
            height: 6,
            borderRadius: radius.pill,
            backgroundColor: theme.border,
        },
        segmentActive: {
            backgroundColor: theme.primary,
        },
        segmentCompleted: {
            backgroundColor: theme.success,
        },
    });

    return (
        <View style={styles.container}>
            {Array.from({ length: totalSteps }, (_, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                    <View
                        key={stepNumber}
                        style={[
                            styles.segment,
                            isCompleted && styles.segmentCompleted,
                            isActive && styles.segmentActive,
                        ]}
                    />
                );
            })}
        </View>
    );
}
