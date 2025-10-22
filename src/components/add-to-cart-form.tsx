'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';
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

export default function AddToCartForm({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSize) {
      setError('Please select a size.');
      return;
    }
    setError(null);
    addItem(product, selectedSize, 1);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </div>
      <Button type="submit" size="lg" className="w-full md:w-auto">
        Add to Cart
      </Button>
    </form>
  );
}
