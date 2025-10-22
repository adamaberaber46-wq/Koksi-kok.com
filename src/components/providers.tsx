'use client';

import { CartProvider } from '@/context/cart-context';
import { FirebaseClientProvider } from '@/firebase';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseClientProvider>
      <CartProvider>{children}</CartProvider>
    </FirebaseClientProvider>
  );
}
