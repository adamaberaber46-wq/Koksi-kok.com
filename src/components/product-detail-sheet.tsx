'use client';

import Image from 'next/image';
import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import AddToCartForm from '@/components/add-to-cart-form';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Tag, Weight, Shirt, Scale } from 'lucide-react';


export default function ProductDetailSheet({
  product,
}: {
  product: Product;
}) {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  const productImages = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [];

  const selectedImage = selectedImageUrl || (productImages.length > 0 ? productImages[0] : null);

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
                            src={selectedImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                            />
                        ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">No Image</span>
                        </div>
                        )}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {productImages.map((imageUrl) => (
                        <button 
                            key={imageUrl}
                            onClick={() => setSelectedImageUrl(imageUrl)}
                            className={cn("relative aspect-square w-full overflow-hidden rounded-md border-2", {
                            'border-primary': selectedImage === imageUrl,
                            'border-transparent': selectedImage !== imageUrl
                            })}
                        >
                            <Image 
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
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
                        
                        <Accordion type="single" collapsible className="w-full mt-4" defaultValue='item-1'>
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Product Details</AccordionTrigger>
                                <AccordionContent>
                                    <div className="text-sm text-muted-foreground space-y-2">
                                        {product.brand && <p className='flex items-center gap-2'><Shirt className='w-4 h-4' /> <span className="font-semibold text-foreground">Brand:</span> {product.brand}</p>}
                                        {product.material && <p className='flex items-center gap-2'><Scale className='w-4 h-4' /> <span className="font-semibold text-foreground">Material:</span> {product.material}</p>}
                                        {product.countryOfOrigin && <p className='flex items-center gap-2'><Scale className='w-4 h-4' /> <span className="font-semibold text-foreground">Made in:</span> {product.countryOfOrigin}</p>}
                                        {product.sku && <p><span className="font-semibold text-foreground">SKU:</span> {product.sku}</p>}
                                        {product.weightGrams && <p className='flex items-center gap-2'><Weight className='w-4 h-4' /> <span className="font-semibold text-foreground">Weight:</span> {product.weightGrams}g</p>}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                             {product.careInstructions && (
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>Care Instructions</AccordionTrigger>
                                    <AccordionContent>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.careInstructions}</p>
                                    </AccordionContent>
                                </AccordionItem>
                            )}
                        </Accordion>
                        
                        {product.tags && product.tags.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {product.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                                       <Tag className="w-3 h-3" /> {tag}
                                    </Badge>
                                ))}
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
