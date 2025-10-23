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
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AddToCartDialog } from './add-to-cart-dialog';

export default function ProductCard({ product }: { product: Product }) {
  const hasImages = product.imageUrls && product.imageUrls.length > 0;
  const hasVariantImages = product.variants?.[0]?.imageUrls && product.variants[0].imageUrls.length > 0;
  
  const imageUrl = hasVariantImages ? product.variants[0].imageUrls[0] : (hasImages ? product.imageUrls[0] : '/placeholder.svg');
  
  const hoverImageUrl = 
    (product.variants?.[0]?.imageUrls?.length > 1 ? product.variants[0].imageUrls[1] : null) ||
    (product.imageUrls?.length > 1 ? product.imageUrls[1] : null) ||
    imageUrl;

  const isDiscounted = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = isDiscounted
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <Card className="flex flex-col overflow-hidden group h-[450px] w-[300px] shadow-md transition-shadow hover:shadow-lg">
        <CardHeader className="p-0">
          <Link href={`/products/${product.id}`} className="block relative">
            {isDiscounted && (
                <Badge variant="destructive" className="absolute top-2 left-2 z-10">
                    {`خصم ${discountPercentage}%`}
                </Badge>
            )}
            <div className="relative aspect-square w-full">
              {hasImages || hasVariantImages ? (
                <>
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover object-center transition-opacity duration-300 opacity-100 group-hover:opacity-0"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <Image
                      src={hoverImageUrl}
                      alt={`${product.name} (hover)`}
                      fill
                      className="object-cover object-center transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                </>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No Image</span>
                </div>
              )}
            </div>
          </Link>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col">
          <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
          <CardTitle className="text-lg font-semibold font-headline tracking-tight">
            <Link href={`/products/${product.id}`} className="hover:underline">
              {product.name}
            </Link>
          </CardTitle>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex-col items-start mt-auto">
            <div className="flex items-baseline gap-2 mb-2">
                <p className="text-base font-semibold text-destructive">{formatPrice(product.price)}</p>
                {isDiscounted && (
                    <p className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice!)}</p>
                )}
            </div>
          <AddToCartDialog product={product}>
            <Button variant="outline" className="w-full rounded-full">
                Add to Cart
            </Button>
          </AddToCartDialog>
        </CardFooter>
    </Card>
  );
}
