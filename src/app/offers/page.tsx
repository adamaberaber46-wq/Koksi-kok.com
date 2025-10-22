
'use client';
import ProductCard from "@/components/product-card";
import { useCollection, useFirestore } from '@/firebase';
import { collection, where, query } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function OffersPage() {

    const firestore = useFirestore();

    const discountedProductsQuery = useMemoFirebase(
        () => (firestore 
            ? query(
                collection(firestore, 'products'), 
                where('originalPrice', '>', 0)
              )
            : null),
        [firestore]
    );

    const { data: discountedProducts, isLoading } = useCollection<Product>(discountedProductsQuery);

    const trulyDiscounted = discountedProducts?.filter(p => p.originalPrice && p.originalPrice > p.price);

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold font-headline mb-2">Special Offers</h1>
                <p className="text-lg text-muted-foreground">Don't miss out on our limited-time deals!</p>
            </div>

             {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <Skeleton className="aspect-square w-full" />
                            <Skeleton className="w-3/4 h-6" />
                            <Skeleton className="w-1/2 h-5" />
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && trulyDiscounted && trulyDiscounted.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {trulyDiscounted.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : !isLoading && (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">There are no special offers at the moment. Please check back later.</p>
                </div>
            )}
        </div>
    )
}
