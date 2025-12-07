import { useEffect, useState } from 'react';
import { onAuthStateChanged } from '../services/authService';
import { onUserDataChanged } from '../services/userService';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(async (authUser) => {
            setUser(authUser);

            if (authUser) {
                // Listen to user data changes in real-time
                const userDataUnsubscribe = onUserDataChanged(authUser.uid, (result) => {
                    if (result.success) {
                        setUserData(result.data);
                    } else {
                        setUserData(null);
                    }
                    setLoading(false);
                });

                // Return cleanup function
                return () => {
                    if (userDataUnsubscribe) {
                        userDataUnsubscribe();
                    }
                };
            } else {
                setUserData(null);
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    return { user, userData, loading };
}
