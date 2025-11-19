'use client';

import { useCollection, useFirestore } from '@/firebase';
import { useMemoFirebase, useUser } from '@/firebase/provider';
import type { Product } from '@/lib/types';
import { collection, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import Image from 'next/image';

export default function ManageProductsPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const isAdmin = user?.email === 'adamaber50@gmail.com';

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    } else if (!isUserLoading && user && !isAdmin) {
      router.push('/');
    }
  }, [user, isUserLoading, isAdmin, router]);

  const productsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  function handleDeleteProduct(productId: string) {
    if (!firestore) return;
    const productDocRef = doc(firestore, 'products', productId);
    deleteDocumentNonBlocking(productDocRef);
    toast({
        title: 'Product Deleted',
        description: 'The product has been successfully removed.',
        variant: 'destructive',
    });
  }

  if (isUserLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-headline">Manage Products</CardTitle>
            <CardDescription>View, edit, or delete your store's products.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/products/add">
                <PlusCircle className="mr-2" />
                Add New Product
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {productsLoading && <p>Loading products...</p>}
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {products.map(product => (
                <div key={product.id} className="flex flex-col border rounded-md overflow-hidden">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={product.variants?.[0]?.imageUrls?.[0] || product.imageUrls?.[0] || '/placeholder.svg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-2 flex flex-col gap-1">
                    <p className="font-semibold truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                    <div className="flex gap-2 mt-1">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/products/edit/${product.id}`}>Edit</Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the product "{product.name}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !productsLoading && (
              <p className="text-muted-foreground text-center py-4">
                No products found. <Link href="/admin/products/add" className='underline'>Add one now</Link>.
              </p>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
