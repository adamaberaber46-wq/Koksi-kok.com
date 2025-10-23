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
import { Sheet, SheetTrigger } from './ui/sheet';
import ProductDetailSheet from './product-detail-sheet';
import { cn } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const hasImages = product.imageUrls && product.imageUrls.length > 0;
  const imageUrl = hasImages ? product.imageUrls[0] : '/placeholder.svg';
  const hoverImageUrl = product.imageUrls && product.imageUrls.length > 1 ? product.imageUrls[1] : imageUrl;
  
  const isDiscounted = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = isDiscounted
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <Sheet>
      <Card className="flex flex-col overflow-hidden rounded-none group h-full">
          <CardHeader className="p-0">
            <SheetTrigger asChild>
              <div className="block relative cursor-pointer">
                {isDiscounted && (
                    <Badge variant="destructive" className="absolute top-2 left-2 z-10">
                        {`خصم ${discountPercentage}%`}
                    </Badge>
                )}
                <div className="relative aspect-square w-full">
                  {hasImages ? (
                    <>
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-opacity duration-300 opacity-100 group-hover:opacity-0"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {hoverImageUrl && (
                        <Image
                          src={hoverImageUrl}
                          alt={`${product.name} (hover)`}
                          fill
                          className="object-cover transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">No Image</span>
                    </div>
                  )}
                </div>
              </div>
            </SheetTrigger>
          </CardHeader>
          <CardContent className="p-4 flex-grow">
            <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
            <SheetTrigger asChild>
              <CardTitle className="text-lg font-semibold font-headline tracking-tight truncate">
                <span className="hover:underline cursor-pointer">
                  {product.name}
                </span>
              </CardTitle>
            </SheetTrigger>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex-col items-start mt-auto">
              <div className="flex items-baseline gap-2">
                  <p className="text-base font-semibold text-destructive">{formatPrice(product.price)}</p>
                  {isDiscounted && (
                      <p className="text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice!)}</p>
                  )}
              </div>
            <p className="text-sm text-muted-foreground mt-2 truncate w-full">{product.description}</p>
            
            {product.availableColors && product.availableColors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                  {product.availableColors.map((color) => {
                      const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(color);
                      return (
                          <div
                              key={color}
                              className="h-5 w-5 rounded-full border"
                              style={{ backgroundColor: isHex ? color : 'transparent' }}
                              title={color}
                          />
                      )
                  })}
              </div>
            )}

            <AddToCartDialog product={product}>
              <Button variant="outline" className="w-full mt-4 rounded-full">
                  Add to Cart
              </Button>
            </AddToCartDialog>
          </CardFooter>
      </Card>
      <ProductDetailSheet product={product} />
    </Sheet>
  );
}
