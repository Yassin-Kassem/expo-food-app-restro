import { firebaseFirestore } from '../config/firebase.config';
import { logError } from '../utils/errorLogger';
import { handleNetworkError } from '../utils/networkHandler';

const collectionRef = () => firebaseFirestore().collection('restaurants');

const mapRestaurant = (doc) => ({ id: doc.id, ...doc.data() });

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
};

// Check if restaurant is currently open based on hours
const isRestaurantOpen = (restaurant) => {
    if (!restaurant.hours) return true; // Assume open if no hours set
    if (restaurant.isOpen === false) return false; // Manually closed
    
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[now.getDay()];
    const todayHours = restaurant.hours[today];
    
    if (!todayHours || !todayHours.open || !todayHours.close) return false;
    
    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
    
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = openHour * 60 + openMin;
    let closeMinutes = closeHour * 60 + closeMin;
    
    // Handle closing after midnight
    if (closeMinutes < openMinutes) {
        closeMinutes += 24 * 60;
        if (currentMinutes < openMinutes) {
            return currentMinutes + 24 * 60 < closeMinutes;
        }
    }
    
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
};

// Add computed fields to restaurant
const enrichRestaurant = (restaurant, userLocation = null) => {
    const enriched = {
        ...restaurant,
        isOpen: isRestaurantOpen(restaurant),
    };
    
    if (userLocation && restaurant.location) {
        enriched.distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            restaurant.location.lat,
            restaurant.location.lng
        );
    }
    
    return enriched;
};

/**
 * Get all active restaurants
 */
export const getAllRestaurants = async (userLocation = null, filters = {}) => {
    try {
        let query = collectionRef().where('status', '==', 'active');
        
        const snapshot = await query.get();
        
        let restaurants = snapshot.docs.map(doc => 
            enrichRestaurant(mapRestaurant(doc), userLocation)
        );

        // Apply filters
        if (filters.categories?.length > 0) {
            restaurants = restaurants.filter(r => 
                r.categories?.some(cat => filters.categories.includes(cat))
            );
        }

        if (filters.priceRange) {
            restaurants = restaurants.filter(r => 
                r.priceRange === filters.priceRange
            );
        }

        if (filters.minRating) {
            restaurants = restaurants.filter(r => 
                (r.rating || 0) >= filters.minRating
            );
        }

        if (filters.maxDistance && userLocation) {
            restaurants = restaurants.filter(r => 
                r.distance && r.distance <= filters.maxDistance
            );
        }

        if (filters.openNow) {
            restaurants = restaurants.filter(r => r.isOpen);
        }

        // Apply sorting
        switch (filters.sortBy) {
            case 'distance':
                restaurants.sort((a, b) => (a.distance || 999) - (b.distance || 999));
                break;
            case 'rating':
                restaurants.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'deliveryTime':
                restaurants.sort((a, b) => 
                    (a.estimatedDeliveryTime || 60) - (b.estimatedDeliveryTime || 60)
                );
                break;
            case 'priceLow':
                const priceOrder = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
                restaurants.sort((a, b) => 
                    (priceOrder[a.priceRange] || 2) - (priceOrder[b.priceRange] || 2)
                );
                break;
            case 'priceHigh':
                const priceOrderDesc = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
                restaurants.sort((a, b) => 
                    (priceOrderDesc[b.priceRange] || 2) - (priceOrderDesc[a.priceRange] || 2)
                );
                break;
            default:
                // Default: sort by open status first, then by rating
                restaurants.sort((a, b) => {
                    if (a.isOpen !== b.isOpen) return b.isOpen ? 1 : -1;
                    return (b.rating || 0) - (a.rating || 0);
                });
        }

        return { success: true, data: restaurants };
    } catch (error) {
        logError('GET_ALL_RESTAURANTS_ERROR', error);
        
        if (error.code === 'unavailable' || error.message?.includes('network')) {
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
            error: 'Failed to fetch restaurants',
            errorCode: 'FETCH_ERROR',
            retryable: true
        };
    }
};

/**
 * Get nearby restaurants within a radius
 */
export const getNearbyRestaurants = async (latitude, longitude, radiusKm = 10, limit = 10) => {
    try {
        const result = await getAllRestaurants({ latitude, longitude });
        
        if (!result.success) return result;

        const nearby = result.data
            .filter(r => r.distance && r.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, limit);

        return { success: true, data: nearby };
    } catch (error) {
        logError('GET_NEARBY_RESTAURANTS_ERROR', error);
        return { 
            success: false, 
            error: 'Failed to fetch nearby restaurants',
            errorCode: 'FETCH_ERROR',
            retryable: true
        };
    }
};

/**
 * Get restaurant by ID
 */
