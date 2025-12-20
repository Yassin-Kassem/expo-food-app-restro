import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState, useRef, useCallback } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { CartProvider } from '../contexts/CartContext';
import { LocationProvider } from '../contexts/LocationContext';
import { useAuth } from '../hooks/useAuth';
import { NotificationProvider } from '../contexts/notificationsContext';
import ThemedStatusBar from '../components/ThemedStatusBar';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowAlert: true,
    }),
});

function RootLayoutContent() {
    const { theme } = useTheme();
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const segments = useSegments();
    const [navigationReady, setNavigationReady] = useState(false);
    const roleSelectTimeoutRef = useRef(null);

    useEffect(() => {
        // Cleanup timeout on unmount
        return () => {
            if (roleSelectTimeoutRef.current) {
                clearTimeout(roleSelectTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (loading) return;

        // Clear any pending role-select redirect
        if (roleSelectTimeoutRef.current) {
            clearTimeout(roleSelectTimeoutRef.current);
            roleSelectTimeoutRef.current = null;
        }

        const inAuthGroup = segments[0] === '(auth)';
        const inRestaurantGroup = segments[0] === '(restaurant)';
        const inUserGroup = segments[0] === '(user)';
        const inSettingsGroup = segments[0] === '(settings)';
        const inOnboarding = segments[1] === 'onboarding';

        console.log('🔍 Routing Debug:', {
            segments,
            user: !!user,
            userData: userData ? { role: userData.role, onboardingCompleted: userData.onboardingCompleted } : null,
            inAuthGroup,
            inRestaurantGroup,
            inUserGroup,
            inSettingsGroup,
            inOnboarding,
            ready: navigationReady
        });

        // Navigate to appropriate screen based on auth state
        if (!user) {
            // Not authenticated - redirect to welcome if not already in auth group
            if (!inAuthGroup) {
                console.log('➡️ Redirecting to welcome (no user)');
                router.replace('/(auth)/welcome');
            } else {
                setNavigationReady(true);
            }
        } else if (!userData) {
            // Authenticated but no user data - wait a moment before redirecting to role-select
            // This prevents race conditions during login when userData is still loading
            const onRoleSelect = segments[1] === 'role-select';

            if (onRoleSelect) {
                // Already on role-select, always allow it to show (fixes reload issue)
                setNavigationReady(true);
            } else if (inAuthGroup) {
                // In auth group but not on role-select, redirect to role-select
                roleSelectTimeoutRef.current = setTimeout(() => {
                    console.log('➡️ Redirecting to role-select (no userData after delay)');
                    router.replace('/(auth)/role-select');
                }, 500); // Wait 500ms for userData to load
            } else if (segments.length === 0) {
                // Segments empty during app initialization/reload - redirect to role-select
                console.log('➡️ Redirecting to role-select (empty segments, no userData)');
                router.replace('/(auth)/role-select');
                setNavigationReady(true);
            }
            // If not in auth group and not on role-select, don't set navigationReady - let the guard show auth routes first
        } else if (userData.role === 'user') {
            // User role - redirect to home if not in user or settings group
            if (!inUserGroup && !inSettingsGroup) {
                console.log('➡️ Redirecting to home (user role)');
                router.replace('/(user)/(tabs)/home');
            } else {
                setNavigationReady(true);
            }
        } else if (userData.role === 'restaurant' && !userData.onboardingCompleted) {
            // Restaurant without completed onboarding - redirect to onboarding if not already there
            const inOnboardingFlow = inRestaurantGroup && inOnboarding;
            if (!inOnboardingFlow) {
                console.log('➡️ Redirecting to onboarding (restaurant, incomplete onboarding)');
                router.replace('/onboarding/business-info');
            } else {
                setNavigationReady(true);
            }
        } else if (userData.role === 'restaurant' && userData.onboardingCompleted) {
            // Restaurant with completed onboarding - redirect to dashboard if in onboarding or not in restaurant or settings group
            if (inOnboarding || (!inRestaurantGroup && !inSettingsGroup)) {
                console.log('➡️ Redirecting to dashboard (restaurant, completed onboarding)');
                router.replace('/dashboard');
            } else {
                setNavigationReady(true);
            }
        }
    }, [user, userData, loading, segments]);

    if (loading || !navigationReady) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.background
            }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <>
            <ThemedStatusBar />
            <Stack screenOptions={{ headerShown: false }}>
                {/* Auth routes - accessible when NOT authenticated OR when selecting role */}
                <Stack.Protected guard={!user || (user && !userData)}>
                    <Stack.Screen name="(auth)" />
                </Stack.Protected>

                {/* User (customer) routes - accessible when authenticated as user */}
                <Stack.Protected guard={!!user && userData?.role === 'user'}>
                    <Stack.Screen name="(user)" />
                </Stack.Protected>

                {/* Restaurant routes - accessible when authenticated as restaurant */}
                <Stack.Protected guard={!!user && userData?.role === 'restaurant'}>
                    <Stack.Screen name="(restaurant)" />
                </Stack.Protected>

                {/* Settings routes - accessible when authenticated */}
                <Stack.Protected guard={!!user && !!userData}>
                    <Stack.Screen name="(settings)" />
                </Stack.Protected>
            </Stack>
        </>
    );
}

export default function RootLayout() {
    return (
        <NotificationProvider>
            <ThemeProvider>
                <LocationProvider>
                    <CartProvider>
                        <RootLayoutContent />
                    </CartProvider>
                </LocationProvider>
            </ThemeProvider>
        </NotificationProvider>
    );
}
