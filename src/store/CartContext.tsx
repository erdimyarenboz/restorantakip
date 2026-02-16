import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CartState, CartAction, Product, CartItem } from '../types';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { useToast } from './ToastContext';

const CART_STORAGE_KEY = 'cart_v1';

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    total: number;
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingIndex = state.items.findIndex(
                (item) => item.product.id === action.product.id
            );

            if (existingIndex >= 0) {
                const newItems = [...state.items];
                newItems[existingIndex] = {
                    ...newItems[existingIndex],
                    quantity: newItems[existingIndex].quantity + 1,
                };
                return { items: newItems };
            }

            return {
                items: [...state.items, { product: action.product, quantity: 1 }],
            };
        }

        case 'REMOVE_ITEM': {
            return {
                items: state.items.filter((item) => item.product.id !== action.productId),
            };
        }

        case 'UPDATE_QUANTITY': {
            if (action.quantity <= 0) {
                return {
                    items: state.items.filter((item) => item.product.id !== action.productId),
                };
            }

            return {
                items: state.items.map((item) =>
                    item.product.id === action.productId
                        ? { ...item, quantity: action.quantity }
                        : item
                ),
            };
        }

        case 'CLEAR_CART': {
            return { items: [] };
        }

        default:
            return state;
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const { showToast } = useToast();
    const [state, dispatch] = useReducer(cartReducer, { items: [] }, (initial) => {
        return { items: getStorageItem<CartItem[]>(CART_STORAGE_KEY, initial.items) };
    });

    // Sync to localStorage whenever cart changes
    useEffect(() => {
        setStorageItem(CART_STORAGE_KEY, state.items);
    }, [state.items]);

    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );
    const total = subtotal; // No shipping in restaurant

    const addItem = (product: Product) => {
        dispatch({ type: 'ADD_ITEM', product });
        showToast(`${product.name} sepete eklendi! 🛒`, 'success');
    };

    const removeItem = (productId: string) => {
        dispatch({ type: 'REMOVE_ITEM', productId });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', productId, quantity });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    return (
        <CartContext.Provider
            value={{
                items: state.items,
                itemCount,
                subtotal,
                total,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
}
