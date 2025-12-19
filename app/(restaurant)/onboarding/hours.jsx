import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity, 
    Platform,
    Animated 
} from 'react-native';
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
const DAY_ABBREV = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function HoursSetup() {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [timePickerVisible, setTimePickerVisible] = useState(false);
    const [timePickerDay, setTimePickerDay] = useState(null);
    const [timePickerType, setTimePickerType] = useState(null);

    const [schedule, setSchedule] = useState(
        DAYS.reduce((acc, day) => ({
            ...acc,
            [day]: { isOpen: true, open: '09:00', close: '22:00' }
        }), {})
    );

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const dayAnims = useRef(DAYS.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Stagger day card animations
        Animated.stagger(80, 
            dayAnims.map(anim => 
                Animated.spring(anim, {
                    toValue: 1,
                    friction: 8,
                    useNativeDriver: true,
                })
            )
        ).start();

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

    const handleQuickAction = (action) => {
        if (action === 'openAll') {
            setSchedule(prev => {
                const updated = { ...prev };
                DAYS.forEach(day => {
                    updated[day] = { ...updated[day], isOpen: true };
                });
                return updated;
            });
        } else if (action === 'closeWeekends') {
            setSchedule(prev => ({
                ...prev,
                Saturday: { ...prev.Saturday, isOpen: false },
                Sunday: { ...prev.Sunday, isOpen: false }
            }));
        } else if (action === 'standardHours') {
            setSchedule(prev => {
                const updated = { ...prev };
                DAYS.forEach(day => {
                    updated[day] = { ...updated[day], open: '09:00', close: '21:00' };
                });
                return updated;
            });
        }
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

    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
        },
        scrollContent: {
            paddingBottom: hp('18%'),
        },
        
        // Header Section
        headerSection: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.md,
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
            lineHeight: hp('2.8%'),
        },
        
        // Quick Actions
        quickActionsSection: {
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.lg,
        },
        quickActionsLabel: {
            fontSize: fontSize.caption,
            fontWeight: fontWeight.bold,
            color: theme.textMuted,
            marginBottom: spacing.sm,
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        quickActionsRow: {
            flexDirection: 'row',
            gap: spacing.sm,
        },
        quickActionBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.surface,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: theme.border,
            gap: spacing.xs,
        },
        quickActionText: {
            fontSize: fontSize.caption,
            color: theme.textPrimary,
            fontWeight: fontWeight.medium,
        },
        
        // Schedule Section
        scheduleSection: {
            paddingHorizontal: spacing.lg,
        },
        scheduleCard: {
            backgroundColor: theme.surface,
            borderRadius: radius.xl,
            padding: spacing.md,
            ...shadows.soft,
        },
        dayRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
        },
        dayRowLast: {
            borderBottomWidth: 0,
        },
        dayLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            marginRight: spacing.md,
        },
        dayLabel: {
            fontSize: fontSize.body,
            fontWeight: fontWeight.semibold,
            color: theme.textPrimary,
            minWidth: wp('12%'),
        },
        dayLabelClosed: {
            color: theme.textMuted,
        },
        rowRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
        },
        timeContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
        },
        timeBox: {
            backgroundColor: `${theme.primary}10`,
            borderRadius: radius.md,
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.sm,
            minWidth: wp('18%'),
            alignItems: 'center',
        },
        timeText: {
            fontSize: fontSize.caption,
            color: theme.primary,
            fontWeight: fontWeight.semibold,
        },
        timeDash: {
            color: theme.textMuted,
            fontSize: fontSize.body,
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
        
        // Summary Section
        summarySection: {
            paddingHorizontal: spacing.lg,
            marginTop: spacing.lg,
        },
        summaryCard: {
            backgroundColor: isDarkMode ? theme.surfaceAlt : '#E8F5E9',
            borderRadius: radius.xl,
            padding: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
        },
        summaryIconContainer: {
            width: hp('5%'),
            height: hp('5%'),
            borderRadius: hp('2.5%'),
            backgroundColor: `${theme.primary}20`,
            justifyContent: 'center',
            alignItems: 'center',
        },
        summaryContent: {
            flex: 1,
        },
        summaryTitle: {
            fontSize: fontSize.body,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
            marginBottom: spacing.xs / 2,
        },
        summaryText: {
            fontSize: fontSize.caption,
            color: theme.textSecondary,
        },
        
        // Footer
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
            borderTopColor: theme.border,
            flexDirection: 'row',
            gap: spacing.md,
            ...shadows.floating,
        },
    });

    const openDaysCount = Object.values(schedule).filter(s => s.isOpen).length;

    return (
        <View style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Animated.View 
                    style={[
                        styles.headerSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <Text style={styles.title}>Operating Hours</Text>
                    <Text style={styles.subtitle}>
                        Let customers know when you're open 
                    </Text>
                </Animated.View>

                {/* Quick Actions */}
                <Animated.View 
                    style={[
                        styles.quickActionsSection,
                        { opacity: fadeAnim }
                    ]}
                >
                    <Text style={styles.quickActionsLabel}>Quick Actions</Text>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.quickActionsRow}
                    >
                        <TouchableOpacity 
                            style={styles.quickActionBtn}
                            onPress={() => handleQuickAction('openAll')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="checkmark-circle" size={hp('1.8%')} color={theme.success} />
                            <Text style={styles.quickActionText}>Open All Days</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.quickActionBtn}
                            onPress={() => handleQuickAction('closeWeekends')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="moon" size={hp('1.8%')} color={theme.warning} />
                            <Text style={styles.quickActionText}>Close Weekends</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.quickActionBtn}
                            onPress={() => handleQuickAction('standardHours')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="time" size={hp('1.8%')} color={theme.info} />
                            <Text style={styles.quickActionText}>9AM - 9PM </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>

                {/* Schedule */}
                <View style={styles.scheduleSection}>
                    <View style={styles.scheduleCard}>
                        {DAYS.map((day, index) => (
                            <Animated.View
                                key={day}
                                style={{
                                    opacity: dayAnims[index],
                                    transform: [{
                                        translateX: dayAnims[index].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-20, 0]
                                        })
                                    }]
                                }}
                            >
                                <View 
                                    style={[
                                        styles.dayRow,
                                        index === DAYS.length - 1 && styles.dayRowLast
                                    ]}
                                >
                                    <View style={styles.dayLeft}>
                                        <Text style={[
                                            styles.dayLabel,
                                            !schedule[day].isOpen && styles.dayLabelClosed
                                        ]}>
                                            {DAY_ABBREV[index]}
                                        </Text>
                                        <CustomToggle
                                            value={schedule[day].isOpen}
                                            onValueChange={() => toggleDay(day)}
                                        />
                                    </View>

                                    {schedule[day].isOpen ? (
                                        <View style={styles.timeContainer}>
                                            <TouchableOpacity
                                                style={styles.timeBox}
                                                onPress={() => openTimePicker(day, 'open')}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={styles.timeText}>
                                                    {formatTime(schedule[day].open)}
                                                </Text>
                                            </TouchableOpacity>
                                            <Text style={styles.timeDash}>—</Text>
                                            <TouchableOpacity
                                                style={styles.timeBox}
                                                onPress={() => openTimePicker(day, 'close')}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={styles.timeText}>
                                                    {formatTime(schedule[day].close)}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View style={styles.closedBadge}>
                                            <Text style={styles.closedBadgeText}>Closed</Text>
                                        </View>
                                    )}
                                </View>
                            </Animated.View>
                        ))}
                    </View>
                </View>

                {/* Summary */}
                <Animated.View 
                    style={[
                        styles.summarySection,
                        { opacity: fadeAnim }
                    ]}
                >
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryIconContainer}>
                            <Ionicons name="calendar" size={hp('2.2%')} color={theme.primary} />
                        </View>
                        <View style={styles.summaryContent}>
                            <Text style={styles.summaryTitle}>
                                Open {openDaysCount} day{openDaysCount !== 1 ? 's' : ''} a week
                            </Text>
                            <Text style={styles.summaryText}>
                                Tap on times to adjust your schedule
                            </Text>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <Button
                    title="Back"
                    onPress={() => router.back()}
                    variant="secondary"
                    style={{ flex: 1 }}
                />
                <Button
                    title={isEditMode ? "Save Changes" : "Continue"}
                    onPress={handleNext}
                    loading={loading}
                    style={{ flex: 2 }}
                    icon={!loading && (
                        <Ionicons name="arrow-forward" size={hp('2%')} color="#fff" />
                    )}
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
