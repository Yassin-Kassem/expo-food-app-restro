import React, { useState } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity,
    Switch,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme';
import CustomToggle from "../../components/CustomToggle";
import CustomModal from "../../components/CustomModal";

const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    color, 
    isDestructive,
    showArrow = true,
    rightComponent,
}) => {
    const { theme } = useTheme();
    const iconColor = isDestructive ? theme.error : (color || theme.primary);
    
    return (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <View style={[styles.settingIcon, { backgroundColor: `${iconColor}15` }]}>
                <Ionicons name={icon} size={hp('2.2%')} color={iconColor} />
            </View>
            <View style={styles.settingContent}>
                <Text style={[
                    styles.settingTitle, 
                    { color: isDestructive ? theme.error : theme.textPrimary }
                ]}>
                    {title}
                </Text>
                {subtitle && (
                    <Text style={[styles.settingSubtitle, { color: theme.textMuted }]}>
                        {subtitle}
                    </Text>
                )}
            </View>
            {rightComponent || (showArrow && onPress && (
                <Ionicons name="chevron-forward" size={hp('2%')} color={theme.textMuted} />
            ))}
        </TouchableOpacity>
    );
};

const SectionHeader = ({ title }) => {
    const { theme } = useTheme();
    return (
        <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>
            {title}
        </Text>
    );
};

export default function SettingsScreen() {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const { user, userData, logout } = useAuth();
    const router = useRouter();
    
    const [loggingOut, setLoggingOut] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    
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

    const handleLogout = () => {
        showModal({
            title: 'Log Out',
            message: 'Are you sure you want to log out?',
            type: 'warning',
            primaryButtonText: 'Log Out',
            secondaryButtonText: 'Cancel',
            onSecondaryPress: hideModal,
            onPrimaryPress: async () => {
                hideModal();
                setLoggingOut(true);
                try {
                    const result = await logout();
                    if (result.success) {
                        router.replace('/(auth)/login');
                    } else {
                        showModal({
                            title: 'Error',
                            message: result.error || 'Failed to log out',
                            type: 'error',
                            primaryButtonText: 'OK',
                            secondaryButtonText: null,
                            onPrimaryPress: hideModal,
                        });
                    }
                } catch (error) {
                    showModal({
                        title: 'Error',
                        message: 'Something went wrong. Please try again.',
                        type: 'error',
                        primaryButtonText: 'OK',
                        secondaryButtonText: null,
                        onPrimaryPress: hideModal,
                    });
                } finally {
                    setLoggingOut(false);
                }
            },
        });
    };

    const handleDeleteAccount = () => {
        showModal({
            title: 'Delete Account',
            message: 'Are you sure you want to delete your account? This action cannot be undone.',
            type: 'warning',
            primaryButtonText: 'Delete',
            secondaryButtonText: 'Cancel',
            onSecondaryPress: hideModal,
            onPrimaryPress: () => {
                hideModal();
                // TODO: Implement account deletion
                showModal({
                    title: 'Coming Soon',
                    message: 'Account deletion will be available soon.',
                    type: 'info',
                    primaryButtonText: 'OK',
                    secondaryButtonText: null,
                    onPrimaryPress: hideModal,
                });
            },
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => router.back()}
                    style={[styles.backButton, { backgroundColor: theme.surface }]}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={hp('2.4%')} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Settings</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Account Section */}
                <SectionHeader title="ACCOUNT" />
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <SettingItem
                        icon="person-outline"
                        title="Edit Profile"
                        subtitle={user?.displayName || user?.email}
                        onPress={() => router.push('/(settings)/profile')}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon="lock-closed-outline"
                        title="Change Password"
                        color="#6C5CE7"
                        onPress={() => {
                            showModal({
                                title: 'Coming Soon',
                                message: 'Password change will be available soon.',
                                type: 'info',
                                primaryButtonText: 'OK',
                                secondaryButtonText: null,
                                onPrimaryPress: hideModal,
                            });
                        }}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon="location-outline"
                        title="Saved Addresses"
                        color="#0984E3"
                        onPress={() => {}}
                    />
                </View>

                {/* Preferences Section */}
                <SectionHeader title="PREFERENCES" />
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <SettingItem
                        icon="notifications-outline"
                        title="Push Notifications"
                        color="#F59E0B"
                        showArrow={false}
                        rightComponent={
                            <CustomToggle
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                
                            />
                        }
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon={isDarkMode ? "moon" : "sunny"}
                        title="Dark Mode"
                        color="#9B59B6"
                        showArrow={false}
                        rightComponent={
                            <CustomToggle
                                value={isDarkMode}
                                onValueChange={toggleTheme}
                               
                            />
                        }
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon="language-outline"
                        title="Language"
                        subtitle="English"
                        color="#00B894"
                        onPress={() => {
                            showModal({
                                title: 'Coming Soon',
                                message: 'Language settings will be available soon.',
                                type: 'info',
                                primaryButtonText: 'OK',
                                secondaryButtonText: null,
                                onPrimaryPress: hideModal,
                            });
                        }}
                    />
                </View>

                {/* Support Section */}
                <SectionHeader title="SUPPORT" />
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <SettingItem
                        icon="help-circle-outline"
                        title="Help Center"
                        color="#10B981"
                        onPress={() => {}}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon="chatbubble-outline"
                        title="Contact Us"
                        color="#3B82F6"
                        onPress={() => {}}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon="document-text-outline"
                        title="Terms of Service"
                        color="#6B7280"
                        onPress={() => router.push('/(settings)/privacy')}
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon="shield-checkmark-outline"
                        title="Privacy Policy"
                        color="#6B7280"
                        onPress={() => router.push('/(settings)/privacy')}
                    />
                </View>

                {/* Danger Zone */}
                <SectionHeader title="DANGER ZONE" />
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <SettingItem
                        icon="log-out-outline"
                        title="Log Out"
                        onPress={handleLogout}
                        isDestructive
                        rightComponent={
                            loggingOut ? (
                                <ActivityIndicator size="small" color={theme.error} />
                            ) : (
                                <Ionicons name="chevron-forward" size={hp('2%')} color={theme.error} />
                            )
                        }
                    />
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <SettingItem
                        icon="trash-outline"
                        title="Delete Account"
                        onPress={handleDeleteAccount}
                        isDestructive
                    />
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={[styles.appName, { color: theme.textMuted }]}>
                        Restro 
                    </Text>
                    <Text style={[styles.appVersion, { color: theme.textMuted }]}>
                        {'Version 1.0.0 '}
                    </Text>
                </View>
            </ScrollView>

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
        width: hp('4.5%'),
        height: hp('4.5%'),
        borderRadius: hp('2.25%'),
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.soft,
    },
    headerTitle: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
    },
    headerSpacer: {
        width: hp('4.5%'),
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: hp('10%'),
    },
    sectionHeader: {
        fontSize: hp('1.3%'),
        fontWeight: fontWeight.semibold,
        letterSpacing: 0.5,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    section: {
        borderRadius: radius.lg,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    settingIcon: {
        width: hp('4.2%'),
        height: hp('4.2%'),
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    settingTitle: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
    },
    settingSubtitle: {
        fontSize: fontSize.caption,
        marginTop: hp('0.1%'),
    },
    divider: {
        height: 1,
        marginLeft: hp('4.2%') + spacing.md * 2,
    },
    appInfo: {
        alignItems: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.lg,
    },
    appName: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
    },
    appVersion: {
        fontSize: fontSize.caption,
        marginTop: spacing.xs,
    },
});



