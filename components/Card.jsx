import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, radius, getShadow } from '../constants/theme';

export default function Card({ children, style = {} }) {
    const { theme } = useTheme();

    const cardStyle = {
        backgroundColor: theme.card,
        borderRadius: radius.md,
        padding: spacing.md,
        ...getShadow(theme, 'sm')
    };

    return (
        <View style={[cardStyle, style]}>
            {children}
        </View>
    );
}
