import { Stack } from 'expo-router';

export default function OnboardingLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="business-info" />
            <Stack.Screen name="location-setup" />
            <Stack.Screen name="hours" />
            <Stack.Screen name="add-first-item" />
            <Stack.Screen name="review" />
        </Stack>
    );
}
