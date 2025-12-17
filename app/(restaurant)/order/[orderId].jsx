import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Badge from '../../../components/restaurant/Badge';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

export default function OrderDetailsScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { orderId } = useLocalSearchParams();

    // Mock Data based on ID
    const order = {
        id: orderId,
        customer: {
            name: 'Alice Johnson',
            phone: '+1 (555) 123-4567',
            address: '123 Main St, Apt 4B'
        },
        status: 'Cooking',
        items: [
            { id: 1, name: 'Classic Cheeseburger', quantity: 2, price: 12.00, options: 'Medium Rare, No Onions' },
            { id: 2, name: 'French Fries', quantity: 1, price: 4.00, options: 'Large' },
            { id: 3, name: 'Coke', quantity: 2, price: 2.50, options: 'No Ice' }
        ],
        summary: {
            subtotal: 33.00,
            tax: 2.50,
            delivery: 5.00,
            total: 40.50
        },
        timeline: [
            { status: 'Placed', time: '12:40 PM', completed: true },
            { status: 'Confirmed', time: '12:42 PM', completed: true },
            { status: 'Cooking', time: '12:45 PM', completed: true, current: true },
            { status: 'Ready', time: 'Est. 1:00 PM', completed: false },
            { status: 'Delivered', time: '', completed: false }
        ]
    };

    const StatusTimeline = () => {
        // Simplified steps for horizontal view
        const steps = [
            { key: 'Placed', icon: 'document-text-outline', label: 'New Order' },
            { key: 'Cooking', icon: 'flame-outline', label: 'Cooking' },
            { key: 'Ready', icon: 'timer-outline', label: 'Ready' },
            { key: 'Delivered', icon: 'checkmark-circle-outline', label: 'Picked Up' },
        ];

        // determine current active index
        let activeIndex = 0;
        const currentStatus = order.status.toLowerCase();
        if (currentStatus === 'cooking') activeIndex = 1;
        if (currentStatus === 'ready') activeIndex = 2;
        if (currentStatus === 'completed' || currentStatus === 'delivered') activeIndex = 3;

        return (
            <View style={styles.horizontalTimeline}>
                {steps.map((step, index) => {
                    const isActive = index <= activeIndex;
                    const isCurrent = index === activeIndex;

                    return (
                        <View key={index} style={styles.stepContainer}>
                            {/* Icon Circle */}
                            <View style={[
                                styles.stepIconContainer,
                                {
                                    backgroundColor: isActive ? (isCurrent ? theme.primary : theme.success) : theme.surfaceAlt,
                                    borderColor: isActive ? (isCurrent ? theme.primary : theme.success) : theme.border,
                                    // borderWidth: 1
                                }
                            ]}>
                                <Ionicons
                                    name={step.icon}
                                    size={20}
                                    color={isActive ? '#FFF' : theme.textMuted}
                                />
                            </View>

                            {/* Connector Line (except for last item) */}
                            {index < steps.length - 1 && (
                                <View style={[
                                    styles.connectorLine,
                                    { backgroundColor: index < activeIndex ? theme.success : theme.surfaceAlt }
                                ]} />
                            )}

                            {/* Label */}
                            <Text style={[
                                styles.stepLabel,
                                {
                                    color: isActive ? theme.textPrimary : theme.textMuted,
                                    fontWeight: isCurrent ? fontWeight.bold : fontWeight.medium
                                }
                            ]}>
                                {step.label}
                            </Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <StatusBar style="dark" />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Order #{orderId} </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Status Section */}
                <View style={[styles.card, { backgroundColor: theme.surface, ...shadows.soft }]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Status </Text>
                        <Badge status={order.status} />
                    </View>
                    <StatusTimeline />
                </View>

                {/* Customer Info */}
                <View style={[styles.card, { backgroundColor: theme.surface, ...shadows.soft }]}>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary, marginBottom: spacing.md }]}>Customer </Text>
                    <View style={styles.customerRow}>
                        <View style={[styles.iconBox, { backgroundColor: theme.surfaceAlt }]}>
                            <Ionicons name="person" size={20} color={theme.primary} />
                        </View>
                        <View>
                            <Text style={[styles.customerName, { color: theme.textPrimary }]}>{order.customer.name} </Text>
                            <Text style={[styles.customerDetail, { color: theme.textSecondary }]}>Customer since 2023 </Text>
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <View style={styles.customerRow}>
                        <View style={[styles.iconBox, { backgroundColor: theme.surfaceAlt }]}>
                            <Ionicons name="call" size={20} color={theme.primary} />
                        </View>
                        <Text style={[styles.customerName, { color: theme.textPrimary }]}>{order.customer.phone} </Text>
                    </View>
                </View>

                {/* Order Items */}
                <View style={[styles.card, { backgroundColor: theme.surface, ...shadows.soft }]}>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary, marginBottom: spacing.md }]}>Items ({order.items.length}) </Text>
                    {order.items.map((item, index) => (
                        <View key={item.id} style={[
                            styles.itemRow,
                            index !== order.items.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: 1 }
                        ]}>
                            <View style={[styles.quantityBadge, { backgroundColor: theme.surfaceAlt }]}>
                                <Text style={[styles.quantityText, { color: theme.textPrimary }]}>{item.quantity}x </Text>
                            </View>
                            <View style={styles.itemDetails}>
                                <Text style={[styles.itemName, { color: theme.textPrimary }]}>{item.name} </Text>
                                {item.options && (
                                    <Text style={[styles.itemOptions, { color: theme.textSecondary }]}>{item.options} </Text>
                                )}
                            </View>
                            <Text style={[styles.itemPrice, { color: theme.textPrimary }]}>${(item.price * item.quantity).toFixed(2)} </Text>
                        </View>
                    ))}
                </View>

                {/* Payment Summary */}
                <View style={[styles.card, { backgroundColor: theme.surface, ...shadows.soft }]}>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary, marginBottom: spacing.md }]}>Payment </Text>
                    <View style={styles.summaryRow}>
                        <Text style={{ color: theme.textSecondary }}>Subtotal </Text>
                        <Text style={{ color: theme.textPrimary }}>${order.summary.subtotal.toFixed(2)} </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={{ color: theme.textSecondary }}>Tax </Text>
                        <Text style={{ color: theme.textPrimary }}>${order.summary.tax.toFixed(2)} </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={{ color: theme.textSecondary }}>Delivery Fee </Text>
                        <Text style={{ color: theme.textPrimary }}>${order.summary.delivery.toFixed(2)} </Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <View style={styles.summaryRow}>
                        <Text style={[styles.totalLabel, { color: theme.textPrimary }]}>Total </Text>
                        <Text style={[styles.totalAmount, { color: theme.primary }]}>${order.summary.total.toFixed(2)} </Text>
                    </View>
                </View>

            </ScrollView>

            {/* Action Buttons Footer */}
            <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                {order.status === 'Pending' ? (
                    <>
                        <TouchableOpacity style={[styles.footerButton, { backgroundColor: theme.error, flex: 1, marginRight: spacing.sm }]}>
                            <Text style={styles.footerButtonText}>Decline </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.footerButton, { backgroundColor: theme.success, flex: 2 }]}>
                            <Text style={styles.footerButtonText}>Accept Order </Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity style={[styles.footerButton, { backgroundColor: theme.primary, flex: 1 }]}>
                        <Text style={styles.footerButtonText}>Update Status </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
    },
    scrollContent: {
        zIndex: 1,
        padding: spacing.md,
    },
    card: {
        padding: spacing.md,
        borderRadius: radius.md,
        marginBottom: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    cardTitle: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    horizontalTimeline: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: spacing.md,
    },
    stepContainer: {
        alignItems: 'center',
        flex: 1,
        position: 'relative',
    },
    stepIconContainer: {
        width: 40,
        height: 40,
        borderRadius: radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
        zIndex: 1,
    },
    connectorLine: {
        position: 'absolute',
        top: 20, // Center of 40px circle
        left: '50%',
        right: '-50%', // Extend to next
        height: 2,
        zIndex: 0,
    },
    stepLabel: {
        fontSize: fontSize.caption,
        textAlign: 'center',
    },
    customerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    customerName: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
    },
    customerDetail: {
        fontSize: fontSize.caption,
    },
    divider: {
        height: 1,
        marginVertical: spacing.sm,
    },
    itemRow: {
        flexDirection: 'row',
        paddingVertical: spacing.sm,
    },
    quantityBadge: {
        minWidth: 24,
        height: 24,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
        paddingHorizontal: 4,
    },
    quantityText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.bold,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
    },
    itemOptions: {
        fontSize: fontSize.caption,
        marginTop: 2,
    },
    itemPrice: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    totalLabel: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
    },
    totalAmount: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
    },
    footer: {
        flexDirection: 'row',
        padding: spacing.md,
        borderTopWidth: 1,
    },
    footerButton: {
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerButtonText: {
        color: '#FFF',
        fontWeight: fontWeight.bold,
        fontSize: fontSize.body,
    },
});
