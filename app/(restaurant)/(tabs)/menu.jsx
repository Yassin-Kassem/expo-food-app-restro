import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius, shadows } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CustomToggle from '../../../components/CustomToggle';
import { useAuth } from '../../../hooks/useAuth';
import { useRestaurant } from '../../../hooks/useRestaurant';
import { listenMenuItems, updateMenuItemAvailability } from '../../../services/menuService';

export default function MenuScreen() {
    const { theme, isDarkMode } = useTheme();
    const router = useRouter();
    const { user } = useAuth();
    const { restaurant, loading: restaurantLoading } = useRestaurant(user?.uid);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!restaurant?.id) return;
        setLoading(true);

        const unsubscribe = listenMenuItems(restaurant.id, (result) => {
            if (result.success) {
                setMenuItems(result.data);
            }
            setLoading(false);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [restaurant?.id]);

    const groupedMenu = useMemo(() => {
        const groups = {};
        menuItems.forEach((item) => {
            const category = item.category?.trim() || 'Uncategorized';
            if (!groups[category]) groups[category] = [];
            groups[category].push(item);
        });

        return Object.keys(groups).map((title) => ({
            title,
            data: groups[title]
        }));
    }, [menuItems]);

    const formatPrice = (price) => {
        const numeric = typeof price === 'number' ? price : parseFloat(price) || 0;
        return `£${numeric.toFixed(2)}`;
    };

    const toggleAvailability = async (item) => {
        if (!restaurant?.id) return;
        setMenuItems((prev) =>
            prev.map((existing) =>
                existing.id === item.id ? { ...existing, available: !existing.available } : existing
            )
        );
        await updateMenuItemAvailability(restaurant.id, item.id, !item.available);
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Menu </Text>
            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/(restaurant)/menu/add-item')}
            >
                <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
        </View>
    );

    const renderItem = ({ item }) => (
        <View style={[styles.itemContainer, { borderColor: theme.border }]}>
            {/* Image Placeholder */}
            <View style={[styles.imagePlaceholder, { backgroundColor: theme.surfaceAlt }]}>
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                ) : (
                    <Ionicons name="fast-food-outline" size={20} color={theme.textMuted} />
                )}
            </View>

            <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.textPrimary }]}>{item.name} </Text>
                <View style={styles.priceToggleRow}>
                    <Text style={[styles.itemPrice, { color: theme.textSecondary }]}>{formatPrice(item.price)} </Text>
                    <CustomToggle
                        value={item.available}
                        onValueChange={() => toggleAvailability(item)}
                    />
                </View>
                <Text numberOfLines={1} style={[styles.itemDesc, { color: theme.textSecondary }]}>
                    {item.description}
                </Text>
            </View>
        </View>
    );

    const renderSectionHeader = ({ section: { title } }) => (
        <View style={[styles.sectionHeader ]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title} </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <SectionList
                sections={loading || restaurantLoading ? [] : groupedMenu}
                keyExtractor={(item, index) => item.id + index}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={renderHeader}
                stickySectionHeadersEnabled={false}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                        {loading || restaurantLoading ? (
                            <>
                                <ActivityIndicator color={theme.primary} />
                                <Text style={{ marginTop: spacing.sm, color: theme.textSecondary }}>Loading menu...</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="fast-food-outline" size={32} color={theme.textMuted} />
                                <Text style={{ marginTop: spacing.sm, color: theme.textSecondary }}>
                                    No menu items yet. Add your first item.
                                </Text>
                            </>
                        )}
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: spacing.xl,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: 100, 
        zIndex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: fontSize.titleXL,
        fontWeight: fontWeight.bold,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: radius.full, // Ensure this exists or use number
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.soft,
    },
    sectionHeader: {
        paddingVertical: spacing.sm,
        marginBottom: spacing.xs,
    },
    sectionTitle: {
        fontSize: fontSize.subtitle,
        fontWeight: fontWeight.semibold,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        marginBottom: spacing.sm,
        // Simpler border
        borderBottomWidth: 1,
        borderRadius: 0, // List feel
        borderWidth: 0, // No full border
        backgroundColor: 'transparent',
    },
    imagePlaceholder: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    itemImage: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
    },
    itemInfo: {
        flex: 1,
        justifyContent: 'center',
        gap: 2,
    },
    priceToggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    // itemHeader removed
    itemName: {
        fontSize: fontSize.body,
        fontWeight: fontWeight.semibold,
    },
    itemPrice: {
        fontSize: fontSize.caption,
        fontWeight: fontWeight.medium,
    },
    itemDesc: {
        fontSize: fontSize.caption,
        opacity: 0.7,
        marginTop: 2,
    },
    actions: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: spacing.sm,
    },
    editButton: {
        padding: 4,
    },
});
