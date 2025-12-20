import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { useLocation } from '../../contexts/LocationContext';
import { useAuth } from '../../hooks/useAuth';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme';
import CustomModal from '../../components/CustomModal';
import { createOrder } from '../../services/orderService';
import { getRestaurantById } from '../../services/customerRestaurantService';

const CheckoutScreen = () => {
    const { theme } = useTheme();
    const router = useRouter();
    const { address: savedAddress } = useLocation();
    const { user, userData } = useAuth();
    const { 
        items, 
        restaurantId,
        restaurantName, 
        restaurantImage,
        subtotal, 
        tax, 
        deliveryFee, 
        total,
        estimatedTime,
        clearCart,
        itemCount,
    } = useCart();

    const [deliveryAddress, setDeliveryAddress] = useState(savedAddress || '');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'warning',
    });

    // Auto-fill phone number from userData on initial load
    useEffect(() => {
        if (userData?.phoneNumber && !phoneNumber) {
            setPhoneNumber(userData.phoneNumber);
        }
    }, [userData?.phoneNumber]);

    const showModal = (title, message) => {
        setModalConfig({ visible: true, title, message, type: 'warning' });
    };

    const hideModal = () => {
        setModalConfig({ ...modalConfig, visible: false });
    };

    const handlePlaceOrder = async () => {
        // Validate inputs
        if (!deliveryAddress.trim()) {
            showModal('Missing Address', 'Please enter a delivery address');
            return;
        }
        // Phone number is optional if user has one saved, but required if they don't
        if (!phoneNumber.trim()) {
            showModal('Missing Phone', 'Please enter your phone number');
            return;
        }
        if (!user?.uid) {
            showModal('Not Logged In', 'Please log in to place an order');
            return;
        }
        if (!restaurantId || items.length === 0) {
            showModal('Empty Cart', 'Your cart is empty');
            return;
        }

        setIsPlacingOrder(true);

        // Check if restaurant is open before placing order
        try {
            const restaurantResult = await getRestaurantById(restaurantId);
            if (!restaurantResult.success) {
                setIsPlacingOrder(false);
                showModal('Restaurant Unavailable', 'Unable to verify restaurant status. Please try again.');
                return;
            }

            const restaurant = restaurantResult.data;
            // Check if restaurant is closed
            // The restaurant.isOpen value from getRestaurantById already respects manual overrides
            // But we also check restaurantStatus as a fallback
            if (restaurant.isOpen === false || restaurant.restaurantStatus === 'closed') {
                setIsPlacingOrder(false);
                showModal('Restaurant Closed', 'This restaurant is currently closed. Please try again later.');
                return;
            }
        } catch (error) {
            console.error('Error checking restaurant status:', error);
            setIsPlacingOrder(false);
            showModal('Error', 'Unable to verify restaurant status. Please try again.');
            return;
        }

        try {
            // Create the order in Firestore
            const orderData = {
                // Customer info
                customerId: user.uid,
                customerName: userData?.displayName || userData?.name || user?.displayName || userData?.email || 'Customer',
                phoneNumber: phoneNumber.trim(),
                
                // Restaurant info
                restaurantId,
                restaurantName,
                restaurantImage,
                
                // Order items
                items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    options: item.options || {},
                    specialInstructions: item.specialInstructions || '',
                })),
                
                // Pricing
                subtotal,
                tax,
                deliveryFee,
                total,
                
                // Delivery info
                deliveryAddress: deliveryAddress.trim(),
                specialInstructions: specialInstructions.trim(),
                estimatedDeliveryTime: estimatedTime || 35,
            };

            const result = await createOrder(orderData);

            if (!result.success) {
                setIsPlacingOrder(false);
                showModal('Order Failed', result.error || 'Failed to place order. Please try again.');
                return;
            }

            // Clear cart after successful order
            clearCart();
            
            setIsPlacingOrder(false);
            
            // Navigate to order tracking with real order ID
            router.replace({
                pathname: '/(user)/order-tracking',
                params: { 
                    orderId: result.orderId,
                    success: 'true',
                },
            });
        } catch (error) {
            console.error('Error placing order:', error);
            setIsPlacingOrder(false);
            showModal('Order Failed', 'Something went wrong. Please try again.');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={[styles.backButton, { backgroundColor: theme.surface }]}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={hp('2.5%')} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                    Checkout
                </Text>
                <View style={{ width: hp('5%') }} />
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Order Summary */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="restaurant-outline" size={hp('2.5%')} color={theme.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                            Order from {restaurantName}
                        </Text>
                    </View>
                    
                    <View style={styles.orderSummary}>
                        <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
                            {itemCount} item {itemCount !== 1 ? 's' : ''} • £{subtotal.toFixed(2)}{" "}
                        </Text>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={[styles.editLink, { color: theme.primary }]}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Delivery Address */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="location-outline" size={hp('2.5%')} color={theme.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                            Delivery Address
                        </Text>
                    </View>
                    
                    <TextInput
                        style={[styles.input, { 
                            backgroundColor: theme.surfaceAlt,
                            color: theme.textPrimary,
                        }]}
                        placeholder="Enter your delivery address"
                        placeholderTextColor={theme.textMuted}
                        value={deliveryAddress}
                        onChangeText={setDeliveryAddress}
                        multiline
                    />
                </View>

                {/* Contact */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="call-outline" size={hp('2.5%')} color={theme.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                            Contact Number
                        </Text>
                    </View>
                    
                    <TextInput
                        style={[styles.input, { 
                            backgroundColor: theme.surfaceAlt,
                            color: theme.textPrimary,
                        }]}
                        placeholder="Enter your phone number"
                        placeholderTextColor={theme.textMuted}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                    />
                </View>

                {/* Special Instructions */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="chatbox-outline" size={hp('2.5%')} color={theme.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                            Delivery Instructions (Optional)
                        </Text>
                    </View>
                    
                    <TextInput
                        style={[styles.input, styles.textArea, { 
                            backgroundColor: theme.surfaceAlt,
                            color: theme.textPrimary,
                        }]}
                        placeholder="Any special delivery instructions..."
                        placeholderTextColor={theme.textMuted}
                        value={specialInstructions}
                        onChangeText={setSpecialInstructions}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                {/* Payment Method */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="cash-outline" size={hp('2.5%')} color={theme.primary} />
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                            Payment Method
                        </Text>
                    </View>
                    
                    <View style={[styles.paymentOption, { borderColor: theme.primary }]}>
                        <View style={styles.paymentLeft}>
                            <Ionicons name="cash" size={hp('3%')} color={theme.primary} />
                            <View>
                                <Text style={[styles.paymentTitle, { color: theme.textPrimary }]}>
                                    Cash on Delivery
                                </Text>
                                <Text style={[styles.paymentSubtitle, { color: theme.textMuted }]}>
                                    Pay when your order arrives
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="checkmark-circle" size={hp('3%')} color={theme.primary} />
                    </View>
                </View>

                {/* Price Breakdown */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: spacing.md }]}>
                        Price  
                    </Text>
                    
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Subtotal </Text>
                        <Text style={[styles.priceValue, { color: theme.textPrimary }]}>£{subtotal.toFixed(2)} </Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Tax </Text>
                        <Text style={[styles.priceValue, { color: theme.textPrimary }]}>£{tax.toFixed(2)} </Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>Delivery Fee </Text>
                        <Text style={[styles.priceValue, { color: theme.textPrimary }]}>
                            {deliveryFee > 0 ? `£${deliveryFee.toFixed(2)}` : 'Free' }{" "}
                        </Text>
                    </View>
                    <View style={[styles.priceRow, styles.totalRow, { borderTopColor: theme.border }]}>
                        <Text style={[styles.totalLabel, { color: theme.textPrimary }]}>Total </Text>
                        <Text style={[styles.totalValue, { color: theme.primary }]}>£{total.toFixed(2)} </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Place Order Button */}
            <View style={[styles.bottomContainer, { backgroundColor: theme.surface }]}>
                <TouchableOpacity 
                    style={styles.placeOrderButton}
                    onPress={handlePlaceOrder}
                    activeOpacity={0.8}
                    disabled={isPlacingOrder}
                >
                    <LinearGradient
                        colors={isPlacingOrder ? [theme.textMuted, theme.textMuted] : [theme.primary, theme.primaryLight]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.placeOrderGradient}
                    >
                        {isPlacingOrder ? (
                            <Text style={styles.placeOrderText}>Placing Order... </Text>
                        ) : (
                            <>
                                <Text style={styles.placeOrderText}>Place Order </Text>
                                <Text style={styles.placeOrderPrice}>£{total.toFixed(2)}</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <CustomModal
                visible={modalConfig.visible}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                primaryButtonText="OK"
                onPrimaryPress={hideModal}
                onClose={hideModal}
            />
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
    backButton: {
        width: hp('5%'),
        height: hp('5%'),
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.soft,
    },
    headerTitle: {
        fontSize: fontSize.title,
        fontWeight: fontWeight.bold,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: hp('15%'),
    },
    section: {
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        ...shadows.soft,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    orderSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryText: {
        fontSize: fontSize.body,
    },
    editLink: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
    },
    input: {
        padding: spacing.md,
        borderRadius: radius.lg,
        fontSize: fontSize.body,
    },
    textArea: {
        minHeight: hp('10%'),
        textAlignVertical: 'top',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 2,
    },
    paymentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    paymentTitle: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
    },
    paymentSubtitle: {
        fontSize: fontSize.caption,
        marginTop: hp('0.2%'),
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    priceLabel: {
        fontSize: fontSize.body,
    },
    priceValue: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
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
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.md,
        paddingBottom: hp('4%'),
        ...shadows.floating,
    },
    placeOrderButton: {
        borderRadius: radius.xl,
        overflow: 'hidden',
    },
    placeOrderGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        gap: spacing.md,
    },
    placeOrderText: {
        color: '#fff',
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    placeOrderPrice: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
});

export default CheckoutScreen;

