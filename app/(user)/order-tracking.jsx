import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme';

const ORDER_STEPS = [
    { id: 'confirmed', label: 'Order Confirmed', icon: 'checkmark-circle', description: 'Your order has been received' },
    { id: 'preparing', label: 'Preparing', icon: 'restaurant', description: 'The kitchen is preparing your food' },
    { id: 'ready', label: 'Ready for Pickup', icon: 'bag-check', description: 'Your order is ready' },
    { id: 'out_for_delivery', label: 'On the Way', icon: 'bicycle', description: 'Driver is heading to you' },
    { id: 'delivered', label: 'Delivered', icon: 'home', description: 'Enjoy your meal!' },
];

export default function OrderTracking() {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const [currentStep, setCurrentStep] = useState(0);
    const orderId = params.orderId || 'ORDER-123456';
    const isSuccess = params.success === 'true';

    // Simulate order progress
    useEffect(() => {
        if (isSuccess && currentStep < 2) {
            const timer = setTimeout(() => {
                setCurrentStep(prev => Math.min(prev + 1, 2));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [currentStep, isSuccess]);

    const getStepColor = (stepIndex) => {
        if (stepIndex < currentStep) return theme.success;
        if (stepIndex === currentStep) return theme.primary;
        return theme.textMuted;
    };

    const getStepBgColor = (stepIndex) => {
        if (stepIndex < currentStep) return isDarkMode ? '#064E3B' : '#D1FAE5';
        if (stepIndex === currentStep) return isDarkMode ? `${theme.primary}30` : `${theme.primary}15`;
        return theme.surfaceAlt;
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={[styles.backButton, { backgroundColor: theme.surface }]}
                    onPress={() => router.replace('/(user)/(tabs)/home')}
                >
                    <Ionicons name="close" size={hp('2.5%')} color={theme.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                        Order Status
                    </Text>
                    <Text style={[styles.orderId, { color: theme.textMuted }]}>
                        {orderId}
                    </Text>
                </View>
                <View style={{ width: hp('5%') }} />
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Success Banner */}
                {isSuccess && (
                    <View style={[styles.successBanner, { backgroundColor: isDarkMode ? '#064E3B' : '#D1FAE5' }]}>
                        <Ionicons name="checkmark-circle" size={hp('3%')} color={theme.success} />
                        <View style={styles.successContent}>
                            <Text style={[styles.successTitle, { color: isDarkMode ? '#34D399' : '#059669' }]}>
                                Order Placed Successfully!
                            </Text>
                            <Text style={[styles.successText, { color: isDarkMode ? '#A7F3D0' : '#047857' }]}>
                                Your order is being prepared
                            </Text>
                        </View>
                    </View>
                )}

                {/* Estimated Time */}
                <View style={[styles.timeCard, { backgroundColor: theme.surface }]}>
                    <View style={[styles.timeIconContainer, { backgroundColor: `${theme.primary}15` }]}>
                        <Ionicons name="time" size={hp('3%')} color={theme.primary} />
                    </View>
                    <View>
                        <Text style={[styles.timeLabel, { color: theme.textMuted }]}>
                            Estimated Delivery
                        </Text>
                        <Text style={[styles.timeValue, { color: theme.textPrimary }]}>
                            25-35 minutes
                        </Text>
                    </View>
                </View>

                {/* Order Steps */}
                <View style={[styles.stepsCard, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                        Order Progress
                    </Text>
                    
                    {ORDER_STEPS.map((step, index) => (
                        <View key={step.id} style={styles.stepContainer}>
                            {/* Step Line */}
                            {index > 0 && (
                                <View style={[
                                    styles.stepLine,
                                    { 
                                        backgroundColor: index <= currentStep ? theme.success : theme.border,
                                    }
                                ]} />
                            )}
                            
                            {/* Step Icon */}
                            <View style={[
                                styles.stepIcon,
                                { backgroundColor: getStepBgColor(index) }
                            ]}>
                                <Ionicons 
                                    name={step.icon} 
                                    size={hp('2%')} 
                                    color={getStepColor(index)} 
                                />
                            </View>
                            
                            {/* Step Content */}
                            <View style={styles.stepContent}>
                                <Text style={[
                                    styles.stepLabel,
                                    { 
                                        color: index <= currentStep ? theme.textPrimary : theme.textMuted,
                                        fontWeight: index === currentStep ? fontWeight.bold : fontWeight.medium,
                                    }
                                ]}>
                                    {step.label}
                                </Text>
                                <Text style={[styles.stepDescription, { color: theme.textMuted }]}>
                                    {step.description}
                                </Text>
                            </View>
                            
                            {/* Completed Check */}
                            {index < currentStep && (
                                <Ionicons name="checkmark" size={hp('2%')} color={theme.success} />
                            )}
                        </View>
                    ))}
                </View>

                {/* Help Section */}
                <View style={[styles.helpCard, { backgroundColor: theme.surface }]}>
                    <TouchableOpacity style={styles.helpItem}>
                        <View style={[styles.helpIcon, { backgroundColor: `${theme.info}15` }]}>
                            <Ionicons name="call" size={hp('2%')} color={theme.info} />
                        </View>
                        <Text style={[styles.helpText, { color: theme.textPrimary }]}>
                            Call Restaurant
                        </Text>
                        <Ionicons name="chevron-forward" size={hp('2%')} color={theme.textMuted} />
                    </TouchableOpacity>
                    
                    <View style={[styles.helpDivider, { backgroundColor: theme.border }]} />
                    
                    <TouchableOpacity style={styles.helpItem}>
                        <View style={[styles.helpIcon, { backgroundColor: `${theme.warning}15` }]}>
                            <Ionicons name="help-circle" size={hp('2%')} color={theme.warning} />
                        </View>
                        <Text style={[styles.helpText, { color: theme.textPrimary }]}>
                            Need Help?
                        </Text>
                        <Ionicons name="chevron-forward" size={hp('2%')} color={theme.textMuted} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View style={[styles.bottomContainer, { backgroundColor: theme.surface }]}>
                <TouchableOpacity 
                    style={[styles.homeButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.replace('/(user)/(tabs)/home')}
                >
                    <Text style={styles.homeButtonText}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    backButton: {
        width: hp('5%'),
        height: hp('5%'),
        borderRadius: hp('2.5%'),
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.soft,
    },
    headerCenter: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
    },
    orderId: {
        fontSize: fontSize.caption,
        marginTop: hp('0.3%'),
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: hp('12%'),
    },
    successBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    successContent: {
        flex: 1,
    },
    successTitle: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    successText: {
        fontSize: fontSize.caption,
        marginTop: hp('0.2%'),
    },
    timeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        gap: spacing.md,
        ...shadows.soft,
    },
    timeIconContainer: {
        width: hp('6%'),
        height: hp('6%'),
        borderRadius: hp('3%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeLabel: {
        fontSize: fontSize.caption,
    },
    timeValue: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
    },
    stepsCard: {
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        ...shadows.soft,
    },
    sectionTitle: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.md,
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        position: 'relative',
    },
    stepLine: {
        position: 'absolute',
        left: hp('2.1%'),
        top: -hp('1.5%'),
        width: 2,
        height: hp('3%'),
    },
    stepIcon: {
        width: hp('4.2%'),
        height: hp('4.2%'),
        borderRadius: hp('2.1%'),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    stepContent: {
        flex: 1,
    },
    stepLabel: {
        fontSize: fontSize.body,
    },
    stepDescription: {
        fontSize: fontSize.caption,
        marginTop: hp('0.2%'),
    },
    helpCard: {
        borderRadius: radius.lg,
        overflow: 'hidden',
        ...shadows.soft,
    },
    helpItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    helpIcon: {
        width: hp('4%'),
        height: hp('4%'),
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    helpText: {
        flex: 1,
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
    },
    helpDivider: {
        height: 1,
        marginLeft: hp('4%') + spacing.md * 2,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.md,
        paddingBottom: hp('4%'),
        ...shadows.floating,
    },
    homeButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: radius.xl,
    },
    homeButtonText: {
        color: '#fff',
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
});
