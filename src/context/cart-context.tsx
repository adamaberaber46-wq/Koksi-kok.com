'use client';

import { createContext, useState, ReactNode, useEffect } from 'react';
import type { CartItem, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  cartItems: CartItem[];
  addItem: (product: Product, size: string, quantity: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addItem = (product: Product, size: string, quantity: number) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.id === product.id && item.size === size
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          size,
          imageId: product.imageIds[0],
        },
      ];
    });
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} (${size})`,
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    const removedItem = cartItems.find(item => item.id === itemId);
    if (removedItem) {
      toast({
        title: "Item removed",
        description: `${removedItem.name} has been removed from your cart.`,
        variant: 'destructive',
      });
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const itemCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        cartTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
