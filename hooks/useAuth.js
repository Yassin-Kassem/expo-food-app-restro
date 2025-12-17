import { useEffect, useState, useRef, useCallback } from 'react';
import { onAuthStateChanged, signOut } from '../services/authService';
import { onUserDataChanged } from '../services/userService';
import { logError } from '../utils/errorLogger';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMountedRef = useRef(true);
    const userDataUnsubscribeRef = useRef(null);

    useEffect(() => {
        isMountedRef.current = true;
        setLoading(true);
        setError(null);

        const unsubscribe = onAuthStateChanged(async (authUser) => {
            if (!isMountedRef.current) return;

            setUser(authUser);

            // Cleanup previous user data listener
            if (userDataUnsubscribeRef.current) {
                userDataUnsubscribeRef.current();
                userDataUnsubscribeRef.current = null;
            }

            if (authUser) {
                // Listen to user data changes in real-time
                userDataUnsubscribeRef.current = onUserDataChanged(authUser.uid, (result) => {
                    if (!isMountedRef.current) return;

                    if (result.success) {
                        setUserData(result.data);
                        setError(null);
                    } else {
                        setUserData(null);
                        // Only set error for non-retryable errors
                        if (!result.retryable) {
                            setError(result.error);
                        }
                    }
                    setLoading(false);
                });
            } else {
                setUserData(null);
                setError(null);
                setLoading(false);
            }
        });

        return () => {
            isMountedRef.current = false;
            if (unsubscribe) unsubscribe();
            if (userDataUnsubscribeRef.current) {
                userDataUnsubscribeRef.current();
                userDataUnsubscribeRef.current = null;
            }
        };
    }, []);

    /**
     * Logout the current user
     */
    const logout = useCallback(async () => {
        try {
            const result = await signOut();
            if (!result.success) {
                logError('LOGOUT_ERROR', new Error(result.error));
                return { success: false, error: result.error };
            }
            return { success: true };
        } catch (error) {
            logError('LOGOUT_ERROR', error);
            return { success: false, error: 'Failed to log out. Please try again.' };
        }
    }, []);

    return { user, userData, loading, error, logout };
}
