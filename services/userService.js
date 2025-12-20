import { firebaseFirestore } from '../config/firebase.config';

/**
 * Create user document in Firestore
 */
export const createUserDocument = async (uid, role, userData = {}) => {
    try {
        await firebaseFirestore().collection('users').doc(uid).set({
            role: role, // "user" or "restaurant"
            onboardingCompleted: role === 'user' ? true : false,
            createdAt: firebaseFirestore.FieldValue.serverTimestamp(),
            ...userData
        });
        return { success: true };
    } catch (error) {
        console.error('Error creating user document:', error);
        return { success: false, error: 'Failed to create user profile' };
    }
};

/**
 * Get user data from Firestore
 */
export const getUserData = async (uid) => {
    try {
        const doc = await firebaseFirestore().collection('users').doc(uid).get();
        if (doc.exists) {
            return { success: true, data: doc.data() };
        } else {
            return { success: false, error: 'User data not found' };
        }
    } catch (error) {
        console.error('Error getting user data:', error);
        return { success: false, error: 'Failed to fetch user data' };
    }
};

/**
 * Update onboarding completion status
 */
export const updateOnboardingStatus = async (uid, completed) => {
    try {
        await firebaseFirestore().collection('users').doc(uid).update({
            onboardingCompleted: completed
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating onboarding status:', error);
        return { success: false, error: 'Failed to update onboarding status' };
    }
};

/**
 * Update user profile (name and phone number)
 */
export const updateUserProfile = async (uid, profileData) => {
    try {
        const updateData = {
            updatedAt: firebaseFirestore.FieldValue.serverTimestamp(),
        };

        if (profileData.name !== undefined) {
            updateData.name = profileData.name;
            updateData.displayName = profileData.name;
        }

        if (profileData.phoneNumber !== undefined) {
            updateData.phoneNumber = profileData.phoneNumber;
        }

        await firebaseFirestore().collection('users').doc(uid).update(updateData);
        return { success: true };
    } catch (error) {
        console.error('Error updating user profile:', error);
        return { success: false, error: 'Failed to update user profile' };
    }
};

/**
 * Listen to user document changes
 */
export const onUserDataChanged = (uid, callback) => {
    return firebaseFirestore()
        .collection('users')
        .doc(uid)
        .onSnapshot(
            (doc) => {
                if (doc.exists) {
                    callback({ success: true, data: doc.data() });
                } else {
                    callback({ success: false, error: 'User data not found' });
                }
            },
            (error) => {
                console.error('Error listening to user data:', error);
                callback({ success: false, error: 'Failed to listen to user data' });
            }
        );
};
