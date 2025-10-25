
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Home, Loader2 } from 'lucide-react';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Order, ShippingRate } from '@/lib/types';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().min(10, { message: 'A valid phone number is required.'}),
  address: z.string().min(5, { message: 'Address is required.' }),
  city: z.string().min(2, { message: 'City is required.' }),
  zip: z.string().min(5, { message: 'A valid ZIP code is required.' }),
});

interface CheckoutFormProps {
    selectedGovernorate: ShippingRate | null;
    shippingCost: number;
}

export default function CheckoutForm({ selectedGovernorate, shippingCost }: CheckoutFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { cartItems, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || '',
      name: '',
      phone: '',
      address: '',
      city: '',
      zip: '',
    },
  });

  useEffect(() => {
    if (user?.displayName) {
        form.setValue('name', user.displayName);
    }
  }, [user, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    
    if (!selectedGovernorate) {
        toast({
            title: 'Shipping Not Selected',
            description: 'Please select a governorate for shipping.',
            variant: 'destructive'
        });
        return;
    }

    setIsProcessing(true);
    
    if (!firestore) {
      toast({ title: 'Error', description: 'Could not connect to the database.', variant: 'destructive'});
      setIsProcessing(false);
      return;
    }

    const now = new Date();
    const orderId = format(now, 'yyMMdd-HHmmss-') + Math.random().toString(36).substring(2, 7);
    const orderDocRef = doc(firestore, 'orders', orderId);
    
    const finalTotal = cartTotal + shippingCost;

    const newOrder: Omit<Order, 'id'> = {
      userId: user?.uid || null,
      customerInfo: {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        city: values.city,
        zip: values.zip,
        governorate: selectedGovernorate.governorate,
      },
      items: cartItems.map(item => ({
        id: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        imageUrl: item.imageUrl,
      })),
      total: finalTotal,
      shippingCost: shippingCost,
      createdAt: serverTimestamp(),
      orderStatus: 'Pending',
    };

    try {
      setDocumentNonBlocking(orderDocRef, newOrder, { merge: true });
      
      toast({
        title: 'Order Placed!',
        description: 'Your order has been successfully placed. We will contact you for delivery.',
      });
      clearCart();
      router.push('/');
    } catch (error) {
       toast({
        title: 'Error Placing Order',
        description: 'There was a problem placing your order. Please try again.',
        variant: 'destructive'
      });
    } finally {
       setIsProcessing(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold font-headline">Shipping Information</CardTitle>
        <CardDescription>Payment will be made upon delivery.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 01xxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <h3 className="font-semibold text-lg pt-4">Shipping Address</h3>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Cairo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 11511" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={isProcessing || cartItems.length === 0}>
               {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <Home className="mr-2 h-4 w-4" />
                  Place Order (Cash on Delivery)
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
