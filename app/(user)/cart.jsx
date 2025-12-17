import React from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { spacing, fontSize, fontWeight, radius } from '../../constants/theme';
import EmptyState from '../../components/user/EmptyState';

const CartItem = ({ item, onUpdateQuantity }) => {
    const { theme } = useTheme();

    return (
        <View style={[styles.cartItem, { backgroundColor: theme.surface }]}>
            <Image 
                source={{ uri: item.image || item.imageUrl }} 
                style={styles.itemImage}
                defaultSource={require('../../assets/icon.png')}
            />
            
            <View style={styles.itemContent}>
                <Text style={[styles.itemName, { color: theme.textPrimary }]} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={[styles.itemPrice, { color: theme.primary }]}>
                    ${(item.price * item.quantity).toFixed(2)}
                </Text>
            </View>

            <View style={styles.quantityControls}>
                <TouchableOpacity
                    style={[styles.qtyBtn, { backgroundColor: theme.surfaceAlt }]}
                    onPress={() => onUpdateQuantity(item.id, item.quantity - 1, item.options)}
                >
                    <Ionicons 
                        name={item.quantity === 1 ? "trash-outline" : "remove"} 
                        size={hp('1.8%')} 
                        color={item.quantity === 1 ? theme.error : theme.textPrimary} 
                    />
                </TouchableOpacity>
                
                <Text style={[styles.qtyText, { color: theme.textPrimary }]}>
                    {item.quantity}
                </Text>
                
                <TouchableOpacity
                    style={[styles.qtyBtn, { backgroundColor: theme.primary }]}
                    onPress={() => onUpdateQuantity(item.id, item.quantity + 1, item.options)}
                >
                    <Ionicons name="add" size={hp('1.8%')} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const CartScreen = () => {
    const { theme } = useTheme();
    const router = useRouter();
    const { 
        items, 
        restaurantName, 
        subtotal, 
        tax, 
        deliveryFee, 
        total,
        estimatedTime,
        updateQuantity, 
        clearCart,
        itemCount,
    } = useCart();

    if (items.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={hp('2.5%')} color={theme.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Cart</Text>
                    <View style={{ width: hp('2.5%') }} />
                </View>
                <EmptyState
                    icon="cart-outline"
                    title="Your cart is empty"
                    message="Add some delicious items"
                    actionText="Browse"
                    onActionPress={() => router.push('/(user)/(tabs)/browse')}
                    variant="cart"
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={hp('2.5%')} color={theme.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Cart</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
                        {restaurantName}
                    </Text>
                </View>
                <TouchableOpacity onPress={clearCart}>
                    <Ionicons name="trash-outline" size={hp('2.2%')} color={theme.error} />
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Delivery Info */}
                <View style={[styles.deliveryInfo, { backgroundColor: `${theme.primary}10` }]}>
                    <Ionicons name="time-outline" size={hp('2%')} color={theme.primary} />
                    <Text style={[styles.deliveryText, { color: theme.primary }]}>
                        Delivery in {estimatedTime}-{estimatedTime + 10} min
                    </Text>
                </View>

                {/* Items */}
                {items.map((item, index) => (
                    <CartItem
                        key={`${item.id}-${index}`}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                    />
                ))}

                {/* Add More */}
                <TouchableOpacity 
                    style={[styles.addMore, { borderColor: theme.border }]}
                    onPress={() => router.back()}
                >
                    <Ionicons name="add" size={hp('2%')} color={theme.primary} />
                    <Text style={[styles.addMoreText, { color: theme.primary }]}>Add more</Text>
                </TouchableOpacity>

                {/* Summary */}
                <View style={[styles.summary, { backgroundColor: theme.surface }]}>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                            Subtotal ({itemCount})
                        </Text>
                        <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>
                            ${subtotal.toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Tax</Text>
                        <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>
                            ${tax.toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Delivery</Text>
                        <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>
                            {deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : 'Free'}
                        </Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: theme.border }]}>
                        <Text style={[styles.totalLabel, { color: theme.textPrimary }]}>Total</Text>
                        <Text style={[styles.totalValue, { color: theme.primary }]}>
                            ${total.toFixed(2)}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Checkout Button */}
            <View style={styles.checkoutContainer}>
                <TouchableOpacity 
                    style={[styles.checkoutBtn, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/(user)/checkout')}
                >
                    <Text style={styles.checkoutText}>Checkout</Text>
                    <Text style={styles.checkoutPrice}>${total.toFixed(2)}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

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
    headerCenter: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    headerSubtitle: {
        fontSize: fontSize.caption,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: hp('12%'),
    },
    deliveryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    deliveryText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.sm,
    },
    itemImage: {
        width: hp('7%'),
        height: hp('7%'),
        borderRadius: radius.md,
    },
    itemContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    itemName: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
        marginBottom: hp('0.2%'),
    },
    itemPrice: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    qtyBtn: {
        width: hp('3.5%'),
        height: hp('3.5%'),
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyText: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
        minWidth: wp('5%'),
        textAlign: 'center',
    },
    addMore: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderStyle: 'dashed',
        marginVertical: spacing.md,
        gap: spacing.xs,
    },
    addMoreText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
    },
    summary: {
        padding: spacing.md,
        borderRadius: radius.lg,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    summaryLabel: {
        fontSize: fontSize.body,
    },
    summaryValue: {
        fontSize: fontSize.body,
    },
    totalRow: {
        borderTopWidth: 1,
        paddingTop: spacing.md,
        marginTop: spacing.sm,
        marginBottom: 0,
    },
    totalLabel: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
    },
    totalValue: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
    },
    checkoutContainer: {
        padding: spacing.md,
        paddingBottom: hp('3%'),
    },
    checkoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.xl,
    },
    checkoutText: {
        color: '#fff',
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    checkoutPrice: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
});

export default CartScreen;
