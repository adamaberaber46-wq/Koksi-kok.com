'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Product, Category } from '@/lib/types';
import ProductCard from './product-card';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { Skeleton } from './ui/skeleton';

export default function ProductGrid({ allProducts, initialCategory = 'All' }: { allProducts: Product[], initialCategory?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  
  const firestore = useFirestore();

  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categoriesData, isLoading: categoriesLoading } = useCollection<Category>(categoriesQuery);

  const categories = ['All', ...(categoriesData?.map(c => c.name) ?? [])];
  
  useEffect(() => {
    // Keep the component's state in sync with the URL's search param
    const categoryFromUrl = searchParams.get('category') || 'All';
    setActiveCategory(categoryFromUrl);
  }, [searchParams]);

  const handleFilterChange = (category: string) => {
    setActiveCategory(category);
    // Update the URL to trigger a new server-side fetch
    router.push(`/products?category=${category}`);
  };

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categoriesLoading && Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-10 w-24" />)}
        {!categoriesLoading && categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? 'default' : 'outline'}
            onClick={() => handleFilterChange(category)}
            className={cn(
              'capitalize',
              activeCategory === category && 'font-bold'
            )}
          >
            {category}
          </Button>
        ))}
      </div>
      {allProducts.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-8">
          {allProducts.map((product) => (
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
