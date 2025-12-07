import { Stack } from 'expo-router';

export default function RestaurantLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="order/[orderId]" />
            <Stack.Screen name="menu" />
            <Stack.Screen name="onboarding" />
        </Stack>
    );
}
