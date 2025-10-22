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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"

export function AddToCartDialog({ product, children }: { product: Product, children: React.ReactNode }) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    if (!selectedSize) {
      setError('Please select a size.');
      return;
    }
    setError(null);
    addItem(product, selectedSize, 1);
    setIsOpen(false);
    setSelectedSize(undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Size for {product.name}</DialogTitle>
          <DialogDescription>
            Choose a size to add this item to your cart.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="size-select" className="sr-only">Size</Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger id="size-select" className="w-full">
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
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Add to Cart</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}