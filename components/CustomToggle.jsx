import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { shadows } from '../constants/theme';

export default function CustomToggle({ value, onValueChange }) {
    const { theme } = useTheme();

    // Animated value for thumb X position
    const translateX = useRef(new Animated.Value(value ? 20 : 0)).current;

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: value ? 20 : 0,
            duration: 180,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [value]);

    const trackColor = value ? theme.primary : theme.surfaceAlt;
    const trackBorder = value ? `${theme.primary}55` : theme.border;
    const thumbColor = theme.surface;
    const iconColor = value ? theme.primary : theme.textMuted;
    const thumbBorder = value ? `${theme.primary}33` : `${theme.textMuted}33`;

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onValueChange}
            style={[
                styles.track,
                {
                    backgroundColor: trackColor,
                    borderColor: trackBorder,
                },
            ]}
        >
            <Animated.View
                style={[
                    styles.thumb,
                    {
                        backgroundColor: thumbColor,
                        borderColor: thumbBorder,
                        transform: [{ translateX }],
                    },
                ]}
            >
                <Ionicons
                    name={value ? 'checkmark' : 'close'}
                    size={16}
                    color={iconColor}
                />
            </Animated.View>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    track: {
        width: 48,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 3,
        ...shadows.soft,
    },
    thumb: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        position: 'absolute',
        left: 3,
    },
});
