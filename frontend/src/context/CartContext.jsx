import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCart(null);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            const response = await api.get('/cart');
            setCart(response.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const addToCart = async (productId, quantity) => {
        try {
            const response = await api.post('/cart/items', {
                product_id: productId,
                quantity: quantity
            });
            setCart(response.data);
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    };

    const updateQuantity = async (itemId, newQuantity) => {
        try {
            const response = await api.put(`/cart/items/${itemId}`, { quantity: newQuantity });
            setCart(response.data);
        } catch (error) {
            console.error('Error updating quantity:', error);
            throw error;
        }
    };

    const removeItem = async (itemId) => {
        try {
            const response = await api.delete(`/cart/items/${itemId}`);
            setCart(response.data);
        } catch (error) {
            console.error('Error removing item:', error);
            throw error;
        }
    };

    const cartCount = cart ? cart.items.length : 0;

    return (
        <CartContext.Provider value={{ cart, cartCount, fetchCart, addToCart, updateQuantity, removeItem }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
