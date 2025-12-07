import { firebaseAuth } from '../config/firebase.config';

/**
 * Sign in with email and password
 */
export const signIn = async (email, password) => {
    try {
        const userCredential = await firebaseAuth().signInWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: getErrorMessage(error.code) };
    }
};

/**
 * Sign up with email and password
 */
export const signUp = async (email, password) => {
    try {
        const userCredential = await firebaseAuth().createUserWithEmailAndPassword(email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: getErrorMessage(error.code) };
    }
};

/**
 * Sign out current user
 */
export const signOut = async () => {
    try {
        await firebaseAuth().signOut();
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to sign out' };
    }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
    return firebaseAuth().currentUser;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChanged = (callback) => {
    return firebaseAuth().onAuthStateChanged(callback);
};

/**
 * Convert Firebase error codes to user-friendly messages
 */
const getErrorMessage = (errorCode) => {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Invalid email address';
        case 'auth/user-disabled':
            return 'This account has been disabled';
        case 'auth/user-not-found':
            return 'No account found with this email';
        case 'auth/wrong-password':
            return 'Incorrect password';
        case 'auth/email-already-in-use':
            return 'An account already exists with this email';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection';
        default:
            return 'An error occurred. Please try again';
    }
};
