import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../constants/theme';

export default function TimePickerModal({ visible, onClose, onSelect, initialTime }) {
    const { theme } = useTheme();
    const [selectedHour, setSelectedHour] = useState(() => {
        if (initialTime) {
            const [hour] = initialTime.split(':');
            return parseInt(hour, 10);
        }
        return 9;
    });
    const [selectedMinute, setSelectedMinute] = useState(() => {
        if (initialTime) {
            const [, minute] = initialTime.split(':');
            return parseInt(minute, 10);
        }
        return 0;
    });

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = [0, 15, 30, 45];
    const hourScrollRef = useRef(null);
    const minuteScrollRef = useRef(null);

    useEffect(() => {
        // Scroll to selected values when modal opens
        if (visible) {
            setTimeout(() => {
                const hourIndex = selectedHour;
                const minuteIndex = minutes.indexOf(selectedMinute);
                // Approximate item height: padding (spacing.md * 2) + text height (~20) + margin (spacing.xs * 2)
                const itemHeight = spacing.md * 2 + 20 + spacing.xs * 2;
                if (hourScrollRef.current && hourIndex >= 0) {
                    hourScrollRef.current.scrollTo({ y: hourIndex * itemHeight, animated: true });
                }
                if (minuteScrollRef.current && minuteIndex >= 0) {
                    minuteScrollRef.current.scrollTo({ y: minuteIndex * itemHeight, animated: true });
                }
            }, 100);
        }
    }, [visible]);

    const handleConfirm = () => {
        const hourStr = selectedHour.toString().padStart(2, '0');
        const minuteStr = selectedMinute.toString().padStart(2, '0');
        onSelect(`${hourStr}:${minuteStr}`);
        onClose();
    };

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.lg,
        },
        modalContainer: {
            width: '100%',
            maxWidth: 400,
            backgroundColor: theme.surface,
            borderRadius: radius.xl,
            padding: spacing.xl,
            ...shadows.floating,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.lg,
        },
        title: {
            fontSize: fontSize.subtitle,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
        },
        pickerContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginVertical: spacing.lg,
        },
        pickerColumn: {
            flex: 1,
            alignItems: 'center',
        },
        pickerLabel: {
            fontSize: fontSize.caption,
            fontWeight: fontWeight.medium,
            color: theme.textSecondary,
            marginBottom: spacing.sm,
            textTransform: 'uppercase',
        },
        scrollView: {
            maxHeight: 200,
        },
        timeOption: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.md,
            marginVertical: spacing.xs,
            minWidth: 80,
            alignItems: 'center',
        },
        timeOptionSelected: {
            backgroundColor: theme.primary,
        },
        timeOptionText: {
            fontSize: fontSize.body,
            fontWeight: fontWeight.medium,
            color: theme.textPrimary,
        },
        timeOptionTextSelected: {
            color: '#FFFFFF',
            fontWeight: fontWeight.bold,
        },
        buttonRow: {
            flexDirection: 'row',
            gap: spacing.md,
            marginTop: spacing.lg,
        },
        button: {
            flex: 1,
            paddingVertical: spacing.md,
            borderRadius: radius.lg,
            alignItems: 'center',
        },
        cancelButton: {
            backgroundColor: theme.surfaceAlt,
        },
        confirmButton: {
            backgroundColor: theme.primary,
        },
        buttonText: {
            fontSize: fontSize.body,
            fontWeight: fontWeight.semibold,
        },
        cancelButtonText: {
            color: theme.textPrimary,
        },
        confirmButtonText: {
            color: '#FFFFFF',
        },
    });

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Select Time</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.pickerContainer}>
                        <View style={styles.pickerColumn}>
                            <Text style={styles.pickerLabel}>Hour</Text>
                            <ScrollView
                                ref={hourScrollRef}
                                style={styles.scrollView}
                                showsVerticalScrollIndicator={false}
                            >
                                {hours.map((hour) => (
                                    <TouchableOpacity
                                        key={hour}
                                        style={[
                                            styles.timeOption,
                                            selectedHour === hour && styles.timeOptionSelected,
                                        ]}
                                        onPress={() => setSelectedHour(hour)}
                                    >
                                        <Text
                                            style={[
                                                styles.timeOptionText,
                                                selectedHour === hour && styles.timeOptionTextSelected,
                                            ]}
                                        >
                                            {hour.toString().padStart(2, '0')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.pickerColumn}>
                            <Text style={styles.pickerLabel}>Minute</Text>
                            <ScrollView
                                ref={minuteScrollRef}
                                style={styles.scrollView}
                                showsVerticalScrollIndicator={false}
                            >
                                {minutes.map((minute) => (
                                    <TouchableOpacity
                                        key={minute}
                                        style={[
                                            styles.timeOption,
                                            selectedMinute === minute && styles.timeOptionSelected,
                                        ]}
                                        onPress={() => setSelectedMinute(minute)}
                                    >
                                        <Text
                                            style={[
                                                styles.timeOptionText,
                                                selectedMinute === minute && styles.timeOptionTextSelected,
                                            ]}
                                        >
                                            {minute.toString().padStart(2, '0')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={handleConfirm}
                        >
                            <Text style={[styles.buttonText, styles.confirmButtonText]}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

