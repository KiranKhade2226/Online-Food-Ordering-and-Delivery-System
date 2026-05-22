import { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });

  const refreshCart = async () => {
    if (!user?.role) return;
    if (user.role !== 'customer') return;

    const { data } = await client.get('/cart');
    setCart(data.data || { items: [] });
  };

  useEffect(() => {
    refreshCart().catch(() => setCart({ items: [] }));
  }, [user?.role]);

  const addToCart = async (item) => {
    const { data } = await client.post('/cart', item);
    setCart(data.data);
    return data.data;
  };

  const removeFromCart = async (itemId) => {
    const { data } = await client.delete(`/cart/${itemId}`);
    setCart(data.data);
    return data.data;
  };

  const clearCart = async () => {
    const { data } = await client.delete('/cart');
    setCart(data.data);
    return data.data;
  };

  return <CartContext.Provider value={{ cart, setCart, refreshCart, addToCart, removeFromCart, clearCart }}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
