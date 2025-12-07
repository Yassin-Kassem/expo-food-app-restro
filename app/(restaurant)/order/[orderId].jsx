import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function OrderDetail() {
    const { orderId } = useLocalSearchParams();

    return (
        <View>
            <Text>Order Detail Screen - Order ID: {orderId}</Text>
        </View>
    );
}
