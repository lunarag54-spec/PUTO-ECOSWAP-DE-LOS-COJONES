import { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../types';

interface CartItem extends Product {
    quantity: number;
}

export type { CartItem };

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product) => boolean;
    removeFromCart: (productId: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export type { CartContextType };

const CartContext = createContext<CartContextType | undefined>(undefined);

export { CartContext };

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (product: Product): boolean => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            return false;
        }
        setCart(prev => [...prev, { ...product, quantity: 1 }]);
        return true;
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const clearCart = () => setCart([]);

    const getTotalItems = () => cart.reduce((total, item) => total + item.quantity, 0);

    const getTotalPrice = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getTotalItems, getTotalPrice }}>
            {children}
        </CartContext.Provider>
    );
};