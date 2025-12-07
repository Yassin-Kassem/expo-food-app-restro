import { Stack } from 'expo-router';

export default function UserLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="home" />
            <Stack.Screen name="restaurant/[id]" />
            <Stack.Screen name="cart" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="order-tracking" />
        </Stack>
    );
}
