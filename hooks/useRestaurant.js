import { useEffect, useState, useRef } from 'react';
import { listenRestaurantByOwner } from '../services/restaurantService';
import { logError } from '../utils/errorLogger';

export const useRestaurant = (ownerId) => {
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;

        if (!ownerId) {
            setRestaurant(null);
            setError(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const unsubscribe = listenRestaurantByOwner(ownerId, (result) => {
            if (!isMountedRef.current) return;

            if (result.success) {
                setRestaurant(result.data);
                setError(null);
            } else {
                setRestaurant(null);
                // Only set error for non-retryable errors to avoid showing transient errors
                if (!result.retryable) {
                    setError(result.error);
                } else {
                    // Log retryable errors but don't show to user
                    logError('RESTAURANT_LISTENER_RETRYABLE_ERROR', null, { 
                        ownerId, 
                        error: result.error,
                        errorCode: result.errorCode 
                    });
                }
            }
            setLoading(false);
        });

        return () => {
            isMountedRef.current = false;
            if (unsubscribe) unsubscribe();
        };
    }, [ownerId]);

    return { restaurant, loading, error };
};

