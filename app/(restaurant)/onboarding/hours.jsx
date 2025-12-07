import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Switch, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import Button from '../../../components/Button';
import ProgressIndicator from '../../../components/ProgressIndicator';
import { updateRestaurant, getRestaurantByOwner } from '../../../services/restaurantService';
import { getCurrentUser } from '../../../services/authService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function HoursSetup() {
    const { theme } = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Simplified state: just toggle for now to focus on UI
    const [schedule, setSchedule] = useState(
        DAYS.reduce((acc, day) => ({
            ...acc,
            [day]: { isOpen: true, open: '09:00', close: '22:00' }
        }), {})
    );

    const toggleDay = (day) => {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], isOpen: !prev[day].isOpen }
        }));
    };

    const handleNext = async () => {
        setLoading(true);
        const user = getCurrentUser();
        const restaurant = await getRestaurantByOwner(user.uid);
        if (restaurant.success) {
            await updateRestaurant(restaurant.data.id, { hours: schedule });
            router.push('/onboarding/add-first-item');
        }
        setLoading(false);
    };

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.surface,
            paddingTop: spacing.xl,
        },
        header: {
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.lg,
            backgroundColor: theme.surface,
            zIndex: 10,
            paddingTop: spacing.xxl,
        },
        title: {
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
            paddingBottom: hp('15%'),
        },
        dayRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.surface,
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.surfaceAlt,
        },
        dayLabel: {
            fontSize: fontSize.body,
            fontWeight: fontWeight.semibold,
            color: theme.textPrimary,
        },
        rowRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
        },
        timeLabel: {
            fontSize: fontSize.body,
            color: theme.textSecondary,
            fontWeight: fontWeight.medium,
        },
        closedText: {
            color: theme.textMuted,
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
                <ProgressIndicator currentStep={3} totalSteps={5} />
                <View style={{ marginTop: spacing.md }}>
                    <Text style={styles.title}>When are you open?</Text>
                    <Text style={styles.subtitle}>Set your standard operating hours.</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
                {DAYS.map((day) => (
                    <View key={day} style={styles.dayRow}>
                        <Text style={[styles.dayLabel, !schedule[day].isOpen && { color: theme.textMuted }]}>
                            {day}
                        </Text>

                        <View style={styles.rowRight}>
                            {schedule[day].isOpen ? (
                                <Text style={styles.timeLabel}>9:00 AM - 10:00 PM</Text>
                            ) : (
                                <Text style={[styles.timeLabel, styles.closedText]}>Closed</Text>
                            )}
                            <Switch
                                trackColor={{ false: theme.surfaceAlt, true: theme.success }}
                                thumbColor={'#FFFFFF'}
                                ios_backgroundColor={theme.surfaceAlt}
                                onValueChange={() => toggleDay(day)}
                                value={schedule[day].isOpen}
                                style={{ transform: [{ scale: 0.8 }] }}
                            />
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title="Continue"
                    onPress={handleNext}
                    loading={loading}
                    style={styles.nextButton}
                />
            </View>
        </View>
    );
}
