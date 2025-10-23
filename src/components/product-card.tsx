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
    <Card className="flex flex-col overflow-hidden group h-full border-none shadow-none rounded-none">
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
                    className="object-cover transition-opacity duration-300 opacity-100 group-hover:opacity-0"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <Image
                      src={hoverImageUrl}
                      alt={`${product.name} (hover)`}
                      fill
                      className="object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100"
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
        <CardContent className="p-4 flex-grow">
          <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
          <CardTitle className="text-lg font-semibold font-headline tracking-tight truncate">
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
          
          {product.variants && product.variants.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
                {product.variants.slice(0, 5).map((variant) => {
                    const variantImage = variant.imageUrls?.[0];
                    return (
                        <div
                            key={variant.color}
                            className="h-5 w-5 rounded-full border overflow-hidden"
                            title={variant.color}
                        >
                        {variantImage && <Image src={variantImage} alt={variant.color} width={20} height={20} className="object-cover" />}
                        </div>
                    )
                })}
                {product.variants.length > 5 && (
                  <div className="h-5 w-5 rounded-full border bg-muted flex items-center justify-center text-xs">
                      + {product.variants.length - 5}
                  </div>
                )}
            </div>
          )}

          <AddToCartDialog product={product}>
            <Button variant="outline" className="w-full mt-4 rounded-full">
                Add to Cart
            </Button>
          </AddToCartDialog>
        </CardFooter>
    </Card>
  );
}
