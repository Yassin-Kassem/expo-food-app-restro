import { firebaseFirestore } from '../config/firebase.config';

/**
 * Create user document in Firestore
 */
export const createUserDocument = async (uid, role) => {
    try {
        await firebaseFirestore().collection('users').doc(uid).set({
            role: role, // "user" or "restaurant"
            onboardingCompleted: role === 'user' ? true : false,
            createdAt: firebaseFirestore.FieldValue.serverTimestamp()
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
