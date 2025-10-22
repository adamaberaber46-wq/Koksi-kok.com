'use client';

import { useState } from 'react';
import type { Product, Category } from '@/lib/types';
import ProductCard from './product-card';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { Skeleton } from './ui/skeleton';

export default function ProductGrid({ allProducts, initialCategory = 'All' }: { allProducts: Product[], initialCategory?: string }) {
  const [filter, setFilter] = useState(initialCategory);
  const firestore = useFirestore();

  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categoriesData, isLoading: categoriesLoading } = useCollection<Category>(categoriesQuery);

  const categories = ['All', ...(categoriesData?.map(c => c.name) ?? [])];

  const filteredProducts =
    filter === 'All'
      ? allProducts
      : allProducts.filter((p) => p.category === filter);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categoriesLoading && Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-10 w-24" />)}
        {!categoriesLoading && categories.map((category) => (
          <Button
            key={category}
            variant={filter === category ? 'default' : 'outline'}
            onClick={() => setFilter(category)}
            className={cn(
              'capitalize',
              filter === category && 'font-bold'
            )}
          >
            {category}
          </Button>
        ))}
      </div>
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No products found in this category.</p>
        </div>
      )}
    </div>
  );
}
