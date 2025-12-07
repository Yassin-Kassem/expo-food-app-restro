import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Animated, Platform } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, radius, fontWeight } from '../constants/theme';

export default function Input({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    error,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    multiline = false,
    numberOfLines = 1,
    style
}) {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const styles = StyleSheet.create({
        container: {
            marginBottom: spacing.lg,
            ...style
        },
        label: {
            fontSize: fontSize.caption,
            fontWeight: fontWeight.semibold,
            color: theme.textSecondary,
            marginBottom: spacing.xs,
            textTransform: 'uppercase',
            letterSpacing: 0.5
        },
        inputContainer: {
            backgroundColor: isFocused ? theme.surface : theme.surfaceAlt,
            borderRadius: radius.lg,
            paddingHorizontal: spacing.md,
            paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
            borderWidth: 2,
            borderColor: isFocused ? theme.primary : 'transparent',
            // Add shadow/halo when focused
            shadowColor: isFocused ? theme.primary : '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isFocused ? 0.2 : 0,
            shadowRadius: 8,
            elevation: isFocused ? 4 : 0,
        },
        input: {
            fontSize: fontSize.body,
            color: theme.textPrimary,
            fontWeight: fontWeight.medium,
            textAlignVertical: multiline ? 'top' : 'center',
            minHeight: multiline ? 100 : undefined
        },
        errorText: {
            fontSize: fontSize.caption,
            color: theme.error,
            marginTop: spacing.xs,
        }
    });

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.textMuted}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}
