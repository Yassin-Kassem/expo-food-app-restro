import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme';
import CustomModal from '../../components/CustomModal';
import { createUserDocument } from '../../services/userService';
import { getCurrentUser } from '../../services/authService';

export default function RoleSelect() {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [errorModal, setErrorModal] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'error'
    });

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const card1Anim = useRef(new Animated.Value(0)).current;
    const card2Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Stagger card animations
        Animated.sequence([
            Animated.timing(card1Anim, {
                toValue: 1,
                duration: 400,
                delay: 200,
                useNativeDriver: true,
            }),
            Animated.timing(card2Anim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const getModalConfig = (errorType) => {
        // Determine modal type and title based on error type
        switch (errorType) {
            case 'selection':
                return { type: 'warning', title: 'Selection Required' };
            case 'auth':
                return { type: 'error', title: 'Authentication Error' };
            case 'setup':
                return { type: 'error', title: 'Setup Failed' };
            default:
                return { type: 'error', title: 'Error' };
        }
    };

    const handleContinue = async () => {
        if (!selectedRole) {
            const config = getModalConfig('selection');
            setErrorModal({
                visible: true,
                title: config.title,
                message: 'Please select a role to continue.',
                type: config.type
            });
            return;
        }
        setLoading(true);

        const user = getCurrentUser();
        if (!user) {
            setLoading(false);
            const config = getModalConfig('auth');
            setErrorModal({
                visible: true,
                title: config.title,
                message: 'You are not signed in. Please try logging in again.',
                type: config.type
            });
            return;
        }

        const result = await createUserDocument(user.uid, selectedRole, {
            displayName: user.displayName,
            email: user.email
        });
        if (!result.success) {
            setLoading(false);
            const config = getModalConfig('setup');
            setErrorModal({
                visible: true,
                title: config.title,
                message: result.error || 'Failed to complete setup. Please try again.',
                type: config.type
            });
        }
        // Navigation is handled in layouts based on user document creation usually
    };

    const handleCloseErrorModal = () => {
        setErrorModal({ ...errorModal, visible: false });
    };

    const handleRetry = () => {
        setErrorModal({ ...errorModal, visible: false });
        handleContinue();
    };

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.background,
        },
        scrollContent: {
            flexGrow: 1,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.xl,
        },
        backButton: {
            width: hp('5%'),
            height: hp('5%'),
            borderRadius: hp('2.5%'),
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.lg,
            backgroundColor: theme.surfaceAlt,
        },
        header: {
            alignItems: 'center',
            marginBottom: spacing.xl,
        },
        headerIconContainer: {
            width: hp('8%'),
            height: hp('8%'),
            borderRadius: hp('4%'),
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
            backgroundColor: `${theme.primary}15`,
        },
        pill: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: `${theme.primary}15`,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: radius.pill,
            marginBottom: spacing.lg,
            gap: spacing.xs,
        },
        pillText: {
            color: theme.primary,
            fontWeight: fontWeight.semibold,
            fontSize: fontSize.caption,
        },
        title: {
            fontSize: hp('3.5%'),
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
            marginBottom: spacing.xs,
            textAlign: 'center',
            letterSpacing: -0.5,
        },
        subtitle: {
            fontSize: fontSize.body,
            color: theme.textSecondary,
            textAlign: 'center',
            lineHeight: hp('2.8%'),
        },
        cardContainer: {
            gap: spacing.md,
            marginBottom: spacing.lg,
        },
        roleCard: {
            backgroundColor: theme.surface,
            borderRadius: radius.xl,
            padding: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: theme.border,
            ...shadows.medium,
            gap: spacing.md,
            position: 'relative',
        },
        roleCardSelected: {
            borderColor: theme.primary,
            borderWidth: 2.5,
        },
        textContainer: {
            flex: 1,
        },
        roleTitle: {
            fontSize: fontSize.body,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
            marginBottom: spacing.xs / 2,
        },
        roleDescription: {
            fontSize: fontSize.caption,
            color: theme.textSecondary,
            lineHeight: hp('2%'),
        },
        checkIcon: {
            position: 'absolute',
            top: spacing.md,
            right: spacing.md,
        },
        buttonContainer: {
            marginTop: spacing.xl,
            marginBottom: spacing.md,
        },
        footerNote: {
            textAlign: 'center',
            color: theme.textMuted,
            fontSize: fontSize.caption,
            marginTop: spacing.md,
            lineHeight: hp('2.2%'),
        },
    });

    const card1Opacity = card1Anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });
    const card1TranslateY = card1Anim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
    });
    const card2Opacity = card2Anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });
    const card2TranslateY = card2Anim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
    });

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
            >
                {/* Back Button */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={hp('2.4%')} color={theme.textPrimary} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Header */}
                <Animated.View 
                    style={[
                        styles.header,
                        { 
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }
                    ]}
                >
                    <View style={styles.headerIconContainer}>
                        <Ionicons name="person-circle-outline" size={hp('3.5%')} color={theme.primary} />
                    </View>
                    <View style={styles.pill}>
                        <Ionicons name="sparkles" size={hp('1.6%')} color={theme.primary} />
                        <Text style={styles.pillText}>Almost there!</Text>
                    </View>
                    <Text style={styles.title}>Choose your role</Text>
                    <Text style={styles.subtitle}>How do you plan to use Restro?</Text>
                </Animated.View>

                {/* Role Cards */}
                <View style={styles.cardContainer}>
                    <Animated.View
                        style={{
                            opacity: card1Opacity,
                            transform: [{ translateY: card1TranslateY }],
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => setSelectedRole('user')}
                            disabled={loading}
                            activeOpacity={1}
                        >
                            <View style={[styles.roleCard, selectedRole === 'user' && styles.roleCardSelected]}>
                                {selectedRole === 'user' && (
                                    <View style={styles.checkIcon}>
                                        <Ionicons name="checkmark-circle" size={hp('3%')} color={theme.primary} />
                                    </View>
                                )}
                                <Ionicons 
                                    name="restaurant-outline" 
                                    size={hp('4%')} 
                                    color={selectedRole === 'user' ? theme.primary : theme.textSecondary} 
                                />
                                <View style={styles.textContainer}>
                                    <Text style={styles.roleTitle}>I am a customer</Text>
                                    <Text style={styles.roleDescription}>
                                        Browse restaurants and order food
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View
                        style={{
                            opacity: card2Opacity,
                            transform: [{ translateY: card2TranslateY }],
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => setSelectedRole('restaurant')}
                            disabled={loading}
                            activeOpacity={1}
                        >
                            <View style={[styles.roleCard, selectedRole === 'restaurant' && styles.roleCardSelected]}>
                                {selectedRole === 'restaurant' && (
                                    <View style={styles.checkIcon}>
                                        <Ionicons name="checkmark-circle" size={hp('3%')} color={theme.primary} />
                                    </View>
                                )}
                                <Ionicons 
                                    name="storefront-outline" 
                                    size={hp('4%')} 
                                    color={selectedRole === 'restaurant' ? theme.primary : theme.textSecondary} 
                                />
                                <View style={styles.textContainer}>
                                    <Text style={styles.roleTitle}>I am a restaurant owner</Text>
                                    <Text style={styles.roleDescription}>
                                        Manage your restaurant and grow your business
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* Continue Button */}
                <Animated.View 
                    style={[
                        styles.buttonContainer,
                        { opacity: fadeAnim }
                    ]}
                >
                    <TouchableOpacity 
                        style={[
                            {
                                backgroundColor: theme.primary,
                                paddingVertical: hp('2%'),
                                borderRadius: radius.lg,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row',
                                gap: spacing.sm,
                                opacity: (!selectedRole || loading) ? 0.6 : 1,
                            },
                            shadows.medium,
                        ]}
                        onPress={handleContinue}
                        disabled={!selectedRole || loading}
                        activeOpacity={0.9}
                    >
                        {loading ? (
                            <Text style={{ color: '#fff', fontSize: fontSize.body, fontWeight: fontWeight.bold }}>
                                Setting up...
                            </Text>
                        ) : (
                            <>
                                <Text style={{ color: '#fff', fontSize: fontSize.body, fontWeight: fontWeight.bold }}>
                                    Continue
                                </Text>
                                <Ionicons name="arrow-forward" size={hp('2.2%')} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={{ opacity: fadeAnim }}>
                    <Text style={styles.footerNote}>
                        You can always change this later in settings
                    </Text>
                </Animated.View>
            </ScrollView>

            {/* Error Modal */}
            <CustomModal
                visible={errorModal.visible}
                title={errorModal.title}
                message={errorModal.message}
                type={errorModal.type}
                primaryButtonText="OK"
                onPrimaryPress={handleCloseErrorModal}
                onClose={handleCloseErrorModal}
            />
        </SafeAreaView>
    );
}
