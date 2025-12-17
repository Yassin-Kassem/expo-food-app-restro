import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight, shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function StatCard({ label, value, icon, trend, trendValue }) {
    const { theme } = useTheme();

    return (
        <View style={[
            styles.card,
            {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                // ...shadows.soft // Removed shadow for flatter, cleaner look
            }
        ]}>
            <View style={styles.content}>
                <Text style={[styles.value, { color: theme.textPrimary }]}>{value} </Text>
                {trend && (
                    <View style={[
                        styles.trendBadget,
                        { backgroundColor: trend === 'up' ? '#ECFDF5' : '#FEF2F2' } // More subtle
                    ]}>
                        <Ionicons
                            name={trend === 'up' ? 'arrow-up' : 'arrow-down'}
                            size={12}
                            color={trend === 'up' ? '#059669' : '#DC2626'}
                        />
                        <Text style={[
                            styles.trendText,
                            { color: trend === 'up' ? '#059669' : '#DC2626' }
                        ]}>
                            {trendValue}
                        </Text>
                    </View>
                )}
            </View>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{label} </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: radius.md,
        padding: spacing.md,
        borderWidth: 1,
        marginHorizontal: spacing.xs,
        minWidth: 140,
    },
    label: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.medium,
        marginTop: spacing.xs,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    value: {
        fontSize: fontSize.title,
        fontWeight: fontWeight.bold,
        letterSpacing: -0.5,
    },
    trendBadget: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: radius.sm,
    },
    trendText: {
        fontSize: 10,
        fontWeight: fontWeight.bold,
        marginLeft: 2,
    },
});
