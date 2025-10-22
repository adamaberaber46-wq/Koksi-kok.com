'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus, Trash2, X, ShoppingCart, Loader2 } from 'lucide-react';
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from './ui/separator';
import placeholderImages from '@/lib/placeholder-images.json';

export default function CartSheet() {
  const { cartItems, updateQuantity, removeItem, cartTotal, clearCart, isLoading } = useCart();

  return (
    <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
      <SheetHeader className="px-6">
        <SheetTitle>Shopping Cart</SheetTitle>
      </SheetHeader>
      <Separator />
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
        </div>
      ) : cartItems.length > 0 ? (
        <>
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-6 p-6">
              {cartItems.map((item) => {
                const image = item.imageId ? placeholderImages.find((img) => img.id === item.imageId) : null;
                return (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="relative h-24 w-24 overflow-hidden rounded-md">
                      {image ? (
                         <Image
                            src={image.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            data-ai-hint={image.imageHint}
                          />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                      <p className="text-sm font-medium">{formatPrice(item.price)}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <Separator />
          <SheetFooter className="p-6">
            <div className="w-full space-y-4">
                <div className="flex justify-between font-semibold">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                </div>
                <p className="text-sm text-muted-foreground">Shipping and taxes calculated at checkout.</p>
                <SheetClose asChild>
                    <Button asChild className="w-full">
                        <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                </SheetClose>
                <Button variant="outline" className="w-full" onClick={clearCart}>
                    Clear Cart
                </Button>
            </div>
          </SheetFooter>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          <h3 className="text-xl font-semibold">Your cart is empty</h3>
          <p className="text-muted-foreground">Looks like you haven't added anything yet.</p>
          <SheetClose asChild>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </SheetClose>
        </div>
      )}
    </SheetContent>
  );
}
