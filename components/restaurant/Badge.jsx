import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight } from '../../constants/theme';

const getStatusColor = (status, theme) => {
    switch (status.toLowerCase()) {
        case 'pending':
        case 'new':
            return { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D' }; // Amber
        case 'processing':
        case 'cooking':
            return { bg: '#DBEAFE', text: '#2563EB', border: '#93C5FD' }; // Blue
        case 'ready':
        case 'completed':
            return { bg: '#D1FAE5', text: '#059669', border: '#6EE7B7' }; // Emerald
        case 'cancelled':
            return { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' }; // Red
        default:
            return { bg: theme.surfaceAlt, text: theme.textSecondary, border: theme.border };
    }
};

export default function Badge({ status, containerStyle }) {
    const { theme } = useTheme();
    const colors = getStatusColor(status, theme);

    return (
        <View style={[{
            backgroundColor: colors.bg,
            paddingHorizontal: spacing.sm,
            paddingVertical: 2,
            borderRadius: radius.full, // Pill shape is friendlier
            // borderWidth: 1, // Removed for calmer look
            // borderColor: colors.border,
            alignSelf: 'flex-start',
        }, containerStyle]}>
            <Text style={{
                color: colors.text,
                fontSize: 11, // Fixed small size
                fontWeight: fontWeight.semibold,
                // textTransform: 'uppercase', // Removed for calmer look
            }}>
                {status}
            </Text>
        </View>
    );
}
