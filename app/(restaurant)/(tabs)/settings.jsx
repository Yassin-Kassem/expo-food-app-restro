import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CustomModal from '../../../components/CustomModal';
import CustomToggle from '../../../components/CustomToggle';
import { signOut } from '../../../services/authService';
import { useAuth } from '../../../hooks/useAuth';
import { useRestaurant } from '../../../hooks/useRestaurant';
import { listenAppSettings, updateAppSettings } from '../../../services/settingsService';

export default function SettingsScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { user } = useAuth();
    const { restaurant, loading: restaurantLoading } = useRestaurant(user?.uid);
    
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [printerModalVisible, setPrinterModalVisible] = useState(false);
    const [helpModalVisible, setHelpModalVisible] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [errorModal, setErrorModal] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'error',
        retryable: false,
        errorCode: null
    });

    // Format operating hours
    const formatOperatingHours = () => {
        if (!restaurant?.hours) return 'Not set';
        
        const hours = restaurant.hours;
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todayHours = hours[today];
        
        if (todayHours && todayHours.isOpen) {
            return `${todayHours.open} - ${todayHours.close}`;
        }
        
        // Find first open day
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        for (const day of days) {
            if (hours[day]?.isOpen) {
                return `${hours[day].open} - ${hours[day].close}`;
            }
        }
        
        return 'Not set';
    };

    // Load app settings
    useEffect(() => {
        if (!user?.uid) return;

        const unsubscribe = listenAppSettings((result) => {
            if (result.success) {
                setNotificationsEnabled(result.data.notificationsEnabled);
            }
            setSettingsLoading(false);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user?.uid]);

    const handleLogout = () => {
        setLogoutModalVisible(true);
    };

    const getModalConfig = (errorCode, retryable) => {
        // Determine modal type and title based on error code
        let type = 'error';
        let title = 'Logout Failed';
        
        if (errorCode === 'NETWORK_ERROR' || retryable) {
            type = 'warning';
            title = 'Connection Issue';
        }
        
        return { type, title };
    };

    const confirmLogout = async () => {
        if (signingOut) return;
        
        setSigningOut(true);
        const result = await signOut();
        
        if (result.success) {
            setLogoutModalVisible(false);
            router.replace('/login');
        } else {
            setSigningOut(false);
            setLogoutModalVisible(false);
            
            const config = getModalConfig(result.errorCode, result.retryable || false);
            
            setErrorModal({
                visible: true,
                title: config.title,
                message: result.error || 'Failed to sign out. Please try again.',
                type: config.type,
                retryable: result.retryable || false,
                errorCode: result.errorCode
            });
        }
    };

    const handleRetryLogout = () => {
        setErrorModal({ ...errorModal, visible: false });
        setLogoutModalVisible(true);
    };

    const handleCloseErrorModal = () => {
        setErrorModal({ ...errorModal, visible: false });
    };

    const handleNotificationToggle = async () => {
        const newValue = !notificationsEnabled;
        // Optimistic update
        setNotificationsEnabled(newValue);
        
        const result = await updateAppSettings({ notificationsEnabled: newValue });
        if (!result.success && !result.retryable) {
            // Revert on non-retryable error
            setNotificationsEnabled(!newValue);
            // Could show error toast here
            // showErrorToast(result.error);
        }
    };

    const handleBusinessInfo = () => {
        router.push('/settings/edit-business-info');
    };

    const handleLocation = () => {
        router.push('/settings/edit-location');
    };

    const handleOperatingHours = () => {
        router.push('/settings/edit-hours');
    };

    const SettingsSection = ({ title, children }) => {
        const childrenArray = React.Children.toArray(children);
        const childrenWithProps = React.Children.map(childrenArray, (child, index) => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                    isLast: index === childrenArray.length - 1
                });
            }
            return child;
        });

        return (
            <View style={styles.section}>
                {title && (
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                        {title}
                    </Text>
                )}
                <View style={[styles.sectionContent, { backgroundColor: theme.surface }, shadows.soft]}>
                    {childrenWithProps}
                </View>
            </View>
        );
    };

    const SettingsItem = ({ 
        icon, 
        label, 
        value, 
        onPress, 
        isDestructive, 
        showChevron = true,
        showToggle = false,
        toggleValue = false,
        onToggleChange,
        loading = false,
        isLast = false
    }) => (
        <TouchableOpacity
            style={[
                styles.item, 
                { borderBottomColor: theme.border },
                (isDestructive || isLast) && { borderBottomWidth: 0 }
            ]}
            onPress={showToggle ? undefined : onPress}
            activeOpacity={0.7}
            disabled={showToggle || loading}
        >
            <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: isDestructive ? '#EF444420' : `${theme.primary}15` }]}>
                    <Ionicons
                        name={icon}
                        size={20}
                        color={isDestructive ? '#EF4444' : theme.primary}
                    />
                </View>
                <View style={styles.itemTextContainer}>
                    <Text style={[
                        styles.itemLabel,
                        { color: isDestructive ? '#EF4444' : theme.textPrimary }
                    ]}>
                        {label}
                    </Text>
                    {value && (
                        <Text style={[styles.itemValue, { color: theme.textSecondary }]} numberOfLines={1}>
                            {value}
                        </Text>
                    )}
                </View>
            </View>
            <View style={styles.itemRight}>
                {showToggle ? (
                    loading ? (
                        <ActivityIndicator size="small" color={theme.primary} />
                    ) : (
                        <CustomToggle
                            value={toggleValue}
                            onValueChange={onToggleChange}
                        />
                    )
                ) : (
                    <>
                        {value && !showChevron && (
                            <Text style={[styles.itemValue, { color: theme.textSecondary, marginRight: spacing.sm }]}>
                                {value}
                            </Text>
                        )}
                        {showChevron && (
                            <Ionicons 
                                name="chevron-forward" 
                                size={18} 
                                color={theme.textMuted} 
                            />
                        )}
                    </>
                )}
            </View>
        </TouchableOpacity>
    );

    const isLoading = restaurantLoading || settingsLoading;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>Settings</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Manage your restaurant and app preferences
                    </Text>
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.primary} />
                    </View>
                ) : (
                    <>
                        <SettingsSection title="Restaurant">
                            <SettingsItem
                                icon="storefront-outline"
                                label="Business Info"
                                value={restaurant?.name || 'Not set'}
                                onPress={handleBusinessInfo}
                            />
                            <SettingsItem
                                icon="location-outline"
                                label="Location"
                                value={restaurant?.address || 'Not set'}
                                onPress={handleLocation}
                            />
                            <SettingsItem
                                icon="time-outline"
                                label="Operating Hours"
                                value={formatOperatingHours()}
                                onPress={handleOperatingHours}
                            />
                        </SettingsSection>

                        <SettingsSection title="App Settings">
                            <SettingsItem
                                icon="notifications-outline"
                                label="Notifications"
                                value="Order alerts and updates"
                                showToggle={true}
                                toggleValue={notificationsEnabled}
                                onToggleChange={handleNotificationToggle}
                            />
                            <SettingsItem
                                icon="print-outline"
                                label="Printer Settings"
                                value="Configure receipt printer"
                                onPress={() => setPrinterModalVisible(true)}
                            />
                        </SettingsSection>

                        <SettingsSection title="Account">
                            <SettingsItem
                                icon="help-circle-outline"
                                label="Help & Support"
                                value="Get help and contact us"
                                onPress={() => setHelpModalVisible(true)}
                            />
                            <SettingsItem
                                icon="log-out-outline"
                                label="Logout"
                                isDestructive
                                showChevron={false}
                                onPress={handleLogout}
                            />
                        </SettingsSection>

                        <Text style={[styles.version, { color: theme.textMuted }]}>
                            Version 1.0.0
                        </Text>
                    </>
                )}
            </ScrollView>

            {/* Logout Modal */}
            <CustomModal
                visible={logoutModalVisible}
                title="Logout"
                message="Are you sure you want to logout?"
                type="warning"
                primaryButtonText={signingOut ? "Logging out..." : "Logout"}
                onPrimaryPress={confirmLogout}
                secondaryButtonText={signingOut ? undefined : "Cancel"}
                onSecondaryPress={signingOut ? undefined : () => setLogoutModalVisible(false)}
                onClose={signingOut ? undefined : () => setLogoutModalVisible(false)}
            />

            {/* Printer Settings Modal */}
            <CustomModal
                visible={printerModalVisible}
                title="Printer Settings"
                message="Printer settings will be available in a future update. You'll be able to connect and configure receipt printers for automatic order printing."
                type="info"
                primaryButtonText="Got it"
                onPrimaryPress={() => setPrinterModalVisible(false)}
                onClose={() => setPrinterModalVisible(false)}
            />

            {/* Help & Support Modal */}
            <CustomModal
                visible={helpModalVisible}
                title="Help & Support"
                message="Need help? Contact our support team at support@foodapp.com or visit our help center for guides and FAQs."
                type="info"
                primaryButtonText="Close"
                onPrimaryPress={() => setHelpModalVisible(false)}
                onClose={() => setHelpModalVisible(false)}
            />

            {/* Error Modal */}
            <CustomModal
                visible={errorModal.visible}
                title={errorModal.title}
                message={errorModal.message}
                type={errorModal.type}
                primaryButtonText={errorModal.retryable ? "Retry" : "OK"}
                onPrimaryPress={errorModal.retryable ? handleRetryLogout : handleCloseErrorModal}
                onClose={handleCloseErrorModal}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: spacing.xl,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    header: {
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: fontSize.titleXL,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: fontSize.body,
        lineHeight: fontSize.body * 1.5,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    sectionContent: {
        borderRadius: radius.lg,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        minHeight: 64,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    itemTextContainer: {
        flex: 1,
    },
    itemLabel: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
        marginBottom: spacing.xs / 2,
    },
    itemValue: {
        fontSize: fontSize.caption,
        marginTop: 2,
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loadingContainer: {
        paddingVertical: spacing.xxl,
        alignItems: 'center',
    },
    version: {
        textAlign: 'center',
        fontSize: fontSize.caption,
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    }
});
