import { useState, useCallback, useMemo } from 'react';
import { Product } from '@/lib/services/cashier-service';

export interface CartItem extends Product {
  quantity: number;
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalAmount,
  };
}
