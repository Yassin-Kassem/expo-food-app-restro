import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocation } from './LocationContext';

const CartContext = createContext();

const CART_STORAGE_KEY = '@food_ordering_cart';

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
    return R * c; // Distance in km
};

// Calculate delivery fee based on distance
// Base fee: £2.50, then £0.50 per km after first 2km
const calculateDeliveryFee = (distanceInKm, restaurantLocation, userLocation) => {
    // If no location data, return default fee
    if (!restaurantLocation || !userLocation) {
        return 2.50; // Default base fee
    }
    
    const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        restaurantLocation.lat,
        restaurantLocation.lng
    );
    
    // Base fee for first 2km
    const baseFee = 2.50;
    const perKmFee = 0.50;
    const freeKm = 2;
    
    if (distance <= freeKm) {
        return baseFee;
    }
    
    // Calculate fee: base + (distance - freeKm) * perKmFee
    const additionalKm = distance - freeKm;
    const fee = baseFee + (additionalKm * perKmFee);
    
    // Round to 2 decimal places
    return Math.round(fee * 100) / 100;
};

// Custom debounce function
const debounce = (func, wait) => {
    let timeout;
    const debounced = (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
    debounced.cancel = () => {
        clearTimeout(timeout);
    };
    return debounced;
};

// Hash function for options comparison (faster than JSON.stringify)
const hashOptions = (options) => {
    if (!options || Object.keys(options).length === 0) return '';
    return Object.keys(options)
        .sort()
        .map(k => `${k}:${options[k]}`)
        .join('|');
};

// Initial cart state
const initialState = {
    restaurantId: null,
    restaurantName: null,
    restaurantImage: null,
    restaurantLocation: null, // Store restaurant location for delivery fee calculation
    items: [],
    subtotal: 0,
    tax: 0,
    deliveryFee: 0,
    total: 0,
    estimatedTime: 0,
    isLoading: true,
};

// Tax rate (can be adjusted per location)
const TAX_RATE = 0.0825; // 8.25%

// Calculate cart totals
const calculateTotals = (items, deliveryFee = 0) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax + deliveryFee;
    
    return {
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        total: Math.round(total * 100) / 100,
    };
};

