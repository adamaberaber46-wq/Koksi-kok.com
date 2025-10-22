'use client';

import { useCollection, useFirestore } from '@/firebase';
import ProductGrid from '@/components/product-grid';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const initialCategory =
    typeof searchParams.category === 'string' ? searchParams.category : 'All';

  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );

  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  if (isLoading || !products) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <h1 className="text-4xl font-headline font-bold mb-8 text-center">
          All Products
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="w-3/4 h-6" />
              <Skeleton className="w-1/2 h-5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16">
      <h1 className="text-4xl font-headline font-bold mb-8 text-center">
        All Products
      </h1>
      <ProductGrid allProducts={products} initialCategory={initialCategory} />
    </div>
  );
}
