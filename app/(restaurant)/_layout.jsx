import { Stack } from 'expo-router';

export default function RestaurantLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="order/[orderId]" />
            <Stack.Screen name="menu" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="settings/edit-business-info" />
            <Stack.Screen name="settings/edit-hours" />
            <Stack.Screen name="settings/edit-location" />
        </Stack>
    );
}
