import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

const CART_STORAGE_KEY = '@food_ordering_cart';

// Initial cart state
const initialState = {
    restaurantId: null,
    restaurantName: null,
    restaurantImage: null,
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
            const { item, restaurant } = action.payload;
            
            // Check if we need to switch restaurants
            if (state.restaurantId && state.restaurantId !== restaurant.id) {
                // This case should be handled before calling ADD_ITEM
                // Return current state if restaurant doesn't match
                return state;
            }

            // Check if item already exists (with same options)
            const existingIndex = state.items.findIndex(
                i => i.id === item.id && 
                JSON.stringify(i.options) === JSON.stringify(item.options || {})
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

            const totals = calculateTotals(newItems, restaurant.deliveryFee || state.deliveryFee);
            
            return {
                ...state,
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
                restaurantImage: restaurant.image,
                deliveryFee: restaurant.deliveryFee || 0,
                estimatedTime: restaurant.estimatedDeliveryTime || 30,
                items: newItems,
                ...totals,
            };
        }

        case 'UPDATE_QUANTITY': {
            const { itemId, quantity, options } = action.payload;
            
            if (quantity <= 0) {
                // Remove item
                const newItems = state.items.filter(
                    i => !(i.id === itemId && JSON.stringify(i.options) === JSON.stringify(options || {}))
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

            const newItems = state.items.map(i => 
                i.id === itemId && JSON.stringify(i.options) === JSON.stringify(options || {})
                    ? { ...i, quantity }
                    : i
            );
            
            const totals = calculateTotals(newItems, state.deliveryFee);
            return { ...state, items: newItems, ...totals };
        }

        case 'REMOVE_ITEM': {
            const { itemId, options } = action.payload;
            const newItems = state.items.filter(
                i => !(i.id === itemId && JSON.stringify(i.options) === JSON.stringify(options || {}))
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
            const { restaurant } = action.payload;
            return {
                ...initialState,
                isLoading: false,
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
                restaurantImage: restaurant.image,
                deliveryFee: restaurant.deliveryFee || 0,
                estimatedTime: restaurant.estimatedDeliveryTime || 30,
            };
        }

        default:
            return state;
    }
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
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

    // Save cart to storage whenever it changes
    useEffect(() => {
        if (!state.isLoading) {
            const saveCart = async () => {
                try {
                    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
                } catch (error) {
                    console.error('Error saving cart:', error);
                }
            };
            saveCart();
        }
    }, [state, state.isLoading]);

    // Add item to cart
    const addItem = useCallback((item, restaurant) => {
        dispatch({ type: 'ADD_ITEM', payload: { item, restaurant } });
    }, []);

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
        dispatch({ type: 'SET_RESTAURANT', payload: { restaurant } });
    }, []);

    // Check if cart has items from a different restaurant
    const hasConflictingRestaurant = useCallback((restaurantId) => {
        return state.restaurantId && state.restaurantId !== restaurantId && state.items.length > 0;
    }, [state.restaurantId, state.items.length]);

    // Get item count
    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

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