// Cart reducer
const cartReducer = (state, action) => {
    switch (action.type) {
        case 'LOAD_CART':
            return {
                ...action.payload,
                isLoading: false,
            };
            
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload,
            };

        case 'ADD_ITEM': {
            const { item, restaurant, userLocation } = action.payload;
            
            // Check if we need to switch restaurants
            if (state.restaurantId && state.restaurantId !== restaurant.id) {
                // This case should be handled before calling ADD_ITEM
                // Return current state if restaurant doesn't match
                return state;
            }

            // Check if item already exists (with same options)
            const itemOptionsHash = hashOptions(item.options);
            const existingIndex = state.items.findIndex(
                i => i.id === item.id && hashOptions(i.options) === itemOptionsHash
            );

            let newItems;
            if (existingIndex >= 0) {
                // Update quantity
                newItems = state.items.map((i, index) => 
                    index === existingIndex 
                        ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                        : i
                );
            } else {
                // Add new item
                newItems = [
                    ...state.items,
                    {
                        ...item,
                        quantity: item.quantity || 1,
                        options: item.options || {},
                        specialInstructions: item.specialInstructions || '',
                    }
                ];
            }

            // Calculate delivery fee based on distance
            const calculatedDeliveryFee = calculateDeliveryFee(
                null, // distance will be calculated inside
                restaurant.location,
                userLocation
            );

            const totals = calculateTotals(newItems, calculatedDeliveryFee);
            
            return {
                ...state,
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
                restaurantImage: restaurant.image,
                restaurantLocation: restaurant.location || null,
                deliveryFee: calculatedDeliveryFee,
                estimatedTime: restaurant.estimatedDeliveryTime || 30,
                items: newItems,
                ...totals,
            };
        }

        case 'UPDATE_QUANTITY': {
            const { itemId, quantity, options } = action.payload;
            
            if (quantity <= 0) {
                // Remove item
                const optionsHash = hashOptions(options);
                const newItems = state.items.filter(
                    i => !(i.id === itemId && hashOptions(i.options) === optionsHash)
                );
                
                if (newItems.length === 0) {
                    return {
                        ...initialState,
                        isLoading: false,
                    };
                }
                
                const totals = calculateTotals(newItems, state.deliveryFee);
                return { ...state, items: newItems, ...totals };
            }

            const optionsHash = hashOptions(options);
            const newItems = state.items.map(i => 
                i.id === itemId && hashOptions(i.options) === optionsHash
                    ? { ...i, quantity }
                    : i
            );
            
            const totals = calculateTotals(newItems, state.deliveryFee);
            return { ...state, items: newItems, ...totals };
        }

        case 'REMOVE_ITEM': {
            const { itemId, options } = action.payload;
            const optionsHash = hashOptions(options);
            const newItems = state.items.filter(
                i => !(i.id === itemId && hashOptions(i.options) === optionsHash)
            );

            if (newItems.length === 0) {
                return {
                    ...initialState,
                    isLoading: false,
                };
            }

            const totals = calculateTotals(newItems, state.deliveryFee);
            return { ...state, items: newItems, ...totals };
        }

        case 'CLEAR_CART':
            return {
                ...initialState,
                isLoading: false,
            };

        case 'SET_RESTAURANT': {
            const { restaurant, userLocation } = action.payload;
            // Calculate delivery fee based on distance
            const calculatedDeliveryFee = calculateDeliveryFee(
                null,
                restaurant.location,
                userLocation
            );
            return {
                ...initialState,
                isLoading: false,
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
                restaurantImage: restaurant.image,
                restaurantLocation: restaurant.location || null,
                deliveryFee: calculatedDeliveryFee,
                estimatedTime: restaurant.estimatedDeliveryTime || 30,
            };
        }

        case 'UPDATE_DELIVERY_FEE': {
            const { userLocation } = action.payload;
            // Use stored restaurant location
            const calculatedDeliveryFee = calculateDeliveryFee(
                null,
                state.restaurantLocation,
                userLocation
            );
            const totals = calculateTotals(state.items, calculatedDeliveryFee);
            return {
                ...state,
                deliveryFee: calculatedDeliveryFee,
                ...totals,
            };
        }

        default:
            return state;
    }
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
    const { location: userLocation } = useLocation();
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Load cart from storage on mount
    useEffect(() => {
        const loadCart = async () => {
            try {
                const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
                if (savedCart) {
                    const parsedCart = JSON.parse(savedCart);
                    dispatch({ type: 'LOAD_CART', payload: parsedCart });
                } else {
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };
        loadCart();
    }, []);

    // Debounced save cart to storage
    const saveCartDebounced = useMemo(
        () => debounce(async (cartState) => {
            try {
                await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
            } catch (error) {
                console.error('Error saving cart:', error);
            }
        }, 500),
        []
    );

    // Save cart to storage whenever it changes (debounced)
    useEffect(() => {
        if (!state.isLoading) {
            saveCartDebounced(state);
        }
        return () => {
            saveCartDebounced.cancel();
        };
    }, [state, state.isLoading, saveCartDebounced]);

    // Add item to cart
    const addItem = useCallback((item, restaurant) => {
        dispatch({ type: 'ADD_ITEM', payload: { item, restaurant, userLocation } });
    }, [userLocation]);

    // Update item quantity
    const updateQuantity = useCallback((itemId, quantity, options = {}) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity, options } });
    }, []);

    // Remove item from cart
    const removeItem = useCallback((itemId, options = {}) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { itemId, options } });
    }, []);

    // Clear entire cart
    const clearCart = useCallback(() => {
        dispatch({ type: 'CLEAR_CART' });
    }, []);

    // Switch to a different restaurant (clears current cart)
    const switchRestaurant = useCallback((restaurant) => {
        dispatch({ type: 'SET_RESTAURANT', payload: { restaurant, userLocation } });
    }, [userLocation]);

    // Update delivery fee when location changes
    useEffect(() => {
        if (userLocation && state.restaurantLocation && state.items.length > 0) {
            dispatch({ type: 'UPDATE_DELIVERY_FEE', payload: { userLocation } });
        }
    }, [userLocation, state.restaurantLocation, state.items.length]);

    // Check if cart has items from a different restaurant
    const hasConflictingRestaurant = useCallback((restaurantId) => {
        return state.restaurantId && state.restaurantId !== restaurantId && state.items.length > 0;
    }, [state.restaurantId, state.items.length]);

    // Get item count (memoized)
    const itemCount = useMemo(
        () => state.items.reduce((sum, item) => sum + item.quantity, 0),
        [state.items]
    );

    const value = {
        ...state,
        itemCount,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        switchRestaurant,
        hasConflictingRestaurant,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook to use cart context
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default CartContext;

