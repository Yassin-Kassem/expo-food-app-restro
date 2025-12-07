import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight } from '../constants/theme';

export default function Button({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    style = {}
}) {
    const { theme } = useTheme();

    const baseStyle = {
        height: hp('6.5%'), // ~52px
        borderRadius: radius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        opacity: disabled ? 0.5 : 1
    };

    const variantStyles = {
        primary: {
            backgroundColor: theme.primary
        },
        secondary: {
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.border
        }
    };

    const textStyles = {
        primary: {
            color: '#FFFFFF',
            fontSize: fontSize.body,
            fontWeight: fontWeight.semibold
        },
        secondary: {
            color: theme.textPrimary,
            fontSize: fontSize.body,
            fontWeight: fontWeight.semibold
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[baseStyle, variantStyles[variant], style]}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : theme.primary} />
            ) : (
                <Text style={textStyles[variant]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}