export const getRestaurantById = async (restaurantId, userLocation = null) => {
    try {
        if (!restaurantId) {
            return { 
                success: false, 
                error: 'Restaurant ID is required',
                errorCode: 'VALIDATION_ERROR',
                retryable: false
            };
        }

        const doc = await collectionRef().doc(restaurantId).get();

        if (!doc.exists) {
            return { 
                success: false, 
                error: 'Restaurant not found',
                errorCode: 'NOT_FOUND',
                retryable: false
            };
        }

        const restaurant = enrichRestaurant(mapRestaurant(doc), userLocation);
        return { success: true, data: restaurant };
    } catch (error) {
        logError('GET_RESTAURANT_BY_ID_ERROR', error, { restaurantId });

        if (error.code === 'permission-denied') {
            return { 
                success: false, 
                error: 'Access denied',
                errorCode: 'PERMISSION_DENIED',
                retryable: false
            };
        }

        if (error.code === 'unavailable' || error.message?.includes('network')) {
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
            error: 'Failed to fetch restaurant',
            errorCode: 'FETCH_ERROR',
            retryable: true
        };
    }
};

/**
 * Search restaurants by name or category
 */
export const searchRestaurants = async (query, userLocation = null, filters = {}) => {
    try {
        if (!query || query.trim().length < 2) {
            return { success: true, data: [] };
        }

        const searchTerm = query.toLowerCase().trim();
        const result = await getAllRestaurants(userLocation, filters);
        
        if (!result.success) return result;

        const matches = result.data.filter(restaurant => {
            const nameMatch = restaurant.name?.toLowerCase().includes(searchTerm);
            const categoryMatch = restaurant.categories?.some(
                cat => cat.toLowerCase().includes(searchTerm)
            );
            const descriptionMatch = restaurant.description?.toLowerCase().includes(searchTerm);
            
            return nameMatch || categoryMatch || descriptionMatch;
        });

        return { success: true, data: matches };
    } catch (error) {
        logError('SEARCH_RESTAURANTS_ERROR', error, { query });
        return { 
            success: false, 
            error: 'Search failed',
            errorCode: 'SEARCH_ERROR',
            retryable: true
        };
    }
};

/**
 * Get restaurant menu
 */
export const getRestaurantMenu = async (restaurantId) => {
    try {
        if (!restaurantId) {
            return { 
                success: false, 
                error: 'Restaurant ID is required',
                errorCode: 'VALIDATION_ERROR',
                retryable: false
            };
        }

        const snapshot = await firebaseFirestore()
            .collection('restaurants')
            .doc(restaurantId)
            .collection('menuItems')
            .where('available', '==', true)
            .get();

        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Group by category
        const menuByCategory = items.reduce((acc, item) => {
            const category = item.category || 'Other';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {});

        return { 
            success: true, 
            data: {
                items,
                byCategory: menuByCategory,
                categories: Object.keys(menuByCategory),
            }
        };
    } catch (error) {
        logError('GET_RESTAURANT_MENU_ERROR', error, { restaurantId });

        if (error.code === 'unavailable' || error.message?.includes('network')) {
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
            error: 'Failed to fetch menu',
            errorCode: 'FETCH_ERROR',
            retryable: true
        };
    }
};

/**
 * Listen to restaurant updates in real-time
 */
export const listenRestaurant = (restaurantId, callback) => {
    if (!restaurantId) {
        callback({ 
            success: false, 
            error: 'Restaurant ID is required',
            errorCode: 'VALIDATION_ERROR'
        });
        return () => {};
    }

    try {
        return collectionRef()
            .doc(restaurantId)
            .onSnapshot(
                (doc) => {
                    if (!doc.exists) {
                        callback({ 
                            success: false, 
                            error: 'Restaurant not found',
                            errorCode: 'NOT_FOUND'
                        });
                        return;
                    }

                    const restaurant = enrichRestaurant(mapRestaurant(doc));
                    callback({ success: true, data: restaurant });
                },
                (error) => {
                    logError('RESTAURANT_LISTENER_ERROR', error, { restaurantId });
                    callback({ 
                        success: false, 
                        error: 'Failed to listen to restaurant updates',
                        errorCode: 'LISTENER_ERROR',
                        retryable: true
                    });
                }
            );
    } catch (error) {
        logError('SETUP_RESTAURANT_LISTENER_ERROR', error, { restaurantId });
        callback({ 
            success: false, 
            error: 'Failed to set up listener',
            errorCode: 'SETUP_ERROR'
        });
        return () => {};
    }
};

/**
 * Get featured/top-rated restaurants
 */
export const getFeaturedRestaurants = async (userLocation = null, limit = 6) => {
    try {
        const result = await getAllRestaurants(userLocation);
        
        if (!result.success) return result;

        const featured = result.data
            .filter(r => r.rating >= 4.0)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);

        return { success: true, data: featured };
    } catch (error) {
        logError('GET_FEATURED_RESTAURANTS_ERROR', error);
        return { 
            success: false, 
            error: 'Failed to fetch featured restaurants',
            errorCode: 'FETCH_ERROR',
            retryable: true
        };
    }
};

/**
 * Get available categories from all restaurants
 */
export const getCategories = async () => {
    try {
        const result = await getAllRestaurants();
        
        if (!result.success) return result;

        const categoriesSet = new Set();
        result.data.forEach(restaurant => {
            restaurant.categories?.forEach(cat => categoriesSet.add(cat));
        });

        const categories = Array.from(categoriesSet).sort();
        return { success: true, data: categories };
    } catch (error) {
        logError('GET_CATEGORIES_ERROR', error);
        return { 
            success: false, 
            error: 'Failed to fetch categories',
            errorCode: 'FETCH_ERROR',
            retryable: true
        };
    }
};

