import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../constants/theme';

export default function Dropdown({
    label,
    value,
    options,
    onSelect,
    placeholder = 'Select an option',
    error,
    style
}) {
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    const handleSelect = (option) => {
        onSelect(option.value);
        setIsOpen(false);
        setIsFocused(false);
    };

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
        dropdownContainer: {
            backgroundColor: isFocused ? theme.surface : theme.surfaceAlt,
            borderRadius: radius.lg,
            paddingHorizontal: spacing.md,
            paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
            borderWidth: 2,
            borderColor: isFocused ? theme.primary : 'transparent',
            shadowColor: isFocused ? theme.primary : '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isFocused ? 0.2 : 0,
            shadowRadius: 8,
            elevation: isFocused ? 4 : 0,
            minHeight: 48,
            justifyContent: 'center',
        },
        dropdownButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        dropdownText: {
            fontSize: fontSize.body,
            color: selectedOption ? theme.textPrimary : theme.textMuted,
            flex: 1,
        },
        dropdownIcon: {
            marginLeft: spacing.sm,
        },
        errorText: {
            fontSize: fontSize.caption,
            color: '#EF4444',
            marginTop: spacing.xs,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: theme.surface,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            maxHeight: hp('50%'),
            paddingTop: spacing.md,
            ...shadows.floating,
        },
        modalHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        modalTitle: {
            fontSize: fontSize.subtitle,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
        },
        closeButton: {
            padding: spacing.xs,
        },
        optionsList: {
            paddingVertical: spacing.sm,
        },
        optionItem: {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        optionItemSelected: {
            backgroundColor: `${theme.primary}15`,
        },
        optionText: {
            fontSize: fontSize.body,
            color: theme.textPrimary,
            fontWeight: fontWeight.medium,
        },
        optionTextSelected: {
            color: theme.primary,
            fontWeight: fontWeight.bold,
        },
        checkIcon: {
            marginLeft: spacing.sm,
        },
    });

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TouchableOpacity
                style={styles.dropdownContainer}
                onPress={() => {
                    setIsOpen(true);
                    setIsFocused(true);
                }}
                activeOpacity={0.8}
            >
                <View style={styles.dropdownButton}>
                    <Text style={styles.dropdownText}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </Text>
                    <Ionicons
                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                        size={hp('2%')}
                        color={theme.textSecondary}
                        style={styles.dropdownIcon}
                    />
                </View>
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Modal
                visible={isOpen}
                transparent
                animationType="slide"
                onRequestClose={() => {
                    setIsOpen(false);
                    setIsFocused(false);
                }}
            >
                <TouchableWithoutFeedback onPress={() => {
                    setIsOpen(false);
                    setIsFocused(false);
                }}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
                                    <TouchableOpacity
                                        style={styles.closeButton}
                                        onPress={() => {
                                            setIsOpen(false);
                                            setIsFocused(false);
                                        }}
                                    >
                                        <Ionicons name="close" size={hp('2.5%')} color={theme.textPrimary} />
                                    </TouchableOpacity>
                                </View>
                                <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                                    {options.map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={[
                                                styles.optionItem,
                                                value === option.value && styles.optionItemSelected
                                            ]}
                                            onPress={() => handleSelect(option)}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionText,
                                                    value === option.value && styles.optionTextSelected
                                                ]}
                                            >
                                                {option.label}
                                            </Text>
                                            {value === option.value && (
                                                <Ionicons
                                                    name="checkmark"
                                                    size={hp('2%')}
                                                    color={theme.primary}
                                                    style={styles.checkIcon}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

