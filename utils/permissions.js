/**
 * Permission handling utilities
 * Handles camera, storage, and location permissions gracefully
 */

import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Linking } from 'react-native';
import { logError } from './errorLogger';

/**
 * Request camera permission for image picking
 */
export const requestCameraPermission = async () => {
    try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            return {
                granted: false,
                error: 'Camera permission is required to take photos',
                errorCode: 'CAMERA_PERMISSION_DENIED'
            };
        }
        return { granted: true };
    } catch (error) {
        logError('CAMERA_PERMISSION_ERROR', error);
        return {
            granted: false,
            error: 'Failed to request camera permission',
            errorCode: 'PERMISSION_ERROR'
        };
    }
};

/**
 * Request media library permission for image picking
 */
export const requestMediaLibraryPermission = async () => {
    try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            return {
                granted: false,
                error: 'Media library permission is required to select photos',
                errorCode: 'MEDIA_LIBRARY_PERMISSION_DENIED'
            };
        }
        return { granted: true };
    } catch (error) {
        logError('MEDIA_LIBRARY_PERMISSION_ERROR', error);
        return {
            granted: false,
            error: 'Failed to request media library permission',
            errorCode: 'PERMISSION_ERROR'
        };
    }
};

/**
 * Request location permission
 */
export const requestLocationPermission = async () => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            return {
                granted: false,
                error: 'Location permission is required to set your restaurant location',
                errorCode: 'LOCATION_PERMISSION_DENIED'
            };
        }
        return { granted: true };
    } catch (error) {
        logError('LOCATION_PERMISSION_ERROR', error);
        return {
            granted: false,
            error: 'Failed to request location permission',
            errorCode: 'PERMISSION_ERROR'
        };
    }
};

/**
 * Get permission denied modal configuration
 * Returns a config object to be used with CustomModal component
 */
export const getPermissionDeniedModalConfig = (message, onOpenSettings, onClose) => ({
    visible: true,
    title: 'Permission Required',
    message: message,
    type: 'warning',
    primaryButtonText: 'Open Settings',
    secondaryButtonText: 'Cancel',
    onPrimaryPress: () => {
        if (onOpenSettings) {
            onOpenSettings();
        } else {
            Linking.openSettings();
        }
        if (onClose) onClose();
    },
    onSecondaryPress: onClose,
});

