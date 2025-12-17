import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useTheme } from '../../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, radius } from '../../../constants/theme';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import CustomModal from '../../../components/CustomModal';
import { updateRestaurant, getRestaurantByOwner } from '../../../services/restaurantService';
import { getCurrentUser } from '../../../services/authService';

export default function EditLocation() {
    const { theme } = useTheme();
    const router = useRouter();

    const [address, setAddress] = useState('');
    const [location, setLocation] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const user = getCurrentUser();
        const existingRestaurant = await getRestaurantByOwner(user.uid);
        if (existingRestaurant.success) {
            const data = existingRestaurant.data;
            if (data.address) setAddress(data.address);
            if (data.location) setLocation(data.location);
        }
    };

    const requestLocationPermission = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
    };

    const getCurrentLocation = async () => {
        setGettingLocation(true);
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            setModalConfig({
                visible: true,
                title: 'Permission Required',
                message: 'We need your permission to access your location to help customers find you.',
                type: 'warning'
            });
            setGettingLocation(false);
            return;
        }

        try {
            const currentLocation = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = currentLocation.coords;
            setLocation({ lat: latitude, lng: longitude });

            const addressResults = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (addressResults.length > 0) {
                const addr = addressResults[0];
                const formattedAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''} ${addr.postalCode || ''}`.trim();
                setAddress(formattedAddress);
            }
        } catch (error) {
            setModalConfig({
                visible: true,
                title: 'Location Error',
                message: 'We could not fetch your location. Please enter it manually.',
                type: 'error'
            });
        }
        setGettingLocation(false);
    };

    const handleSave = async () => {
        if (!address) {
            setErrors({ address: 'Address is required' });
            return;
        }
        setLoading(true);
        const user = getCurrentUser();
        const restaurantResult = await getRestaurantByOwner(user.uid);

        if (restaurantResult.success) {
            await updateRestaurant(restaurantResult.data.id, { location, address });
            router.back();
        }
        setLoading(false);
    };

    const styles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.surface,
        },
        header: {
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.lg,
            backgroundColor: theme.surface,
            zIndex: 10,
        },
        title: {
            marginTop: spacing.sm,
            fontSize: fontSize.title,
            fontWeight: fontWeight.bold,
            color: theme.textPrimary,
            letterSpacing: -0.5,
            marginBottom: spacing.xs,
        },
        subtitle: {
            fontSize: fontSize.body,
            color: theme.textSecondary,
            lineHeight: fontSize.body * 1.5,
        },
        scrollContainer: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: hp('15%'),
        },
        mapPreview: {
            height: hp('22%'),
            backgroundColor: theme.surfaceAlt,
            borderRadius: radius.xl,
            marginBottom: spacing.lg,
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 4,
        },
        mapIconCircle: {
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#FFFFFF',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
        },
        locationBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing.md,
            borderRadius: radius.lg,
            backgroundColor: theme.surface,
            borderWidth: 1.5,
            borderColor: theme.primary,
            marginBottom: spacing.xl,
            gap: spacing.sm,
        },
        locationBtnText: {
            color: theme.primary,
            fontWeight: fontWeight.bold,
            fontSize: fontSize.body,
        },
        footer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.surface,
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
            borderTopWidth: 1,
            borderTopColor: theme.surfaceAlt,
            flexDirection: 'row',
            gap: spacing.md
        },
        nextButton: {
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 8,
        }
    });

    return (
        <View style={styles.safeArea}>
            <View style={styles.header}>
                <View style={{ marginTop: spacing.sm }}>
                    <Text style={styles.title}>Location</Text>
                    <Text style={styles.subtitle}>Update your restaurant location</Text>
                </View>
            </View>

            <View style={styles.scrollContainer}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.mapPreview}>
                        <View style={styles.mapIconCircle}>
                            <Ionicons name="map" size={32} color={theme.primary} />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.locationBtn}
                        onPress={getCurrentLocation}
                        disabled={gettingLocation}
                        activeOpacity={0.7}
                    >
                        <Ionicons name={gettingLocation ? "hourglass-outline" : "navigate-circle-outline"} size={22} color={theme.primary} />
                        <Text style={styles.locationBtnText}>{gettingLocation ? "Locating..." : "Use Current Location"}</Text>
                    </TouchableOpacity>

                    <Input
                        label="Full Address"
                        placeholder="123 Main St, New York, NY"
                        value={address}
                        onChangeText={setAddress}
                        error={errors.address}
                        multiline
                        numberOfLines={2}
                    />
                </ScrollView>
            </View>

            <View style={styles.footer}>
                <Button
                    title="Cancel"
                    onPress={() => router.back()}
                    variant="secondary"
                    style={{ flex: 1 }}
                />
                <Button
                    title="Save"
                    onPress={handleSave}
                    loading={loading}
                    style={[styles.nextButton, { flex: 2 }]}
                />
            </View>

            <CustomModal
                visible={modalConfig.visible}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                onPrimaryPress={() => setModalConfig(prev => ({ ...prev, visible: false }))}
                onClose={() => setModalConfig(prev => ({ ...prev, visible: false }))}
            />
        </View>
    );
}

