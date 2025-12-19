import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../contexts/ThemeContext';
import { radius, fontSize, fontWeight, shadows } from '../constants/theme';

export default function Button({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    style = {},
    icon = null,
}) {
    const { theme } = useTheme();

    const baseStyle = {
        height: hp('6.5%'),
        borderRadius: radius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp('6%'),
        opacity: disabled ? 0.5 : 1,
        flexDirection: 'row',
        gap: wp('2%'),
    };

    const variantStyles = {
        primary: {
            backgroundColor: theme.primary,
            ...shadows.medium,
        },
        secondary: {
            backgroundColor: theme.surface,
            borderWidth: 1.5,
            borderColor: theme.border,
        },
        outline: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: theme.primary,
        },
        ghost: {
            backgroundColor: `${theme.primary}15`,
        },
        danger: {
            backgroundColor: theme.error,
            ...shadows.medium,
        },
        success: {
            backgroundColor: theme.success,
            ...shadows.medium,
        },
    };

    const textStyles = {
        primary: {
            color: '#FFFFFF',
            fontSize: fontSize.body,
            fontWeight: fontWeight.bold,
            letterSpacing: 0.3,
        },
        secondary: {
            color: theme.textPrimary,
            fontSize: fontSize.body,
            fontWeight: fontWeight.semibold,
        },
        outline: {
            color: theme.primary,
            fontSize: fontSize.body,
            fontWeight: fontWeight.semibold,
        },
        ghost: {
            color: theme.primary,
            fontSize: fontSize.body,
            fontWeight: fontWeight.semibold,
        },
        danger: {
            color: '#FFFFFF',
            fontSize: fontSize.body,
            fontWeight: fontWeight.bold,
        },
        success: {
            color: '#FFFFFF',
            fontSize: fontSize.body,
            fontWeight: fontWeight.bold,
        },
    };

    const getLoaderColor = () => {
        if (variant === 'primary' || variant === 'danger' || variant === 'success') {
            return '#FFFFFF';
        }
        return theme.primary;
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[baseStyle, variantStyles[variant], style]}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={getLoaderColor()} />
            ) : (
                <>
                    {icon}
                    <Text style={textStyles[variant]}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}
