'use client';

import { createContext, useState, ReactNode, useEffect } from 'react';
import type { CartItem, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
  setDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';

interface CartContextType {
  cartItems: CartItem[];
  addItem: (product: Product, size: string, quantity: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  isLoading: boolean;
}

export const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const cartItemsRef = useMemoFirebase(
    () =>
      user && firestore
        ? collection(firestore, 'users', user.uid, 'shopping_cart_items')
        : null,
    [user, firestore]
  );

  const { data: cartItems, isLoading } = useCollection<CartItem>(cartItemsRef);

  const addItem = (product: Product, size: string, quantity: number) => {
    if (!user || !firestore) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to add items to your cart.',
        variant: 'destructive',
      });
      return;
    }

    const cartDocRef = doc(
      firestore,
      'users',
      user.uid,
      'shopping_cart_items',
      `${product.id}_${size}`
    );
    
    const existingItem = cartItems?.find(item => item.id === `${product.id}_${size}`);

    if (existingItem) {
        updateDocumentNonBlocking(cartDocRef, {
            quantity: existingItem.quantity + quantity
        });
    } else {
        setDocumentNonBlocking(cartDocRef, {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            size,
            imageId: product.imageIds && product.imageIds.length > 0 ? product.imageIds[0] : '',
          }, { merge: true });
    }

    toast({
      title: 'Added to cart',
      description: `${quantity} x ${product.name} (${size})`,
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (!user || !firestore) return;
    const cartDocRef = doc(
      firestore,
      'users',
      user.uid,
      'shopping_cart_items',
      itemId
    );

    if (quantity > 0) {
      updateDocumentNonBlocking(cartDocRef, { quantity });
    } else {
      deleteDocumentNonBlocking(cartDocRef);
    }
  };

  const removeItem = (itemId: string) => {
    if (!user || !firestore) return;
    const cartDocRef = doc(
      firestore,
      'users',
      user.uid,
      'shopping_cart_items',
      itemId
    );
    deleteDocumentNonBlocking(cartDocRef);
    
    const removedItem = cartItems?.find((item) => item.id === itemId);
    if (removedItem) {
      toast({
        title: 'Item removed',
        description: `${removedItem.name} has been removed from your cart.`,
        variant: 'destructive',
      });
    }
  };

  const clearCart = () => {
    if (!user || !firestore || !cartItems) return;
    for (const item of cartItems) {
      const cartDocRef = doc(
        firestore,
        'users',
        user.uid,
        'shopping_cart_items',
        item.id
      );
      deleteDocumentNonBlocking(cartDocRef);
    }
  };

  const cartTotal = (cartItems ?? []).reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const itemCount = (cartItems ?? []).reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems: cartItems ?? [],
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        cartTotal,
        itemCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
