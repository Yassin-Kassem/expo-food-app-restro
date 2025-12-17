import React, { useState } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    StyleSheet, 
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../hooks/useAuth';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import CustomModal from '../../../components/CustomModal';

const MenuItem = ({ icon, title, subtitle, onPress, color, isDestructive, isLoading }) => {
    const { theme } = useTheme();
    const iconColor = isDestructive ? theme.error : (color || theme.primary);
    
    return (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={isLoading}
        >
            <View style={[styles.menuIcon, { backgroundColor: `${iconColor}15` }]}>
                <Ionicons name={icon} size={hp('2.2%')} color={iconColor} />
            </View>
            <View style={styles.menuContent}>
                <Text style={[
                    styles.menuTitle, 
                    { color: isDestructive ? theme.error : theme.textPrimary }
                ]}>
                    {title}
                </Text>
                {subtitle && (
                    <Text style={[styles.menuSubtitle, { color: theme.textMuted }]}>
                        {subtitle}
                    </Text>
                )}
            </View>
            {isLoading ? (
                <ActivityIndicator size="small" color={isDestructive ? theme.error : theme.primary} />
            ) : (
                <Ionicons name="chevron-forward" size={hp('2%')} color={theme.textMuted} />
            )}
        </TouchableOpacity>
    );
};

const ProfileScreen = () => {
    const { theme } = useTheme();
    const { user, logout } = useAuth();
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);
    
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
                        setLoggingOut(false);
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
                    setLoggingOut(false);
                }
            },
        });
    };

    const initial = user?.displayName?.charAt(0)?.toUpperCase() || 
                    user?.email?.charAt(0)?.toUpperCase() || 'U';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.headerRow}>
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Profile</Text>
                    <TouchableOpacity 
                        onPress={() => router.push('/(settings)')}
                        style={[styles.settingsButton, { backgroundColor: theme.surface }]}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="settings-outline" size={hp('2.4%')} color={theme.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <TouchableOpacity 
                    style={[styles.profileCard, { backgroundColor: theme.surface }]}
                    onPress={() => router.push('/(settings)/profile')}
                >
                    <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                        <Text style={styles.avatarText}>{initial}</Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={[styles.profileName, { color: theme.textPrimary }]}>
                            {user?.displayName || 'User'}
                        </Text>
                        <Text style={[styles.profileEmail, { color: theme.textMuted }]}>
                            {user?.email}
                        </Text>
                    </View>
                    <View style={[styles.editBadge, { backgroundColor: `${theme.primary}15` }]}>
                        <Ionicons name="pencil" size={hp('1.6%')} color={theme.primary} />
                    </View>
                </TouchableOpacity>

                {/* Quick Stats */}
                <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.primary }]}>12</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Orders</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.primary }]}>3</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Favorites</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: theme.primary }]}>2</Text>
                        <Text style={[styles.statLabel, { color: theme.textMuted }]}>Addresses</Text>
                    </View>
                </View>

                {/* Menu Sections */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <MenuItem
                        icon="person-outline"
                        title="Personal Info"
                        onPress={() => router.push('/(settings)/profile')}
                    />
                    <MenuItem
                        icon="location-outline"
                        title="Saved Addresses"
                        color="#0984E3"
                        onPress={() => {}}
                    />
                    <MenuItem
                        icon="heart-outline"
                        title="Favorites"
                        color="#EC4899"
                        onPress={() => {}}
                    />
                </View>

                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <MenuItem
                        icon="receipt-outline"
                        title="Order History"
                        color="#6C5CE7"
                        onPress={() => router.push('/(user)/(tabs)/orders')}
                    />
                    <MenuItem
                        icon="card-outline"
                        title="Payment Methods"
                        color="#10B981"
                        onPress={() => {}}
                    />
                    <MenuItem
                        icon="gift-outline"
                        title="Promotions"
                        color="#F59E0B"
                        onPress={() => {}}
                    />
                </View>

                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <MenuItem
                        icon="settings-outline"
                        title="Settings"
                        color="#6B7280"
                        onPress={() => router.push('/(settings)')}
                    />
                    <MenuItem
                        icon="help-circle-outline"
                        title="Help & Support"
                        color="#3B82F6"
                        onPress={() => {}}
                    />
                </View>

                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <MenuItem
                        icon="log-out-outline"
                        title="Log Out"
                        onPress={handleLogout}
                        isDestructive
                        isLoading={loggingOut}
                    />
                </View>

                {/* Version */}
                <Text style={[styles.version, { color: theme.textMuted }]}>
                    Version 1.0.0
                </Text>
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
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: hp('12%'),
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    headerTitle: {
        fontSize: fontSize.title,
        fontWeight: fontWeight.bold,
    },
    settingsButton: {
        width: hp('4.5%'),
        height: hp('4.5%'),
        borderRadius: hp('2.25%'),
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.soft,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
    },
    avatar: {
        width: hp('7%'),
        height: hp('7%'),
        borderRadius: hp('3.5%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: fontSize.title,
        fontWeight: fontWeight.bold,
    },
    profileInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    profileName: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.bold,
    },
    profileEmail: {
        fontSize: fontSize.caption,
        marginTop: hp('0.2%'),
    },
    editBadge: {
        width: hp('3.5%'),
        height: hp('3.5%'),
        borderRadius: hp('1.75%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: fontSize.title,
        fontWeight: fontWeight.bold,
    },
    statLabel: {
        fontSize: fontSize.caption,
        marginTop: hp('0.2%'),
    },
    statDivider: {
        width: 1,
        height: '100%',
    },
    section: {
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    menuIcon: {
        width: hp('4%'),
        height: hp('4%'),
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    menuTitle: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.medium,
    },
    menuSubtitle: {
        fontSize: fontSize.caption,
        marginTop: hp('0.1%'),
    },
    version: {
        textAlign: 'center',
        fontSize: fontSize.caption,
        marginTop: spacing.md,
    },
});

export default ProfileScreen;
