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
import { cn } from '@/lib/utils';

export function AddToCartDialog({ product, children }: { product: Product, children: React.ReactNode }) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    let errorMessage = '';
    if (!selectedSize) errorMessage += 'Please select a size. ';
    if (product.availableColors && product.availableColors.length > 0 && !selectedColor) {
      errorMessage += 'Please select a color.';
    }

    if (errorMessage) {
      setError(errorMessage.trim());
      return;
    }

    setError(null);
    addItem(product, selectedSize!, 1, selectedColor || '');
    setIsOpen(false);
    setSelectedSize(undefined);
    setSelectedColor(undefined);
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setError(null);
      setSelectedSize(undefined);
      setSelectedColor(undefined);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Options for {product.name}</DialogTitle>
          <DialogDescription>
            Choose your preferred size and color to add this item to your cart.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="size-select">Size</Label>
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
            </div>

            {product.availableColors && product.availableColors.length > 0 && (
              <div className="grid gap-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {product.availableColors.map((color) => {
                    const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(color);
                    return (
                       <button
                        key={color}
                        type="button"
                        className={cn(
                          'h-8 w-8 rounded-full border-2 transition-transform transform hover:scale-110',
                          selectedColor === color ? 'border-primary scale-110' : 'border-border'
                        )}
                        style={{ backgroundColor: isHex ? color : undefined }}
                        onClick={() => setSelectedColor(color)}
                        aria-label={`Select color ${color}`}
                      >
                         {!isHex && <span className="text-xs">{color.charAt(0)}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
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
