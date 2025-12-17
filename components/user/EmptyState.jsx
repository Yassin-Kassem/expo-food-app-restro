import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../../constants/theme';

const EmptyState = ({
    icon = 'restaurant-outline',
    title = 'Nothing here',
    message = 'Check back later',
    actionText,
    onActionPress,
    variant = 'default', // 'default', 'search', 'cart', 'orders'
    style,
}) => {
    const { theme } = useTheme();

    const variantColors = {
        default: theme.primary,
        search: '#6C5CE7',
        cart: '#00B894',
        orders: '#0984E3',
    };

    const color = variantColors[variant] || theme.primary;

    return (
        <View style={[styles.container, style]}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={hp('4%')} color={color} />
            </View>

            {/* Text */}
            <Text style={[styles.title, { color: theme.textPrimary }]}>
                {title}
            </Text>
            <Text style={[styles.message, { color: theme.textMuted }]}>
                {message}
            </Text>

            {/* Action */}
            {actionText && onActionPress && (
                <TouchableOpacity
                    onPress={onActionPress}
                    style={[styles.actionButton, { backgroundColor: color }]}
                    activeOpacity={0.8}
                >
                    <Text style={styles.actionText}>{actionText}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    iconContainer: {
        width: hp('8%'),
        height: hp('8%'),
        borderRadius: hp('4%'),
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    message: {
        fontSize: fontSize.body,
        textAlign: 'center',
    },
    actionButton: {
        marginTop: spacing.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
    },
    actionText: {
        color: '#fff',
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
    },
});

export default EmptyState;
