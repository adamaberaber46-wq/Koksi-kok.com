'use client';

import { useState } from 'react';
import type { Product, ProductVariant } from '@/lib/types';
import { Button } from './ui/button';
import { useCart } from '@/hooks/use-cart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function AddToCartForm({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product.variants?.[0]);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  const handleVariantSelect = (color: string) => {
    const variant = product.variants.find(v => v.color === color);
    setSelectedVariant(variant);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let errorMessage = '';
    if (!selectedSize) errorMessage += 'Please select a size. ';
    if (!selectedVariant) {
      errorMessage += 'Please select a color variant.';
    }

    if (errorMessage) {
      setError(errorMessage.trim());
      return;
    }
    setError(null);
    addItem(product, selectedSize!, 1, selectedVariant!);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="size-select">Size</Label>
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger id="size-select" className="w-[200px]">
              <SelectValue placeholder="Select a size" />
            </SelectTrigger>
            <SelectContent>
              {product.sizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {product.variants && product.variants.length > 0 && (
            <div className="grid gap-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                       <button
                         key={variant.color}
                         type="button"
                         className={cn(
                           'h-10 w-10 rounded-full border-2 transition-transform transform hover:scale-110 flex items-center justify-center overflow-hidden',
                           selectedVariant?.color === variant.color ? 'border-primary scale-110' : 'border-border'
                         )}
                         onClick={() => handleVariantSelect(variant.color)}
                         title={variant.color}
                         aria-label={`Select color ${variant.color}`}
                       >
                         <Image src={variant.imageUrl} alt={variant.color} width={40} height={40} className="object-cover" />
                       </button>
                    ))}
                </div>
            </div>
        )}

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </div>
      <Button type="submit" size="lg" className="w-full md:w-auto">
        Add to Cart
      </Button>
    </form>
  );
}
