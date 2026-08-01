import React, { createContext, useReducer, useContext, useEffect } from 'react';

// Contexts
const CartStateContext = createContext();
const CartDispatcherContext = createContext();

// Reducer to handle cart actions
const reducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItem = state.find(item => item.id === action.id);
            if (existingItem) {
                return state.map(item =>
                    item.id === action.id
                        ? { ...item, quantity: item.quantity + (action.quantity || 1) }
                        : item
                );
            }
            return [...state, {
                id: action.id,
                name: action.name,
                price: action.price,
                image: action.image,
                mrp: action.mrp,
                quantity: action.quantity || 1
            }];
        }

        case 'REMOVE_ITEM':
            return state.filter(item => item.id !== action.payload.id);

        case 'UPDATE_QUANTITY':
            return state.map(item =>
                item.id === action.payload.id
                    ? { ...item, quantity: action.payload.quantity }
                    : item
            );

        case 'CLEAR_CART':
            return [];

        default:
            return state;
    }
};


// CartProvider component to wrap around your app
export const CartProvider = ({ children }) => {
    const readInitialCart = () => {
        try {
            if (typeof window === "undefined") return [];
            return JSON.parse(sessionStorage.getItem('cart')) || [];
        } catch {
            return [];
        }
    };

    // Load cart once on mount, then keep it in memory for the active session.
    const [state, dispatch] = useReducer(reducer, undefined, readInitialCart);

    useEffect(() => {
        if (state.length > 0) {
            sessionStorage.setItem('cart', JSON.stringify(state));
        } else {
            sessionStorage.removeItem('cart');
        }
    }, [state]);

    return (
        <CartStateContext.Provider value={state}>
            <CartDispatcherContext.Provider value={dispatch}>
                {children}
            </CartDispatcherContext.Provider>
        </CartStateContext.Provider>
    );
};

// Custom hook to access cart state
export const useCartState = () => {
    return useContext(CartStateContext);
};

// Custom hook to access cart dispatch function
export const useCartDispatch = () => {
    return useContext(CartDispatcherContext);
};
