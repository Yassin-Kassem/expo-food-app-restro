import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../constants/theme';

export default function CustomModal({
    visible,
    title,
    message,
    type = 'info', // 'success', 'error', 'info', 'warning'
    onPrimaryPress,
    primaryButtonText = 'OK',
    onSecondaryPress,
    secondaryButtonText,
    onClose
}) {
    const { theme } = useTheme();
    const scaleValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(scaleValue, {
                toValue: 1,
                useNativeDriver: true,
                damping: 15,
                stiffness: 150
            }).start();
        } else {
            scaleValue.setValue(0);
        }
    }, [visible]);

    if (!visible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return { name: 'checkmark-circle', color: theme.success };
            case 'error': return { name: 'alert-circle', color: theme.error };
            case 'warning': return { name: 'warning', color: theme.warning };
            default: return { name: 'information-circle', color: theme.info };
        }
    };

    const iconData = getIcon();

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.xl,
        },
        modalContainer: {
            width: '100%',
            backgroundColor: theme.surface,
            borderRadius: radius.xl,
            padding: spacing.xl,
            alignItems: 'center',
            ...shadows.floating,
        },
        iconContainer: {
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: iconData.color + '20', // 20% opacity
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.lg,
        },
        title: {
            fontSize: fontSize.subtitle,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
            textAlign: 'center',
            marginBottom: spacing.sm,
            letterSpacing: -0.5,
        },
        message: {
            fontSize: fontSize.body,
            color: theme.textSecondary,
            textAlign: 'center',
            marginBottom: spacing.xl,
            lineHeight: 22,
        },
        buttonRow: {
            flexDirection: 'row',
            width: '100%',
            gap: spacing.md,
        },
        button: {
            flex: 1,
            height: 50,
            borderRadius: radius.lg,
            justifyContent: 'center',
            alignItems: 'center',
        },
        primaryButton: {
            backgroundColor: theme.primary,
        },
        secondaryButton: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.border,
        },
        primaryButtonText: {
            color: '#FFFFFF',
            fontWeight: fontWeight.semibold,
            fontSize: fontSize.body,
        },
        secondaryButtonText: {
            color: theme.textPrimary,
            fontWeight: fontWeight.medium,
            fontSize: fontSize.body,
        }
    });

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleValue }] }]}>
                    <View style={styles.iconContainer}>
                        <Ionicons name={iconData.name} size={32} color={iconData.color} />
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonRow}>
                        {secondaryButtonText && (
                            <TouchableOpacity
                                style={[styles.button, styles.secondaryButton]}
                                onPress={onSecondaryPress || onClose}
                            >
                                <Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton]}
                            onPress={onPrimaryPress || onClose}
                        >
                            <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}
