'use client';

import Image from 'next/image';
import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import AddToCartForm from '@/components/add-to-cart-form';
import { Separator } from '@/components/ui/separator';
import placeholderImages from '@/lib/placeholder-images.json';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';


export default function ProductDetailSheet({
  product,
}: {
  product: Product;
}) {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const productImages = product.imageIds && product.imageIds.length > 0 
    ? product.imageIds.map(id => placeholderImages.find(img => img.id === id)).filter(Boolean)
    : [];

  const selectedImage = productImages.length > 0 
    ? placeholderImages.find(img => img.id === (selectedImageId || (product.imageIds && product.imageIds[0])))
    : null;

  return (
    <SheetContent side="right" className="w-full sm:max-w-2xl p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>{product.name}</SheetTitle>
          <SheetDescription>{product.description}</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-full">
            <div className="grid md:grid-cols-2 items-start">
                <div className="p-6 lg:p-8 flex flex-col gap-4">
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
                <div className="p-6 lg:p-8 flex flex-col gap-4 border-t md:border-t-0 md:border-l md:min-h-full">
                    <div className="flex-grow">
                        {product.category && <Badge variant="secondary" className="w-fit">{product.category}</Badge>}
                        <h1 className="text-2xl lg:text-3xl font-bold font-headline mt-2">
                            {product.name}
                        </h1>
                        <p className="text-2xl font-semibold mt-4">{formatPrice(product.price)}</p>
                        <Separator className='my-4' />
                        <p className="text-muted-foreground leading-relaxed">
                            {product.description}
                        </p>
                        {(product.brand || product.material || product.countryOfOrigin) && (
                            <div className="text-sm text-muted-foreground space-y-1 mt-4">
                            {product.brand && <p><span className="font-semibold text-foreground">Brand:</span> {product.brand}</p>}
                            {product.material && <p><span className="font-semibold text-foreground">Material:</span> {product.material}</p>}
                            {product.countryOfOrigin && <p><span className="font-semibold text-foreground">Made in:</span> {product.countryOfOrigin}</p>}
                            </div>
                        )}
                    </div>
                    <div className="mt-auto pt-4">
                        <Separator className='my-4' />
                        <AddToCartForm product={product} />
                    </div>
                </div>
            </div>
        </ScrollArea>
    </SheetContent>
  );
}
