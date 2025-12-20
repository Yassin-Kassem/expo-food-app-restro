import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius, fontSize, fontWeight, shadows } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Badge from './Badge';

export default function OrderCard({ order, onPress, actionLabel, onActionPress }) {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9} // Sturdier feel
            style={[
                styles.card,
                {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    ...shadows.soft
                }
            ]}
        >
            {/* Header: Dot + ID + Time + Chevron */}
            <View style={styles.header}>
                <View>
                    <View style={styles.idRow}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status, theme) }]} />
                        <Text style={[styles.orderId, { color: theme.textPrimary }]}>
                            Order #{order.id}
                        </Text>
                    </View>
                    <Text style={[styles.time, { color: theme.textSecondary }]}>{order.time}</Text>
                </View>

                {/* Chevron for navigation hint */}
                <View style={[styles.chevronContainer]}>
                    <Ionicons name="chevron-forward" size={20} color={theme.textPrimary} />
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Content: Item Rows */}
            <View style={styles.content}>
                {/* We simulate individual items if we had an array, but here we might only have summary data or a list */}
                {/* For this mock, I'll render a single row or simulate the 'items' if they were passed detailed. 
                    Since 'order' prop usually has summary, I'll adapt. 
                    Assuming order.items might not be fully passed here, I'll use the summary fields.
                */}

                {/* Mocking a preview item row for visual fidelity to design */}
                <View style={styles.itemRow}>
                    <View style={[styles.itemImagePlaceholder, { backgroundColor: theme.surfaceAlt }]}>
                        <Ionicons name="fast-food" size={16} color={theme.textMuted} />
                    </View>
                    <Text style={[styles.itemName, { color: theme.textPrimary }]} numberOfLines={1}>
                        {order.itemsCount} items ordered
                    </Text>
                    <Text style={[styles.itemQty, { color: theme.textSecondary }]}>
                        x{order.itemsCount}
                    </Text>
                    <Text style={[styles.itemPrice, { color: theme.textPrimary }]}>
                        £{order.total}
                    </Text>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Footer: User & Action */}
            <View style={styles.footer}>
                <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total:</Text>
                    <Text style={[styles.totalValue, { color: theme.textPrimary }]}>£{order.total}</Text>
                </View>

                {/* Large Action Button or Status Indicator */}
                <TouchableOpacity
                    onPress={onActionPress || onPress}
                    disabled={!onActionPress}
                    style={[
                        styles.actionButton,
                        {
                            backgroundColor: onActionPress ? theme.surfaceAlt : theme.surfaceAlt, // Muted background like design
                        }
                    ]}
                >
                    <Text style={[
                        styles.actionText,
                        { color: theme.textPrimary } // Status text content
                    ]}>
                        {onActionPress ? (actionLabel || order.status) : order.status}
                    </Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

// Helper for dot color
const getStatusColor = (status, theme) => {
    switch (status?.toLowerCase()) {
        case 'pending': return theme.warning || '#F59E0B';
        case 'cooking': return theme.info || '#3B82F6';
        case 'ready':
        case 'completed': return theme.success || '#10B981';
        default: return theme.textMuted;
    }
};

const styles = StyleSheet.create({
    card: {
        borderRadius: radius.lg, // Larger radius like inspiration
        borderWidth: 1,
        marginBottom: spacing.md,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
    },
    idRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing.sm,
    },
    orderId: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    time: {
        fontSize: fontSize.caption,
        marginLeft: spacing.sm + 8, // Align with text start (dot width + margin)
    },
    chevronContainer: {
        width: 32,
        height: 32,
        borderRadius: radius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        height: 1,
        width: '100%',
        opacity: 0.5,
    },
    content: {
        padding: spacing.md,
        gap: spacing.sm,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemImagePlaceholder: {
        width: 40,
        height: 40,
        borderRadius: radius.sm, // Squircle
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    itemName: {
        flex: 1,
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
        marginRight: spacing.sm,
    },
    itemQty: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
        marginRight: spacing.lg,
    },
    itemPrice: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    footer: {
        padding: spacing.md,
        gap: spacing.md,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
    },
    totalValue: {
        fontSize: fontSize.title, // Larger total
        fontWeight: fontWeight.bold,
    },
    actionButton: {
        width: '100%',
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
});
