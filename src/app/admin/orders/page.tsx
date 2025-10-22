'use client';

import { useCollection, useFirestore } from '@/firebase';
import { collection, orderBy, query } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import type { Order } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatPrice } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export default function OrdersPage() {
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'orders'), orderBy('createdAt', 'desc')) : null),
    [firestore]
  );

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Customer Orders</CardTitle>
          <CardDescription>View and manage all incoming orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No orders have been placed yet.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {orders.map((order) => (
                <AccordionItem key={order.id} value={order.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between w-full pr-4">
                        <div>
                            <p className="font-semibold text-left">{order.customerInfo.name}</p>
                            <p className="text-sm text-muted-foreground text-left">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="hidden sm:inline-flex">{order.items.length} items</Badge>
                            <p className="font-semibold">{formatPrice(order.total)}</p>
                        </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="p-4 bg-muted/50 rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h4 className="font-semibold mb-2">Customer & Shipping</h4>
                                <p className="text-sm">{order.customerInfo.name}</p>
                                <p className="text-sm text-muted-foreground">{order.customerInfo.email}</p>
                                <p className="text-sm text-muted-foreground">{order.customerInfo.phone}</p>
                                <p className="text-sm text-muted-foreground mt-2">{order.customerInfo.address}, {order.customerInfo.city}, {order.customerInfo.zip}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Order Details</h4>
                                <p className="text-sm text-muted-foreground">Order ID: {order.id}</p>
                                <p className="text-sm text-muted-foreground">User ID: {order.userId || "Guest"}</p>
                            </div>
                        </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">Item</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items.map((item) => (
                            <TableRow key={item.id + item.size}>
                              <TableCell>
                                <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                                    <Image
                                        src={item.imageUrl || '/placeholder.svg'}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.quantity} x {formatPrice(item.price)}
                                </p>
                                 <p className="text-sm text-muted-foreground">Size: {item.size}</p>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatPrice(item.price * item.quantity)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
