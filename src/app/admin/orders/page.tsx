'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase';
import { useUser } from '@/firebase/provider';
import { collection, orderBy, query, doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import type { Order, OrderStatus } from '@/lib/types';
import { ORDER_STATUSES } from '@/lib/types';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Loader2, MoreHorizontal } from 'lucide-react';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OrdersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const ordersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'orders'), orderBy('createdAt', 'desc')) : null),
    [firestore]
  );

  const { data: orders, isLoading } = useCollection<Order>(ordersQuery);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    if (!firestore) return;
    const orderDocRef = doc(firestore, 'orders', orderId);
    updateDocumentNonBlocking(orderDocRef, { orderStatus: status });
    toast({
        title: "Order Updated",
        description: `Order status has been marked as ${status}.`
    });
  };

  const getStatusBadgeVariant = (status: OrderStatus): "default" | "secondary" | "destructive" => {
    switch (status) {
        case 'Shipped':
        case 'Delivered':
            return 'default';
        case 'Cancelled':
            return 'destructive';
        case 'Pending':
        default:
            return 'secondary';
    }
  }

  if (isUserLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
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
                    <div className="flex items-center w-full">
                        <AccordionTrigger className="flex-1">
                            <div className="grid grid-cols-2 sm:grid-cols-3 w-full pr-4 items-center text-left">
                                <div className='flex flex-col sm:flex-row sm:items-center sm:gap-4'>
                                    <p className="font-semibold truncate">{order.customerInfo.name}</p>
                                    <p className="text-sm text-muted-foreground hidden sm:block">{formatDate(order.createdAt)}</p>
                                </div>
                                <Badge variant={getStatusBadgeVariant(order.orderStatus)} className="w-fit capitalize">
                                    {order.orderStatus}
                                </Badge>
                                <p className="font-semibold text-right">{formatPrice(order.total)}</p>
                            </div>
                        </AccordionTrigger>
                        <div className="px-2">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                {ORDER_STATUSES.map(status => (
                                    <DropdownMenuItem key={status} onClick={() => handleStatusChange(order.id, status)}>
                                    Mark as {status}
                                    </DropdownMenuItem>
                                ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
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
                                 <div className="mt-2 flex items-center gap-2">
                                    <span className="font-medium text-sm">Status:</span>
                                    <Badge variant={getStatusBadgeVariant(order.orderStatus)} className="capitalize">
                                        {order.orderStatus}
                                    </Badge>
                                </div>
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
