import React, { useState, useRef, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
    ScrollView,
    TextInput,
    Animated,
    PanResponder,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../../constants/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_THRESHOLD = 100;

const MenuItemModal = ({ 
    visible, 
    item, 
    restaurant,
    onClose, 
    onAddToCart 
}) => {
    const { theme } = useTheme();
    const [quantity, setQuantity] = useState(1);
    const [specialInstructions, setSpecialInstructions] = useState('');
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const [isClosing, setIsClosing] = useState(false);

    // Animate in when visible changes to true
    useEffect(() => {
        if (visible && !isClosing) {
            translateY.setValue(SCREEN_HEIGHT);
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 65,
                friction: 11,
            }).start();
        }
    }, [visible, isClosing]);

    const handleClose = () => {
        setIsClosing(true);
        Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setQuantity(1);
            setSpecialInstructions('');
            setIsClosing(false);
            onClose();
        });
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 5;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > DISMISS_THRESHOLD || gestureState.vy > 0.5) {
                    handleClose();
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 100,
                        friction: 10,
                    }).start();
                }
            },
        })
    ).current;

    if (!item) return null;

    const handleAddToCart = () => {
        onAddToCart({
            ...item,
            quantity,
            specialInstructions: specialInstructions.trim(),
        });
        handleClose();
    };

    const totalPrice = (item.price * quantity).toFixed(2);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={styles.overlayTouchable} />
                </TouchableWithoutFeedback>
                
                <Animated.View 
                    style={[
                        styles.modalContent, 
                        { 
                            backgroundColor: theme.surface,
                            transform: [{ translateY }],
                        }
                    ]}
                >
                    {/* Drag Handle Area */}
                    <View {...panResponder.panHandlers} style={styles.dragHandleArea}>
                        <View style={[styles.dragHandle, { backgroundColor: theme.border }]} />
                    </View>

                    {/* Close Button */}
                    <TouchableOpacity 
                        style={[styles.closeBtn, { backgroundColor: theme.surfaceAlt }]}
                        onPress={handleClose}
                    >
                        <Ionicons name="close" size={hp('2.5%')} color={theme.textPrimary} />
                    </TouchableOpacity>

                    <ScrollView 
                        showsVerticalScrollIndicator={false}
                        bounces={true}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Image */}
                        <Image 
                            source={{ uri: item.imageUrl || item.image }} 
                            style={styles.itemImage}
                            defaultSource={require('../../assets/icon.png')}
                        />

                        {/* Content */}
                        <View style={styles.content}>
                            {/* Name & Price */}
                            <View style={styles.headerRow}>
                                <Text style={[styles.itemName, { color: theme.textPrimary }]}>
                                    {item.name}
                                </Text>
                                <Text style={[styles.itemPrice, { color: theme.primary }]}>
                                    ${item.price.toFixed(2)}
                                </Text>
                            </View>

                            {/* Restaurant */}
                            {restaurant && (
                                <View style={styles.restaurantRow}>
                                    <Ionicons name="restaurant-outline" size={hp('1.6%')} color={theme.textMuted} />
                                    <Text style={[styles.restaurantName, { color: theme.textMuted }]}>
                                        {restaurant.name}
                                    </Text>
                                </View>
                            )}

                            {/* Description */}
                            <Text style={[styles.description, { color: theme.textSecondary }]}>
                                {item.description}
                            </Text>

                            {/* Category Badge */}
                            {item.category && (
                                <View style={[styles.categoryBadge, { backgroundColor: `${theme.primary}15` }]}>
                                    <Text style={[styles.categoryText, { color: theme.primary }]}>
                                        {item.category}
                                    </Text>
                                </View>
                            )}

                            {/* Divider */}
                            <View style={[styles.divider, { backgroundColor: theme.border }]} />

                            {/* Special Instructions */}
                            <View style={styles.instructionsSection}>
                                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                                    Special Instructions
                                </Text>
                                <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
                                    Any allergies or preferences?
                                </Text>
                                <TextInput
                                    style={[styles.instructionsInput, { 
                                        backgroundColor: theme.surfaceAlt,
                                        color: theme.textPrimary,
                                    }]}
                                    placeholder="e.g. No onions, extra sauce..."
                                    placeholderTextColor={theme.textMuted}
                                    value={specialInstructions}
                                    onChangeText={setSpecialInstructions}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            {/* Quantity */}
                            <View style={styles.quantitySection}>
                                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                                    Quantity
                                </Text>
                                <View style={styles.quantityControls}>
                                    <TouchableOpacity
                                        style={[
                                            styles.qtyBtn,
                                            { 
                                                backgroundColor: quantity > 1 ? theme.surfaceAlt : theme.border,
                                            }
                                        ]}
                                        onPress={() => quantity > 1 && setQuantity(q => q - 1)}
                                        disabled={quantity <= 1}
                                    >
                                        <Ionicons 
                                            name="remove" 
                                            size={hp('2.5%')} 
                                            color={quantity > 1 ? theme.textPrimary : theme.textMuted} 
                                        />
                                    </TouchableOpacity>
                                    
                                    <Text style={[styles.qtyText, { color: theme.textPrimary }]}>
                                        {quantity}
                                    </Text>
                                    
                                    <TouchableOpacity
                                        style={[styles.qtyBtn, { backgroundColor: theme.primary }]}
                                        onPress={() => setQuantity(q => q + 1)}
                                    >
                                        <Ionicons name="add" size={hp('2.5%')} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Add to Cart Button */}
                    <View style={[styles.footer, { borderTopColor: theme.border }]}>
                        <TouchableOpacity 
                            style={[styles.addToCartBtn, { backgroundColor: theme.primary }]}
                            onPress={handleAddToCart}
                        >
                            <Text style={styles.addToCartText}>Add to Cart</Text>
                            <View style={styles.priceTag}>
                                <Text style={styles.priceTagText}>${totalPrice}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    overlayTouchable: {
        flex: 1,
    },
    modalContent: {
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        maxHeight: hp('85%'),
    },
    dragHandleArea: {
        alignItems: 'center',
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
        width: '100%',
    },
    dragHandle: {
        width: wp('12%'),
        height: 5,
        borderRadius: 3,
    },
    closeBtn: {
        position: 'absolute',
        top: spacing.md + 25,
        right: spacing.md,
        zIndex: 10,
        width: hp('4%'),
        height: hp('4%'),
        borderRadius: hp('2%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemImage: {
        width: '100%',
        height: hp('25%'),
        resizeMode: 'cover',
    },
    content: {
        padding: spacing.lg,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    itemName: {
        fontSize: fontSize.title,
        fontWeight: fontWeight.bold,
        flex: 1,
        marginRight: spacing.md,
    },
    itemPrice: {
        fontSize: fontSize.title,
        fontWeight: fontWeight.bold,
    },
    restaurantRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp('1%'),
        marginBottom: spacing.md,
    },
    restaurantName: {
        fontSize: fontSize.caption,
    },
    description: {
        fontSize: fontSize.body,
        lineHeight: hp('2.8%'),
        marginBottom: spacing.md,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.sm,
        paddingVertical: hp('0.4%'),
        borderRadius: radius.pill,
        marginBottom: spacing.md,
    },
    categoryText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
    },
    divider: {
        height: 1,
        marginVertical: spacing.md,
    },
    instructionsSection: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
        marginBottom: hp('0.3%'),
    },
    sectionSubtitle: {
        fontSize: fontSize.caption,
        marginBottom: spacing.sm,
    },
    instructionsInput: {
        padding: spacing.md,
        borderRadius: radius.lg,
        fontSize: fontSize.body,
        minHeight: hp('10%'),
        textAlignVertical: 'top',
    },
    quantitySection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    qtyBtn: {
        width: hp('5%'),
        height: hp('5%'),
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyText: {
        fontSize: fontSize.title,
        fontWeight: fontWeight.bold,
        minWidth: wp('10%'),
        textAlign: 'center',
    },
    footer: {
        padding: spacing.md,
        paddingBottom: hp('4%'),
        borderTopWidth: 1,
    },
    addToCartBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.xl,
    },
    addToCartText: {
        color: '#fff',
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
    priceTag: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: spacing.md,
        paddingVertical: hp('0.4%'),
        borderRadius: radius.pill,
    },
    priceTagText: {
        color: '#fff',
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
});

export default MenuItemModal;
