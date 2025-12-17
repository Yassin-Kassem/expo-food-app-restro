import React, { useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Animated 
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../../constants/theme';

// Circular category data with emojis
const CATEGORIES = [
    { id: 'all', name: 'All ', emoji: '🍽️', bgColor: '#E8F5E9' },
    { id: 'fast-food', name: 'Burger ', emoji: '🍔', bgColor: '#FFF3E0' },
    { id: 'healthy', name: 'Healthy ', emoji: '🥗', bgColor: '#E8F5E9' },
    { id: 'desserts', name: 'Dessert ', emoji: '🍰', bgColor: '#FCE4EC' },
    { id: 'asian', name: 'Asian ', emoji: '🍜', bgColor: '#FFF8E1' },
    { id: 'pizza', name: 'Pizza ', emoji: '🍕', bgColor: '#FFEBEE' },
    { id: 'sushi', name: 'Sushi ', emoji: '🍣', bgColor: '#E3F2FD' },
    { id: 'mexican', name: 'Mexican ', emoji: '🌮', bgColor: '#F3E5F5' },
    { id: 'coffee', name: 'Coffee ', emoji: '☕', bgColor: '#EFEBE9' },
];

const CircularCategoryItem = ({ category, isSelected, onPress }) => {
    const { theme } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.92,
            useNativeDriver: true,
            friction: 8,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
        }).start();
    };

    return (
        <TouchableOpacity
            onPress={() => onPress(category)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            style={styles.circularItemWrapper}
        >
            <Animated.View 
                style={[
                    styles.circularItem,
                    { 
                        backgroundColor: isSelected ? theme.primary : category.bgColor,
                        borderColor: isSelected ? theme.primary : 'transparent',
                        transform: [{ scale: scaleAnim }],
                    }
                ]}
            >
                <Text style={[
                    styles.circularEmoji,
                    isSelected && styles.selectedEmoji
                ]}>
                    {category.emoji}
                </Text>
            </Animated.View>
            <Text style={[
                styles.circularLabel,
                { color: isSelected ? theme.primary : theme.textSecondary }
            ]}>
                {category.name}
            </Text>
        </TouchableOpacity>
    );
};

// Quick filter pills (like Steak, Wings, Breakfast in the reference)
const QuickFilterPill = ({ label, isSelected, onPress, theme }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={[
                styles.filterPill,
                { 
                    backgroundColor: isSelected ? theme.primary : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                }
            ]}
        >
            <Text style={[
                styles.filterPillText,
                { color: isSelected ? '#fff' : theme.textPrimary }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const CategoryGrid = ({ 
    onCategorySelect, 
    selectedCategory = 'all',
    categories = CATEGORIES,
    variant = 'circular', // 'circular' or 'pills'
    quickFilters = ['Steak', 'Wings', 'Breakfast', 'Lunch', 'Dinner'],
}) => {
    const { theme } = useTheme();

    if (variant === 'pills') {
        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillsContent}
            >
                {quickFilters.map((filter, index) => (
                    <QuickFilterPill
                        key={filter}
                        label={filter}
                        isSelected={index === 0}
                        onPress={() => {}}
                        theme={theme}
                    />
                ))}
            </ScrollView>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.circularContent}
            >
                {categories.map((category) => (
                    <CircularCategoryItem
                        key={category.id}
                        category={category}
                        isSelected={selectedCategory === category.id}
                        onPress={onCategorySelect}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    // Circular style
    circularContent: {
        paddingHorizontal: spacing.md,
        gap: spacing.md,
        flexDirection: 'row',
    },
    circularItemWrapper: {
        alignItems: 'center',
        width: wp('18%'),
    },
    circularItem: {
        width: wp('15%'),
        height: wp('15%'),
        borderRadius: wp('7.5%'),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        marginBottom: spacing.xs,
    },
    circularEmoji: {
        fontSize: hp('3%'),
    },
    selectedEmoji: {
        // Can add filter or scale effect if needed
    },
    circularLabel: {
        fontSize: hp('1.3%'),
        fontWeight: fontWeight.medium,
        textAlign: 'center',
    },

    // Pills style (quick filters)
    pillsContent: {
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
        flexDirection: 'row',
        marginBottom: spacing.md,
    },
    filterPill: {
        paddingHorizontal: spacing.md,
        paddingVertical: hp('1%'),
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    filterPillText: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.semibold,
    },
});

export { CATEGORIES };
export default CategoryGrid;
