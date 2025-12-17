import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export default function Button({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
    style = {}
}) {
    const baseStyle = {
        height: hp('6.5%'),
        borderRadius: wp('3%'),
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp('6%'),
        opacity: disabled ? 0.5 : 1
    };

    const variantStyles = {
        primary: {
            backgroundColor: '#FF6B4A'
        },
        secondary: {
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E7EB'
        }
    };

    const textStyles = {
        primary: {
            color: '#FFFFFF',
            fontSize: hp('1.9%'),
            fontWeight: '700',
            letterSpacing: 0.3
        },
        secondary: {
            color: '#1A1D1E',
            fontSize: hp('1.9%'),
            fontWeight: '600'
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[baseStyle, variantStyles[variant], style]}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#FF6B4A'} />
            ) : (
                <Text style={textStyles[variant]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}
