import React, { useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme';

// Status step configurations
const STATUS_CONFIG = {
    'Pending': { 
        step: 1, 
        label: 'Pending', 
        icon: 'time-outline',
        message: 'Waiting for confirmation'
    },
    'Preparing': { 
        step: 2, 
        label: 'Preparing', 
        icon: 'restaurant-outline',
        message: 'Your food is being prepared'
    },
    'Ready': { 
        step: 3, 
        label: 'Ready', 
        icon: 'bag-check-outline',
        message: 'Ready for pickup/delivery'
    },
    'Out for Delivery': { 
        step: 4, 
        label: 'On the Way', 
        icon: 'bicycle-outline',
        message: 'Driver is heading to you'
    },
};

const TOTAL_STEPS = 4;

/**
 * ActiveOrderCard - Displays an active order prominently on the home screen
 * Shows real-time status updates with animated progress indicator
 */
const ActiveOrderCard = ({ order }) => {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Pulse animation for current status indicator
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();

        return () => pulse.stop();
    }, []);

    if (!order) return null;

    const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pending'];
    const progress = statusConfig.step / TOTAL_STEPS;

    // Format estimated time
    const getEstimatedTime = () => {
        if (!order.estimatedDeliveryTime) return '25-35 min';
        const time = order.estimatedDeliveryTime;
        return `${time - 5}-${time + 5} min`;
    };

    // Get display order ID
    const getDisplayId = () => {
        if (order.orderDisplayId) return order.orderDisplayId;
        if (order.id) return `#${order.id.slice(-6).toUpperCase()}`;
        return 'Order';
    };

    const handlePress = () => {
        router.push(`/(user)/order-tracking?orderId=${order.id}`);
    };

    return (
        <TouchableOpacity 
            style={styles.container}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            <LinearGradient
                colors={isDarkMode 
                    ? ['#1E3A5F', '#0F172A'] 
                    : [theme.primary, '#16A34A']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Header Row */}
                <View style={styles.headerRow}>
                    <View style={styles.headerLeft}>
                        <View style={styles.liveIndicator}>
                            <Animated.View 
                                style={[
                                    styles.liveDot,
                                    { transform: [{ scale: pulseAnim }] }
                                ]} 
                            />
                            <Text style={styles.liveText}>LIVE</Text>
                        </View>
                        <Text style={styles.orderIdText}>{getDisplayId()}</Text>
                    </View>
                    <View style={styles.etaBadge}>
                        <Ionicons name="time-outline" size={hp('1.6%')} color="#fff" />
                        <Text style={styles.etaText}>{getEstimatedTime()}</Text>
                    </View>
                </View>

                {/* Restaurant Name */}
                <Text style={styles.restaurantName} numberOfLines={1}>
                    {order.restaurantName || 'Restaurant'}
                </Text>

                {/* Status Message */}
                <View style={styles.statusRow}>
                    <Ionicons name={statusConfig.icon} size={hp('2.2%')} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.statusMessage}>{statusConfig.message}</Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressTrack}>
                        <Animated.View 
                            style={[
                                styles.progressFill,
                                { width: `${progress * 100}%` }
                            ]} 
                        />
                    </View>
                    <View style={styles.progressLabels}>
                        <Text style={styles.progressLabel}>Placed</Text>
                        <Text style={styles.progressLabel}>Preparing</Text>
                        <Text style={styles.progressLabel}>Ready</Text>
                        <Text style={styles.progressLabel}>Delivery</Text>
                    </View>
                </View>

                {/* Track Button */}
                <View style={styles.trackButtonContainer}>
                    <View style={styles.trackButton}>
                        <Text style={styles.trackButtonText}>Track Order</Text>
                        <Ionicons name="arrow-forward" size={hp('2%')} color={isDarkMode ? '#fff' : theme.primary} />
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        borderRadius: radius.xl,
        overflow: 'hidden',
        ...shadows.medium,
    },
    gradient: {
        padding: spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: spacing.sm,
        paddingVertical: hp('0.3%'),
        borderRadius: radius.pill,
        gap: wp('1%'),
    },
    liveDot: {
        width: wp('2%'),
        height: wp('2%'),
        borderRadius: wp('1%'),
        backgroundColor: '#FF6B6B',
    },
    liveText: {
        color: '#fff',
        fontSize: hp('1.2%'),
        fontWeight: fontWeight.bold,
        letterSpacing: 0.5,
    },
    orderIdText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: fontSize.caption,
        fontWeight: fontWeight.medium,
    },
    etaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: spacing.sm,
        paddingVertical: hp('0.4%'),
        borderRadius: radius.pill,
        gap: wp('1%'),
    },
    etaText: {
        color: '#fff',
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
    },
    restaurantName: {
        color: '#fff',
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    statusMessage: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
    },
    progressContainer: {
        marginBottom: spacing.md,
    },
    progressTrack: {
        height: hp('0.8%'),
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: radius.pill,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: radius.pill,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.xs,
    },
    progressLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: hp('1.2%'),
        fontWeight: fontWeight.medium,
    },
    trackButtonContainer: {
        alignItems: 'center',
    },
    trackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        gap: spacing.sm,
    },
    trackButtonText: {
        color: '#16A34A',
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
});

export default ActiveOrderCard;
