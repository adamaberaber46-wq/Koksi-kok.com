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
import { cn, formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { Card } from './ui/card';

interface AddToCartFormProps {
  product: Product;
  selectedVariant: ProductVariant | undefined;
  onVariantChange: (variant: ProductVariant) => void;
}

export default function AddToCartForm({ product, selectedVariant, onVariantChange }: AddToCartFormProps) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let errorMessage = '';
    if (!selectedSize) errorMessage += 'Please select a size. ';
    if (!selectedVariant) {
      errorMessage += 'Please select a color variant.';
    }

    if (errorMessage || !selectedVariant) {
      setError(errorMessage.trim());
      return;
    }
    setError(null);
    addItem(product, selectedSize!, 1, selectedVariant);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        {product.variants && product.variants.length > 0 && (
            <div className="grid gap-2">
                <Label>Color</Label>
                <div className="flex flex-col gap-3">
                    {product.variants.map((variant) => (
                       <Card
                         key={variant.color}
                         onClick={() => onVariantChange(variant)}
                         className={cn(
                           'flex items-center gap-4 p-3 cursor-pointer transition-all border-2',
                           selectedVariant?.color === variant.color ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'
                         )}
                       >
                         <div className="relative h-[100px] w-[40px] shrink-0 overflow-hidden rounded-md">
                           <Image src={variant.imageUrl} alt={variant.color} fill className="object-cover" />
                         </div>
                         <div className="flex-1">
                           <p className="font-semibold">{variant.color}</p>
                           <p className="text-sm text-muted-foreground">{formatPrice(variant.price)}</p>
                         </div>
                       </Card>
                    ))}
                </div>
            </div>
        )}

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

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </div>
      <Button type="submit" size="lg" className="w-full md:w-auto">
        Add to Cart
      </Button>
    </form>
  );
}
