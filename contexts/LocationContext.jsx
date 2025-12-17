import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LocationContext = createContext();

const LOCATION_STORAGE_KEY = '@food_ordering_location';
const DEFAULT_LOCATION = {
    latitude: 25.7617,  // Miami default
    longitude: -80.1918,
    address: 'Miami, FL',
};

// Haversine formula to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal
};

// Convert km to miles
const kmToMiles = (km) => Math.round(km * 0.621371 * 10) / 10;

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState(null);

    // Load saved location on mount
    useEffect(() => {
        const loadSavedLocation = async () => {
            try {
                const saved = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setLocation(parsed.location);
                    setAddress(parsed.address);
                }
            } catch (e) {
                console.error('Error loading saved location:', e);
            } finally {
                setLoading(false);
            }
        };
        loadSavedLocation();
    }, []);

    // Save location whenever it changes
    useEffect(() => {
        if (location && address) {
            const saveLocation = async () => {
                try {
                    await AsyncStorage.setItem(
                        LOCATION_STORAGE_KEY,
                        JSON.stringify({ location, address })
                    );
                } catch (e) {
                    console.error('Error saving location:', e);
                }
            };
            saveLocation();
        }
    }, [location, address]);

    // Request location permissions
    const requestPermissions = useCallback(async () => {
        try {
            setError(null);
            const { status } = await Location.requestForegroundPermissionsAsync();
            setPermissionStatus(status);
            return status === 'granted';
        } catch (e) {
            console.error('Error requesting location permissions:', e);
            setError('Failed to request location permissions');
            return false;
        }
    }, []);

    // Check current permission status
    const checkPermissions = useCallback(async () => {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            setPermissionStatus(status);
            return status === 'granted';
        } catch (e) {
            console.error('Error checking permissions:', e);
            return false;
        }
    }, []);

    // Get current location
    const getCurrentLocation = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Check/request permissions
            const hasPermission = await requestPermissions();
            if (!hasPermission) {
                setError('Location permission denied');
                setLoading(false);
                return false;
            }

            // Get current position
            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const coords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };

            setLocation(coords);

            // Reverse geocode to get address
            try {
                const [result] = await Location.reverseGeocodeAsync(coords);
                if (result) {
                    const formattedAddress = [
                        result.street,
                        result.city,
                        result.region,
                    ].filter(Boolean).join(', ');
                    setAddress(formattedAddress || 'Current Location');
                }
            } catch (geocodeError) {
                console.error('Reverse geocode error:', geocodeError);
                setAddress('Current Location');
            }

            setLoading(false);
            return true;
        } catch (e) {
            console.error('Error getting location:', e);
            setError('Failed to get current location');
            setLoading(false);
            return false;
        }
    }, [requestPermissions]);

    // Set location manually from address
    const setManualLocation = useCallback(async (addressInput) => {
        setLoading(true);
        setError(null);

        try {
            // Geocode the address
            const results = await Location.geocodeAsync(addressInput);
            
            if (results && results.length > 0) {
                const { latitude, longitude } = results[0];
                setLocation({ latitude, longitude });
                setAddress(addressInput);
                setLoading(false);
                return true;
            } else {
                setError('Address not found');
                setLoading(false);
                return false;
            }
        } catch (e) {
            console.error('Error geocoding address:', e);
            setError('Failed to find address');
            setLoading(false);
            return false;
        }
    }, []);

    // Set location directly with coordinates
    const setLocationCoords = useCallback((coords, addressText = 'Custom Location') => {
        setLocation(coords);
        setAddress(addressText);
    }, []);

    // Calculate distance to a point from current location
    const getDistanceTo = useCallback((lat, lng, unit = 'km') => {
        if (!location) return null;
        
        const distance = calculateDistance(
            location.latitude,
            location.longitude,
            lat,
            lng
        );
        
        return unit === 'miles' ? kmToMiles(distance) : distance;
    }, [location]);

    // Use default location if no location set
    const useDefaultLocation = useCallback(() => {
        setLocation({
            latitude: DEFAULT_LOCATION.latitude,
            longitude: DEFAULT_LOCATION.longitude,
        });
        setAddress(DEFAULT_LOCATION.address);
    }, []);

    // Clear location
    const clearLocation = useCallback(async () => {
        setLocation(null);
        setAddress('');
        try {
            await AsyncStorage.removeItem(LOCATION_STORAGE_KEY);
        } catch (e) {
            console.error('Error clearing location:', e);
        }
    }, []);

    const value = {
        location,
        address,
        loading,
        error,
        permissionStatus,
        getCurrentLocation,
        setManualLocation,
        setLocationCoords,
        getDistanceTo,
        useDefaultLocation,
        clearLocation,
        requestPermissions,
        checkPermissions,
        hasLocation: !!location,
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};

export default LocationContext;

