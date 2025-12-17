import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import Button from '../../../components/Button';
import CustomToggle from '../../../components/CustomToggle';
import TimePickerModal from '../../../components/TimePickerModal';
import { updateRestaurant, getRestaurantByOwner } from '../../../services/restaurantService';
import { getCurrentUser } from '../../../services/authService';
import { getUserData } from '../../../services/userService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function HoursSetup() {
    const { theme } = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [timePickerVisible, setTimePickerVisible] = useState(false);
    const [timePickerDay, setTimePickerDay] = useState(null);
    const [timePickerType, setTimePickerType] = useState(null); // 'open' or 'close'

    const [schedule, setSchedule] = useState(
        DAYS.reduce((acc, day) => ({
            ...acc,
            [day]: { isOpen: true, open: '09:00', close: '22:00' }
        }), {})
    );

    useEffect(() => {
        checkEditMode();
        loadData();
    }, []);

    const checkEditMode = async () => {
        const user = getCurrentUser();
        if (user) {
            const userData = await getUserData(user.uid);
            if (userData.success && userData.data?.onboardingCompleted) {
                setIsEditMode(true);
            }
        }
    };

    const loadData = async () => {
        const user = getCurrentUser();
        const existingRestaurant = await getRestaurantByOwner(user.uid);
        if (existingRestaurant.success && existingRestaurant.data.hours) {
            setSchedule(prev => ({
                ...prev,
                ...existingRestaurant.data.hours
            }));
        }
    };

    const toggleDay = (day) => {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], isOpen: !prev[day].isOpen }
        }));
    };

    const openTimePicker = (day, type) => {
        setTimePickerDay(day);
        setTimePickerType(type);
        setTimePickerVisible(true);
    };

    const handleTimeSelect = (time) => {
        if (timePickerDay && timePickerType) {
            setSchedule(prev => ({
                ...prev,
                [timePickerDay]: {
                    ...prev[timePickerDay],
                    [timePickerType]: time
                }
            }));
        }
    };

    const handleOpenAll = () => {
        setSchedule(prev => {
            const updated = { ...prev };
            DAYS.forEach(day => {
                updated[day] = { ...updated[day], isOpen: true };
            });
            return updated;
        });
    };

    const handleCloseFridays = () => {
        setSchedule(prev => ({
            ...prev,
            Friday: { ...prev.Friday, isOpen: false }
        }));
    };

    const handleNext = async () => {
        setLoading(true);
        const user = getCurrentUser();
        const restaurant = await getRestaurantByOwner(user.uid);
        if (restaurant.success) {
            await updateRestaurant(restaurant.data.id, { hours: schedule });
            
            if (isEditMode) {
                router.back();
            } else {
                router.push('/onboarding/add-first-item');
            }
        }
        setLoading(false);
    };

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.surface,
        },
        header: {
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.lg,
            backgroundColor: theme.surface,
            zIndex: 10,
        },
        title: {
            marginTop: spacing.sm,
            fontSize: fontSize.title,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
            letterSpacing: -0.5,
            marginBottom: spacing.xs,
        },
        subtitle: {
            fontSize: fontSize.body,
            color: theme.textSecondary,
            lineHeight: fontSize.body * 1.5,
        },
        listContainer: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: hp('20%'),
        },
        dayRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.surface,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            borderRadius: radius.md,
            marginBottom: spacing.sm,
            ...shadows.soft,
        },
        dayLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        dayLabel: {
            fontSize: fontSize.body,
            fontWeight: fontWeight.medium,
            color: theme.textPrimary,
            width: wp('15%'),
        },
        rowRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            flex: 1,
            justifyContent: 'flex-end'
        },
        timeBox: {
            backgroundColor: theme.surfaceAlt,
            borderRadius: radius.md,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            minWidth: 90,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.border,
        },
        timeBoxActive: {
            backgroundColor: theme.primary + '15',
            borderColor: theme.primary,
        },
        timeText: {
            fontSize: fontSize.caption,
            color: theme.textPrimary,
            fontWeight: fontWeight.medium
        },
        timeTextClosed: {
            color: theme.textMuted,
        },
        dash: {
            color: theme.textSecondary,
            fontSize: fontSize.body,
            marginHorizontal: spacing.xs,
        },
        closedBadge: {
            backgroundColor: theme.surfaceAlt,
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.md,
            borderRadius: radius.pill,
        },
        closedBadgeText: {
            fontSize: fontSize.caption,
            color: theme.textMuted,
            fontWeight: fontWeight.medium,
        },
        helperButtons: {
            flexDirection: 'row',
            gap: spacing.md,
            marginTop: spacing.xl,
            marginBottom: spacing.lg
        },
        helperButton: {
            backgroundColor: theme.surfaceAlt,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: theme.border,
        },
        helperButtonActive: {
            backgroundColor: theme.primary + '15',
            borderColor: theme.primary,
        },
        helperButtonText: {
            fontSize: fontSize.caption,
            color: theme.textPrimary,
            fontWeight: fontWeight.medium
        },
        helperButtonTextActive: {
            color: theme.primary,
            fontWeight: fontWeight.semibold,
        },
        footer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.surface,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
            borderTopWidth: 1,
            borderTopColor: theme.surfaceAlt,
            flexDirection: 'row',
            gap: spacing.md
        },
        nextButton: {
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 8,
        }
    });

    return (
        <View style={styles.safeArea}>
            <View style={styles.header}>
                <View style={{ marginTop: spacing.sm }}>
                    <Text style={styles.title}>Operating Hours</Text>
                    <Text style={styles.subtitle}>When are you open for business?</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
                {DAYS.map((day) => (
                    <View key={day} style={styles.dayRow}>
                        <View style={styles.dayLeft}>
                            <Text style={styles.dayLabel}>{day.substring(0, 3)}</Text>
                            <CustomToggle
                                value={schedule[day].isOpen}
                                onValueChange={() => toggleDay(day)}
                            />
                        </View>

                        {schedule[day].isOpen ? (
                            <View style={styles.rowRight}>
                                <TouchableOpacity
                                    style={[styles.timeBox, styles.timeBoxActive]}
                                    onPress={() => openTimePicker(day, 'open')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.timeText}>{schedule[day].open}</Text>
                                </TouchableOpacity>
                                <Text style={styles.dash}>-</Text>
                                <TouchableOpacity
                                    style={[styles.timeBox, styles.timeBoxActive]}
                                    onPress={() => openTimePicker(day, 'close')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.timeText}>{schedule[day].close}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.closedBadge}>
                                <Text style={styles.closedBadgeText}>Closed</Text>
                            </View>
                        )}
                    </View>
                ))}

                <View style={styles.helperButtons}>
                    <TouchableOpacity
                        style={styles.helperButton}
                        onPress={handleOpenAll}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.helperButtonText}>Open All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.helperButton}
                        onPress={handleCloseFridays}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.helperButtonText}>Close Fridays</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title="Back"
                    onPress={() => router.back()}
                    variant="secondary"
                    style={{ flex: 1 }}
                />
                <Button
                    title={isEditMode ? "Save" : "Continue"}
                    onPress={handleNext}
                    loading={loading}
                    style={[styles.nextButton, { flex: 2 }]}
                />
            </View>

            <TimePickerModal
                visible={timePickerVisible}
                onClose={() => setTimePickerVisible(false)}
                onSelect={handleTimeSelect}
                initialTime={timePickerDay && timePickerType ? schedule[timePickerDay][timePickerType] : '09:00'}
            />
        </View>
    );
}
