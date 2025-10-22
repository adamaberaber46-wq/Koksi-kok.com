'use client';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import AddToCartForm from '@/components/add-to-cart-form';
import { Separator } from '@/components/ui/separator';
import placeholderImages from '@/lib/placeholder-images.json';
import { Badge } from '@/components/ui/badge';
import { useState, use } from 'react';
import { cn } from '@/lib/utils';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = use(params);
  const firestore = useFirestore();

  const productRef = useMemoFirebase(
    () => (firestore && slug ? doc(firestore, 'products', slug) : null),
    [firestore, slug]
  );
  const { data: product, isLoading } = useDoc<Product>(productRef);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
          <div className="flex flex-col gap-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="grid grid-cols-4 gap-2">
              <Skeleton className="aspect-square w-full rounded-md" />
              <Skeleton className="aspect-square w-full rounded-md" />
              <Skeleton className="aspect-square w-full rounded-md" />
              <Skeleton className="aspect-square w-full rounded-md" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <Separator />
            <Skeleton className="h-20 w-full" />
            <Separator />
            <Skeleton className="h-12 w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    notFound();
  }

  const productImages = product.imageIds && product.imageIds.length > 0 
    ? product.imageIds.map(id => placeholderImages.find(img => img.id === id)).filter(Boolean)
    : [];

  const selectedImage = productImages.length > 0 
    ? placeholderImages.find(img => img.id === (selectedImageId || (product.imageIds && product.imageIds[0])))
    : null;

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            {selectedImage ? (
               <Image
                  src={selectedImage.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  data-ai-hint={selectedImage.imageHint}
                />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">No Image</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {productImages.map((image) => image && (
              <button 
                key={image.id}
                onClick={() => setSelectedImageId(image.id)}
                className={cn("relative aspect-square w-full overflow-hidden rounded-md border-2", {
                  'border-primary': selectedImageId === image.id || (!selectedImageId && product.imageIds && image.id === product.imageIds[0]),
                  'border-transparent': selectedImageId !== image.id && (!selectedImageId || (product.imageIds && image.id !== product.imageIds[0]))
                })}
              >
                <Image 
                  src={image.imageUrl}
                  alt={image.description}
                  fill
                  className="object-cover"
                  data-ai-hint={image.imageHint}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {product.category && <Badge variant="secondary" className="w-fit">{product.category}</Badge>}
          <h1 className="text-xl font-bold font-headline">
            {product.name}
          </h1>
          <p className="text-2xl font-semibold">{formatPrice(product.price)}</p>
          <Separator />
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
          {(product.brand || product.material || product.countryOfOrigin) && (
            <div className="text-sm text-muted-foreground space-y-1">
              {product.brand && <p><span className="font-semibold text-foreground">Brand:</span> {product.brand}</p>}
              {product.material && <p><span className="font-semibold text-foreground">Material:</span> {product.material}</p>}
              {product.countryOfOrigin && <p><span className="font-semibold text-foreground">Made in:</span> {product.countryOfOrigin}</p>}
            </div>
          )}
          <Separator />
          <AddToCartForm product={product} />
        </div>
      </div>
    </div>
  );
}
