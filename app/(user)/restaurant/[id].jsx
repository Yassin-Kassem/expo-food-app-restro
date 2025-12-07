import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function RestaurantDetail() {
    const { id } = useLocalSearchParams();

    return (
        <View>
            <Text>Restaurant Detail Screen - ID: {id}</Text>
        </View>
    );
}
