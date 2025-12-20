import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocation } from '../../contexts/LocationContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme';
import CustomModal from '../../components/CustomModal';

const SAVED_ADDRESSES_KEY = '@food_ordering_saved_addresses';

const SavedAddressesScreen = () => {
    const { theme } = useTheme();
    const router = useRouter();
    const { 
        address: currentAddress, 
        getCurrentLocation, 
        setManualLocation,
        setLocationCoords,
        loading: locationLoading 
    } = useLocation();

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddNew, setShowAddNew] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: '',
        address: '',
    });
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);

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

    const showModal = (config) => {
        setModalConfig({ ...modalConfig, visible: true, ...config });
    };

    const hideModal = () => {
        setModalConfig({ ...modalConfig, visible: false });
    };

    // Load saved addresses
    const loadAddresses = useCallback(async () => {
        try {
            const saved = await AsyncStorage.getItem(SAVED_ADDRESSES_KEY);
            if (saved) {
                setSavedAddresses(JSON.parse(saved));
            } else {
                setSavedAddresses([]);
            }
        } catch (e) {
            console.error('Error loading addresses:', e);
            setSavedAddresses([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadAddresses();
    }, [loadAddresses]);

    // Save addresses to storage
    const saveAddresses = async (addresses) => {
        try {
            await AsyncStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(addresses));
            setSavedAddresses(addresses);
        } catch (e) {
            console.error('Error saving addresses:', e);
            showModal({
                title: 'Error',
                message: 'Failed to save address. Please try again.',
                type: 'error',
                primaryButtonText: 'OK',
                secondaryButtonText: null,
                onPrimaryPress: hideModal,
            });
        }
    };

    // Handle using current location
    const handleUseCurrentLocation = async () => {
        const success = await getCurrentLocation();
        if (success) {
            router.back();
        }
    };

    // Handle selecting a saved address
    const handleSelectAddress = async (addr) => {
        if (addr.coordinates) {
            setLocationCoords(addr.coordinates, addr.address);
        } else {
            await setManualLocation(addr.address);
        }
        router.back();
    };

    // Handle adding new address
    const handleAddAddress = async () => {
        if (!newAddress.label.trim() || !newAddress.address.trim()) {
            showModal({
                title: 'Missing Info',
                message: 'Please enter both label and address',
                type: 'warning',
                primaryButtonText: 'OK',
                secondaryButtonText: null,
                onPrimaryPress: hideModal,
            });
            return;
        }

        setSaving(true);
        
        // Try to geocode the address
        const success = await setManualLocation(newAddress.address);
        
        if (success) {
            const newAddr = {
                id: editingId || Date.now().toString(),
                label: newAddress.label.trim(),
                address: newAddress.address.trim(),
            };
            
            let updated;
            if (editingId) {
                // Update existing address
                updated = savedAddresses.map(addr => 
                    addr.id === editingId ? newAddr : addr
                );
            } else {
                // Add new address
                updated = [...savedAddresses, newAddr];
            }
            
            await saveAddresses(updated);
            
            setNewAddress({ label: '', address: '' });
            setShowAddNew(false);
            setEditingId(null);
        } else {
            showModal({
                title: 'Invalid Address',
                message: 'Could not find this address. Please try again.',
                type: 'error',
                primaryButtonText: 'OK',
                secondaryButtonText: null,
                onPrimaryPress: hideModal,
            });
        }
        
        setSaving(false);
    };

    // Handle editing an address
    const handleEditAddress = (addr) => {
        setNewAddress({
            label: addr.label,
            address: addr.address,
        });
        setEditingId(addr.id);
        setShowAddNew(true);
    };

    // Handle deleting an address
    const handleDeleteAddress = (addressId) => {
        showModal({
            title: 'Delete Address',
            message: 'Are you sure you want to delete this address?',
            type: 'warning',
            primaryButtonText: 'Delete',
            secondaryButtonText: 'Cancel',
            onSecondaryPress: hideModal,
            onPrimaryPress: async () => {
                hideModal();
                const updated = savedAddresses.filter(a => a.id !== addressId);
                await saveAddresses(updated);
            },
        });
    };

    const handleCancelEdit = () => {
        setShowAddNew(false);
        setEditingId(null);
        setNewAddress({ label: '', address: '' });
    };

    const getLabelIcon = (label) => {
        const lower = label.toLowerCase();
        if (lower.includes('home')) return 'home-outline';
        if (lower.includes('work') || lower.includes('office')) return 'briefcase-outline';
        return 'location-outline';
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadAddresses();
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header]}>
                <TouchableOpacity 
                    onPress={() => router.back()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={hp('2.4%')} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                    Saved Addresses
                </Text>
                <View style={styles.backButton} />
            </View>

            {showAddNew ? (
                // Add/Edit Address Form
                <ScrollView 
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.formContainer}>
                        <Text style={[styles.formTitle, { color: theme.textPrimary }]}>
                            {editingId ? 'Edit Address' : 'Add New Address'}
                        </Text>

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
                                onPress={handleCancelEdit}
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
                                    <Text style={styles.saveBtnText}>
                                        {editingId ? 'Update Address' : 'Save Address'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            ) : (
                // Address List
                <ScrollView 
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.primary}
                            colors={[theme.primary]}
                        />
                    }
                >
                    {/* Current Location */}
                    <TouchableOpacity 
                        style={[styles.addressItem, { backgroundColor: `${theme.primary}10` }]}
                        onPress={handleUseCurrentLocation}
                        disabled={locationLoading}
                        activeOpacity={0.7}
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
                                Detect your location automatically
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={hp('2%')} color={theme.textMuted} />
                    </TouchableOpacity>

                    {/* Saved Addresses */}
                    {savedAddresses.length > 0 && (
                        <View style={styles.savedSection}>
                            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
                                SAVED ADDRESSES
                            </Text>
                            
                            {savedAddresses.map((addr) => (
                                <View 
                                    key={addr.id}
                                    style={[styles.addressItem, { backgroundColor: theme.surface }]}
                                >
                                    <View style={[styles.addressIcon, { backgroundColor: theme.surfaceAlt }]}>
                                        <Ionicons 
                                            name={getLabelIcon(addr.label)} 
                                            size={hp('2%')} 
                                            color={theme.primary} 
                                        />
                                    </View>
                                    <TouchableOpacity 
                                        style={styles.addressContent}
                                        onPress={() => handleSelectAddress(addr)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.addressLabel, { color: theme.textPrimary }]}>
                                            {addr.label}
                                        </Text>
                                        <Text style={[styles.addressText, { color: theme.textMuted }]} numberOfLines={2}>
                                            {addr.address}
                                        </Text>
                                    </TouchableOpacity>
                                    <View style={styles.addressActions}>
                                        <TouchableOpacity 
                                            onPress={() => handleEditAddress(addr)}
                                            style={styles.actionButton}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <Ionicons name="pencil-outline" size={hp('2%')} color={theme.primary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            onPress={() => handleDeleteAddress(addr.id)}
                                            style={styles.actionButton}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <Ionicons name="trash-outline" size={hp('2%')} color={theme.error} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Empty State */}
                    {savedAddresses.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="location-outline" size={hp('8%')} color={theme.textMuted} />
                            <Text style={[styles.emptyStateText, { color: theme.textMuted }]}>
                                No saved addresses yet
                            </Text>
                            <Text style={[styles.emptyStateSubtext, { color: theme.textMuted }]}>
                                Add an address to get started
                            </Text>
                        </View>
                    )}

                    {/* Add New Button */}
                    <TouchableOpacity 
                        style={[styles.addNewBtn, { borderColor: theme.primary }]}
                        onPress={() => setShowAddNew(true)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={hp('2.5%')} color={theme.primary} />
                        <Text style={[styles.addNewText, { color: theme.primary }]}>
                            Add New Address
                        </Text>
                    </TouchableOpacity>

                    <View style={{ height: hp('4%') }} />
                </ScrollView>
            )}

            <CustomModal
                visible={modalConfig.visible}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                primaryButtonText={modalConfig.primaryButtonText}
                secondaryButtonText={modalConfig.secondaryButtonText}
                onPrimaryPress={modalConfig.onPrimaryPress}
                onSecondaryPress={modalConfig.onSecondaryPress}
                onClose={hideModal}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    backButton: {
        width: hp('4.5%'),
        height: hp('4.5%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
    },
    scrollView: {
        flex: 1,
    },
    formContainer: {
        padding: spacing.md,
    },
    formTitle: {
        fontSize: fontSize.title,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.lg,
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
    addressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.sm,
        marginHorizontal: spacing.md,
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
    addressActions: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginLeft: spacing.sm,
    },
    actionButton: {
        padding: spacing.xs,
    },
    savedSection: {
        marginTop: spacing.md,
    },
    sectionTitle: {
        fontSize: hp('1.2%'),
        fontWeight: fontWeight.semibold,
        letterSpacing: 0.5,
        marginBottom: spacing.sm,
        marginHorizontal: spacing.md,
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
        marginHorizontal: spacing.md,
        gap: spacing.sm,
    },
    addNewText: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp('10%'),
        paddingHorizontal: spacing.lg,
    },
    emptyStateText: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.semibold,
        marginTop: spacing.md,
    },
    emptyStateSubtext: {
        fontSize: fontSize.body,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
});

export default SavedAddressesScreen;

