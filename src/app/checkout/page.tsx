
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import CheckoutForm from '@/components/checkout-form';
import { useState } from 'react';
import type { ShippingRate } from '@/lib/types';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CheckoutPage() {
  const { cartItems, cartTotal } = useCart();
  const firestore = useFirestore();
  const [selectedGovernorate, setSelectedGovernorate] = useState<ShippingRate | null>(null);

  const shippingRatesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'shipping_rates') : null),
    [firestore]
  );
  const { data: shippingRates, isLoading: ratesLoading } = useCollection<ShippingRate>(shippingRatesQuery);

  const handleGovernorateChange = (governorateId: string) => {
    const rate = shippingRates?.find(r => r.id === governorateId) || null;
    setSelectedGovernorate(rate);
  };
  
  const shippingCost = selectedGovernorate?.rate ?? 0;
  const finalTotal = cartTotal + shippingCost;


  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold font-headline mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">
          Add some items to your cart before you can check out.
        </p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16">
      <h1 className="text-4xl font-headline font-bold mb-8 text-center">Checkout</h1>
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold font-headline mb-6">Order Summary</h2>
            <ScrollArea className="h-full max-h-[400px]">
              <div className="space-y-4 pr-6">
                {cartItems.map((item) => {
                  return (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                         {item.imageUrl ? (
                            <Image
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                         ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">No Image</span>
                          </div>
                         )}
                         <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                            {item.quantity}
                         </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                      </div>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <Separator className="my-6" />
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span>Shipping</span>
                    {shippingRates && shippingRates.length > 0 ? (
                        <Select onValueChange={handleGovernorateChange}>
                            <SelectTrigger className="w-[200px] h-9">
                                <SelectValue placeholder="Select Governorate" />
                            </SelectTrigger>
                            <SelectContent>
                                {shippingRates.map(rate => (
                                    <SelectItem key={rate.id} value={rate.id}>
                                        {rate.governorate}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <span>{ratesLoading ? 'Loading...' : 'N/A'}</span>
                    )}
                 </div>
                 {selectedGovernorate && (
                    <div className="flex justify-between text-muted-foreground">
                        <span>Shipping to {selectedGovernorate.governorate}</span>
                        <span>{formatPrice(shippingCost)}</span>
                    </div>
                 )}
                <div className="flex justify-between">
                    <span>Taxes</span>
                    <span>Calculated at next step</span>
                </div>
                <Separator className="my-2"/>
                <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                </div>
                 <p className="text-sm text-destructive text-center pt-2">الشحن من 3 الى سبع ايام</p>
            </div>
          </CardContent>
        </Card>
        <CheckoutForm selectedGovernorate={selectedGovernorate} shippingCost={shippingCost} />
      </div>
    </div>
  );
}
