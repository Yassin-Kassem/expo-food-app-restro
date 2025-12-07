import { Stack } from 'expo-router';

export default function MenuLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="add-item" />
            <Stack.Screen name="edit-item/[itemId]" />
        </Stack>
    );
}
