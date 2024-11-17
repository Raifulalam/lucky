import React, { createContext, useReducer, useContext, useEffect } from 'react';

// Contexts
const CartStateContext = createContext();
const CartDispatcherContext = createContext();

// Reducer to handle cart actions
const reducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM':
            return [...state, {
                id: action.id,
                name: action.name,
                price: action.price,
                image: action.image,
                mrp: action.mrp,
                quantity: action.quantity || 1
            }];

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
    // Try to load cart from localStorage, or default to an empty array
    const initialState = JSON.parse(localStorage.getItem('cart')) || [];

    // Use the reducer to manage cart state
    const [state, dispatch] = useReducer(reducer, initialState);

    // Persist cart to localStorage whenever it changes
    useEffect(() => {
        if (state.length > 0) {
            // Save the cart state to localStorage when cart changes
            localStorage.setItem('cart', JSON.stringify(state));
        } else {
            // If the cart is empty, remove it from localStorage
            localStorage.removeItem('cart');
        }
    }, [state]); // This effect runs every time `state` changes

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
