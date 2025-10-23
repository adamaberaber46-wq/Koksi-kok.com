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
                <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                       <button
                        key={variant.color}
                        type="button"
                        className={cn(
                          'h-10 w-10 rounded-full border-2 transition-transform transform hover:scale-110 flex items-center justify-center overflow-hidden',
                          selectedVariant?.color === variant.color ? 'border-primary scale-110' : 'border-border'
                        )}
                        onClick={() => onVariantChange(variant)}
                        aria-label={`Select color ${variant.color}`}
                        title={variant.color}
                      >
                         <Image src={variant.imageUrls[0]} alt={variant.color} width={40} height={40} className="object-cover" />
                      </button>
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
