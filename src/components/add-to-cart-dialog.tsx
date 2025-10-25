
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
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

export function AddToCartDialog({ product, children }: { product: Product, children: React.ReactNode }) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product.variants?.[0]);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = () => {
    let errorMessage = '';
    if (!selectedSize) errorMessage += 'Please select a size. ';
    if (!selectedVariant) {
      errorMessage += 'Please select a color.';
    }

    if (errorMessage) {
      setError(errorMessage.trim());
      return;
    }

    setError(null);
    addItem(product, selectedSize!, 1, selectedVariant!);
    setIsOpen(false);
    setSelectedSize(undefined);
    setSelectedVariant(product.variants?.[0]);
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setError(null);
      setSelectedSize(undefined);
      setSelectedVariant(product.variants?.[0]);
    }
  }

  const handleVariantSelect = (color: string) => {
    const variant = product.variants.find(v => v.color === color);
    setSelectedVariant(variant);
  }

  const priceToShow = selectedVariant ? selectedVariant.price : product.price;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Cart: {product.name}</DialogTitle>
          <DialogDescription>
            Select your preferred options to add this item to your cart.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="space-y-4">
                <div className="relative aspect-square w-full overflow-hidden rounded-md">
                    <Image
                        src={selectedVariant?.imageUrls[0] || product.imageUrls[0] || '/placeholder.svg'}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="text-2xl font-bold">{formatPrice(priceToShow)}</div>

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
                            aria-label={`Select color ${variant.color}`}
                            title={variant.color}
                          >
                             <Image src={variant.imageUrls[0]} alt={variant.color} width={40} height={40} className="object-cover" />
                          </button>
                      ))}
                    </div>
                  </div>
                )}
                
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
