import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Animated,
    PanResponder,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocation } from '../../contexts/LocationContext';
import { spacing, fontSize, fontWeight, radius } from '../../constants/theme';
import CustomModal from '../CustomModal';

const SAVED_ADDRESSES_KEY = '@food_ordering_saved_addresses';
const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_THRESHOLD = 100;

const AddressModal = ({ visible, onClose }) => {
    const { theme } = useTheme();
    const { 
        address: currentAddress, 
        getCurrentLocation, 
        setManualLocation,
        setLocationCoords,
        loading: locationLoading 
    } = useLocation();

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [showAddNew, setShowAddNew] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: '',
        address: '',
    });
    const [saving, setSaving] = useState(false);
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
    
    // Modal states
    const [modalConfig, setModalConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        primaryButtonText: 'OK',
        secondaryButtonText: null,
        onPrimaryPress: null,
        onSecondaryPress: null,
    });

    const showCustomModal = (config) => {
        setModalConfig({ ...modalConfig, visible: true, ...config });
    };

    const hideCustomModal = () => {
        setModalConfig({ ...modalConfig, visible: false });
    };

    // Load saved addresses
    useEffect(() => {
        const loadAddresses = async () => {
            try {
                const saved = await AsyncStorage.getItem(SAVED_ADDRESSES_KEY);
                if (saved) {
                    setSavedAddresses(JSON.parse(saved));
                }
            } catch (e) {
                console.error('Error loading addresses:', e);
            }
        };
        if (visible) {
            loadAddresses();
        }
    }, [visible]);

    // Save addresses to storage
    const saveAddresses = async (addresses) => {
        try {
            await AsyncStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(addresses));
            setSavedAddresses(addresses);
        } catch (e) {
            console.error('Error saving addresses:', e);
        }
    };

    // Handle using current location
    const handleUseCurrentLocation = async () => {
        const success = await getCurrentLocation();
        if (success) {
            handleClose();
        }
    };

    // Handle selecting a saved address
    const handleSelectAddress = async (addr) => {
        if (addr.coordinates) {
            setLocationCoords(addr.coordinates, addr.address);
        } else {
            await setManualLocation(addr.address);
        }
        handleClose();
    };

    // Handle adding new address
    const handleAddAddress = async () => {
        if (!newAddress.label.trim() || !newAddress.address.trim()) {
            showCustomModal({
                title: 'Missing Info',
                message: 'Please enter both label and address',
                type: 'warning',
                primaryButtonText: 'OK',
                secondaryButtonText: null,
                onPrimaryPress: hideCustomModal,
            });
            return;
        }

        setSaving(true);
        
        // Try to geocode the address
        const success = await setManualLocation(newAddress.address);
        
        if (success) {
            const newAddr = {
                id: Date.now().toString(),
                label: newAddress.label.trim(),
                address: newAddress.address.trim(),
            };
            
            const updated = [...savedAddresses, newAddr];
            await saveAddresses(updated);
            
            setNewAddress({ label: '', address: '' });
            setShowAddNew(false);
            handleClose();
        } else {
            showCustomModal({
                title: 'Invalid Address',
                message: 'Could not find this address. Please try again.',
                type: 'error',
                primaryButtonText: 'OK',
                secondaryButtonText: null,
                onPrimaryPress: hideCustomModal,
            });
        }
        
        setSaving(false);
    };

    // Handle deleting an address
    const handleDeleteAddress = (addressId) => {
        showCustomModal({
            title: 'Delete Address',
            message: 'Are you sure you want to delete this address?',
            type: 'warning',
            primaryButtonText: 'Delete',
            secondaryButtonText: 'Cancel',
            onSecondaryPress: hideCustomModal,
            onPrimaryPress: async () => {
                hideCustomModal();
                const updated = savedAddresses.filter(a => a.id !== addressId);
                await saveAddresses(updated);
            },
        });
    };

    const getLabelIcon = (label) => {
        const lower = label.toLowerCase();
        if (lower.includes('home')) return 'home-outline';
        if (lower.includes('work') || lower.includes('office')) return 'briefcase-outline';
        return 'location-outline';
    };

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
                        <View style={[styles.handle, { backgroundColor: theme.border }]} />
                    </View>
                    
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                            {showAddNew ? 'Add New Address' : 'Delivery Address'}
                        </Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={hp('3%')} color={theme.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {showAddNew ? (
                        // Add New Address Form
                        <ScrollView 
                            style={styles.formContainer}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                                    Label
                                </Text>
                                <TextInput
                                    style={[styles.input, { 
                                        backgroundColor: theme.surfaceAlt,
                                        color: theme.textPrimary,
                                    }]}
                                    placeholder="e.g. Home, Work, Gym"
                                    placeholderTextColor={theme.textMuted}
                                    value={newAddress.label}
                                    onChangeText={(text) => setNewAddress(p => ({ ...p, label: text }))}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                                    Full Address
                                </Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, { 
                                        backgroundColor: theme.surfaceAlt,
                                        color: theme.textPrimary,
                                    }]}
                                    placeholder="Enter your full delivery address"
                                    placeholderTextColor={theme.textMuted}
                                    value={newAddress.address}
                                    onChangeText={(text) => setNewAddress(p => ({ ...p, address: text }))}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <View style={styles.formButtons}>
                                <TouchableOpacity 
                                    style={[styles.cancelBtn, { borderColor: theme.border }]}
                                    onPress={() => {
                                        setShowAddNew(false);
                                        setNewAddress({ label: '', address: '' });
                                    }}
                                >
                                    <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                                    onPress={handleAddAddress}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.saveBtnText}>Save Address</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    ) : (
                        // Address List
                        <ScrollView 
                            style={styles.scrollView}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Current Location */}
                            <TouchableOpacity 
                                style={[styles.addressItem, { backgroundColor: `${theme.primary}10` }]}
                                onPress={handleUseCurrentLocation}
                                disabled={locationLoading}
                            >
                                <View style={[styles.addressIcon, { backgroundColor: theme.primary }]}>
                                    {locationLoading ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Ionicons name="navigate" size={hp('2%')} color="#fff" />
                                    )}
                                </View>
                                <View style={styles.addressContent}>
                                    <Text style={[styles.addressLabel, { color: theme.primary }]}>
                                        Use Current Location
                                    </Text>
                                    <Text style={[styles.addressText, { color: theme.textMuted }]}>
                                        Detect your location 
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* Saved Addresses */}
                            {savedAddresses.length > 0 && (
                                <View style={styles.savedSection}>
                                    <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                                        SAVED ADDRESSES
                                    </Text>
                                    
                                    {savedAddresses.map((addr) => (
                                        <TouchableOpacity 
                                            key={addr.id}
                                            style={[styles.addressItem, { backgroundColor: theme.surfaceAlt }]}
                                            onPress={() => handleSelectAddress(addr)}
                                        >
                                            <View style={[styles.addressIcon, { backgroundColor: theme.surface }]}>
                                                <Ionicons 
                                                    name={getLabelIcon(addr.label)} 
                                                    size={hp('2%')} 
                                                    color={theme.primary} 
                                                />
                                            </View>
                                            <View style={styles.addressContent}>
                                                <Text style={[styles.addressLabel, { color: theme.textPrimary }]}>
                                                    {addr.label}
                                                </Text>
                                                <Text style={[styles.addressText, { color: theme.textMuted }]} numberOfLines={2}>
                                                    {addr.address}
                                                </Text>
                                            </View>
                                            <TouchableOpacity 
                                                onPress={() => handleDeleteAddress(addr.id)}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                <Ionicons name="trash-outline" size={hp('2%')} color={theme.error} />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Add New Button */}
                            <TouchableOpacity 
                                style={[styles.addNewBtn, { borderColor: theme.primary }]}
                                onPress={() => setShowAddNew(true)}
                            >
                                <Ionicons name="add" size={hp('2.5%')} color={theme.primary} />
                                <Text style={[styles.addNewText, { color: theme.primary }]}>
                                    Add New Address
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </Animated.View>
            </View>

            <CustomModal
                visible={modalConfig.visible}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                primaryButtonText={modalConfig.primaryButtonText}
                secondaryButtonText={modalConfig.secondaryButtonText}
                onPrimaryPress={modalConfig.onPrimaryPress}
                onSecondaryPress={modalConfig.onSecondaryPress}
                onClose={hideCustomModal}
            />
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
        paddingBottom: hp('4%'),
        maxHeight: hp('70%'),
    },
    dragHandleArea: {
        alignItems: 'center',
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
        width: '100%',
    },
    handle: {
        width: wp('12%'),
        height: 5,
        borderRadius: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    headerTitle: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
    },
    scrollView: {
        paddingHorizontal: spacing.md,
    },
    addressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.sm,
    },
    addressIcon: {
        width: hp('4.5%'),
        height: hp('4.5%'),
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    addressContent: {
        flex: 1,
    },
    addressLabel: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
        marginBottom: hp('0.2%'),
    },
    addressText: {
        fontSize: fontSize.caption,
    },
    savedSection: {
        marginTop: spacing.md,
    },
    sectionTitle: {
        fontSize: hp('1.2%'),
        fontWeight: fontWeight.semibold,
        letterSpacing: 0.5,
        marginBottom: spacing.sm,
    },
    addNewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 2,
        borderStyle: 'dashed',
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    addNewText: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
    },

    // Form styles
    formContainer: {
        paddingHorizontal: spacing.md,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    inputLabel: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.xs,
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
    formButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md,
    },
    cancelBtn: {
        flex: 1,
        padding: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 1,
        alignItems: 'center',
    },
    cancelBtnText: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
    },
    saveBtn: {
        flex: 1,
        padding: spacing.md,
        borderRadius: radius.lg,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#fff',
        fontSize: fontSize.body,
        fontWeight: fontWeight.bold,
    },
});

export default AddressModal;
