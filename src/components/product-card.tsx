'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import placeholderImages from '@/lib/placeholder-images.json';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AddToCartDialog } from './add-to-cart-dialog';

export default function ProductCard({ product }: { product: Product }) {
  const hasImages = product.imageIds && product.imageIds.length > 0;
  const image = hasImages ? placeholderImages.find((img) => img.id === product.imageIds[0]) : null;
  const hoverImage = product.imageIds && product.imageIds.length > 1
    ? placeholderImages.find((img) => img.id === product.imageIds[1])
    : null;
  const isDiscounted = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = isDiscounted
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <Card className="flex flex-col overflow-hidden rounded-none group h-full">
        <CardHeader className="p-0">
          <Link href={`/products/${product.id}`} className="block relative">
             {isDiscounted && (
                <Badge variant="destructive" className="absolute top-2 left-2 z-10">
                    {`خصم ${discountPercentage}%`}
                </Badge>
             )}
            <div className="relative aspect-square w-full">
              {image ? (
                <>
                  <Image
                    src={image.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-opacity duration-300 opacity-100 group-hover:opacity-0"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    data-ai-hint={image.imageHint}
                  />
                  {hoverImage && (
                    <Image
                      src={hoverImage.imageUrl}
                      alt={`${product.name} (hover)`}
                      fill
                      className="object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      data-ai-hint={hoverImage.imageHint}
                    />
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No Image</span>
                </div>
              )}
            </div>
          </Link>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
          <CardTitle className="text-lg font-semibold font-headline tracking-tight">
            <Link href={`/products/${product.id}`} className="hover:underline">
              {product.name}
            </Link>
          </CardTitle>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex-col items-start mt-auto">
            <div className="flex items-baseline gap-2">
                 <p className="text-base font-semibold text-destructive">{formatPrice(product.price)}</p>
                {isDiscounted && (
                    <p className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice!)}</p>
                )}
            </div>
          <p className="text-sm text-muted-foreground mt-2 truncate w-full">{product.description}</p>
          <AddToCartDialog product={product}>
            <Button variant="outline" className="w-full mt-4 rounded-full">
                Add to Cart
            </Button>
          </AddToCartDialog>
        </CardFooter>
    </Card>
  );
}
