import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../hooks/useAuth';

function RootLayoutContent() {
    const { theme } = useTheme();
    const { user, userData, loading } = useAuth();
    const router = useRouter();
    const segments = useSegments();
    const [navigationReady, setNavigationReady] = useState(false);

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inRestaurantGroup = segments[0] === '(restaurant)';
        const inUserGroup = segments[0] === '(user)';
        const inOnboarding = segments[1] === 'onboarding';

        console.log('🔍 Routing Debug:', {
            segments,
            user: !!user,
            userData: userData ? { role: userData.role, onboardingCompleted: userData.onboardingCompleted } : null,
            inAuthGroup,
            inRestaurantGroup,
            inUserGroup,
            inOnboarding,
            ready: navigationReady
        });

        // Navigate to appropriate screen based on auth state
        if (!user) {
            // Not authenticated - redirect to login if not already in auth group
            if (!inAuthGroup) {
                console.log('➡️ Redirecting to login (no user)');
                router.replace('/login');
            } else {
                setNavigationReady(true);
            }
        } else if (!userData) {
            // Authenticated but no user data - redirect to role select
            const onRoleSelect = segments[1] === 'role-select';
            if (!onRoleSelect) {
                console.log('➡️ Redirecting to role-select (no userData)');
                router.replace('/role-select');
            } else {
                setNavigationReady(true);
            }
        } else if (userData.role === 'user') {
            // User role - redirect to home if not already in user group
            if (!inUserGroup) {
                console.log('➡️ Redirecting to home (user role)');
                router.replace('/home');
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
            // Restaurant with completed onboarding - redirect to dashboard if in onboarding or not in restaurant group
            if (inOnboarding || !inRestaurantGroup) {
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
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <RootLayoutContent />
        </ThemeProvider>
    );
}
