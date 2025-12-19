import { firebaseStorage } from '../config/firebase.config';
import { logError } from '../utils/errorLogger';
import { handleNetworkError } from '../utils/networkHandler';

// FileSystem is optional - use legacy API for Expo SDK 54+
let FileSystem = null;
try {
    // Use the legacy API to avoid deprecation warnings
    FileSystem = require('expo-file-system/legacy');
} catch (e) {
    // If legacy import fails, try the main module
    try {
        FileSystem = require('expo-file-system');
    } catch (e2) {
        // FileSystem not available - will skip file size check
    }
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

const createFileName = (originalUri) => {
    const extension = originalUri?.split('.').pop()?.toLowerCase() || 'jpg';
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return `${unique}.${extension}`;
};

/**
 * Upload image to Firebase Storage with validation and error handling
 */
export const uploadImage = async (uri, { folder }) => {
    try {
        if (!uri) {
            return { 
                success: false, 
                error: 'Image URI is required',
                errorCode: 'VALIDATION_ERROR',
                retryable: false
            };
        }

        if (!folder) {
            return { 
                success: false, 
                error: 'Folder path is required',
                errorCode: 'VALIDATION_ERROR',
                retryable: false
            };
        }

        // Validate file exists (if FileSystem is available)
        if (FileSystem && FileSystem.getInfoAsync) {
            try {
                const fileInfo = await FileSystem.getInfoAsync(uri);
                if (!fileInfo.exists) {
                    return { 
                        success: false, 
                        error: 'File not found',
                        errorCode: 'FILE_NOT_FOUND',
                        retryable: false
                    };
                }

                // Check file size (if available)
                if (fileInfo.size && fileInfo.size > MAX_FILE_SIZE) {
                    return { 
                        success: false, 
                        error: `Image size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
                        errorCode: 'FILE_TOO_LARGE',
                        retryable: false
                    };
                }
            } catch (fileSystemError) {
                // If file system check fails, continue with upload
                // Don't log this as an error since it's expected in some cases
                console.log('FileSystem check skipped:', fileSystemError.message);
            }
        }

        // Validate file extension
        const extension = uri.split('.').pop()?.toLowerCase();
        if (extension && !ALLOWED_EXTENSIONS.includes(extension)) {
            return { 
                success: false, 
                error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
                errorCode: 'INVALID_FILE_TYPE',
                retryable: false
            };
        }

        const fileName = createFileName(uri);
        const storageRef = firebaseStorage().ref(`${folder}/${fileName}`);

        // Upload with progress tracking (optional)
        await storageRef.putFile(uri);
        
        // Get download URL
        const downloadURL = await storageRef.getDownloadURL();

        return { success: true, downloadURL, fileName };
    } catch (error) {
        logError('UPLOAD_IMAGE_ERROR', error, { folder, uri });
        
        // Handle specific storage errors
        if (error.code === 'storage/quota-exceeded') {
            return { 
                success: false, 
                error: 'Storage quota exceeded. Please contact support.',
                errorCode: 'QUOTA_EXCEEDED',
                retryable: false
            };
        }
        
        if (error.code === 'storage/unauthorized') {
            return { 
                success: false, 
                error: 'Permission denied. Please contact support.',
                errorCode: 'PERMISSION_DENIED',
                retryable: false
            };
        }

        if (error.code === 'storage/canceled') {
            return { 
                success: false, 
                error: 'Upload was canceled',
                errorCode: 'UPLOAD_CANCELED',
                retryable: true
            };
        }

        // Check for network errors
        if (error.message?.includes('network') || error.code === 'unavailable') {
            const networkError = handleNetworkError(error);
            return {
                success: false,
                error: networkError.userMessage,
                errorCode: networkError.errorCode,
                retryable: networkError.retryable
            };
        }

        return { 
            success: false, 
            error: 'Failed to upload image. Please try again.',
            errorCode: 'UPLOAD_ERROR',
            retryable: true
        };
    }
};
