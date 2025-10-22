'use client';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { products } from '@/lib/products';
import { formatPrice } from '@/lib/utils';
import AddToCartForm from '@/components/add-to-cart-form';
import { Separator } from '@/components/ui/separator';
import placeholderImages from '@/lib/placeholder-images.json';
import { Badge } from '@/components/ui/badge';
import { useState, use } from 'react';
import { cn } from '@/lib/utils';

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = products.find((p) => p.id === params.slug);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  if (!product) {
    notFound();
  }

  const productImages = product.imageIds.map(id => 
    placeholderImages.find(img => img.id === id)
  ).filter(Boolean);

  const selectedImage = placeholderImages.find(img => img.id === (selectedImageId || product.imageIds[0]));

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            {selectedImage && (
               <Image
                  src={selectedImage.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  data-ai-hint={selectedImage.imageHint}
                />
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {productImages.map((image) => image && (
              <button 
                key={image.id}
                onClick={() => setSelectedImageId(image.id)}
                className={cn("relative aspect-square w-full overflow-hidden rounded-md border-2", {
                  'border-primary': selectedImageId === image.id || (!selectedImageId && image.id === product.imageIds[0]),
                  'border-transparent': selectedImageId !== image.id && (selectedImageId || image.id !== product.imageIds[0])
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
          <Badge variant="secondary" className="w-fit">{product.category}</Badge>
          <h1 className="text-xl font-bold font-headline">
            {product.name}
          </h1>
          <p className="text-2xl font-semibold">{formatPrice(product.price)}</p>
          <Separator />
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><span className="font-semibold text-foreground">Brand:</span> {product.brand}</p>
            <p><span className="font-semibold text-foreground">Material:</span> {product.material}</p>
            <p><span className="font-semibold text-foreground">Made in:</span> {product.countryOfOrigin}</p>
          </div>
          <Separator />
          <AddToCartForm product={product} />
        </div>
      </div>
    </div>
  );
}
