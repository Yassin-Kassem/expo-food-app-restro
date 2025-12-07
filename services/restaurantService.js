import { firebaseFirestore } from '../config/firebase.config';

/**
 * Create restaurant document in Firestore
 */
export const createRestaurant = async (uid, data) => {
    try {
        const restaurantRef = firebaseFirestore().collection('restaurants').doc();
        await restaurantRef.set({
            ownerId: uid,
            ...data,
            status: 'draft',
            createdAt: firebaseFirestore.FieldValue.serverTimestamp()
        });
        return { success: true, restaurantId: restaurantRef.id };
    } catch (error) {
        console.error('Error creating restaurant:', error);
        return { success: false, error: 'Failed to create restaurant' };
    }
};

/**
 * Update restaurant document
 */
export const updateRestaurant = async (restaurantId, data) => {
    try {
        await firebaseFirestore().collection('restaurants').doc(restaurantId).update({
            ...data,
            updatedAt: firebaseFirestore.FieldValue.serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating restaurant:', error);
        return { success: false, error: 'Failed to update restaurant' };
    }
};

/**
 * Get restaurant by owner ID
 */
export const getRestaurantByOwner = async (ownerId) => {
    try {
        const snapshot = await firebaseFirestore()
            .collection('restaurants')
            .where('ownerId', '==', ownerId)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return { success: true, data: { id: doc.id, ...doc.data() } };
        } else {
            return { success: false, error: 'Restaurant not found' };
        }
    } catch (error) {
        console.error('Error getting restaurant:', error);
        return { success: false, error: 'Failed to fetch restaurant' };
    }
};

/**
 * Add menu item to restaurant
 */
export const addMenuItem = async (restaurantId, item) => {
    try {
        const menuRef = firebaseFirestore()
            .collection('restaurants')
            .doc(restaurantId)
            .collection('menu')
            .doc();

        await menuRef.set({
            ...item,
            createdAt: firebaseFirestore.FieldValue.serverTimestamp()
        });

        return { success: true, itemId: menuRef.id };
    } catch (error) {
        console.error('Error adding menu item:', error);
        return { success: false, error: 'Failed to add menu item' };
    }
};

/**
 * Publish restaurant (set status to active and mark onboarding as complete)
 */
export const publishRestaurant = async (restaurantId, ownerId) => {
    try {
        // Update restaurant status
        await firebaseFirestore().collection('restaurants').doc(restaurantId).update({
            status: 'active',
            publishedAt: firebaseFirestore.FieldValue.serverTimestamp()
        });

        // Update user's onboarding status
        await firebaseFirestore().collection('users').doc(ownerId).update({
            onboardingCompleted: true
        });

        return { success: true };
    } catch (error) {
        console.error('Error publishing restaurant:', error);
        return { success: false, error: 'Failed to publish restaurant' };
    }
};
