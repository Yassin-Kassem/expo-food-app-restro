import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Firebase is initialized automatically via google-services.json and GoogleService-Info.plist
// Export instances for use throughout the app

export const firebaseAuth = auth;
export const firebaseFirestore = firestore;

export default {
    auth,
    firestore
};
