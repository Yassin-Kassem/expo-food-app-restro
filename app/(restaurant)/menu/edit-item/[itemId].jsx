import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function EditItem() {
    const { itemId } = useLocalSearchParams();

    return (
        <View>
            <Text>Edit Menu Item Screen - Item ID: {itemId}</Text>
        </View>
    );
}
