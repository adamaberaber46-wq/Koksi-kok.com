

'use client';

import { useDoc } from '@/firebase/firestore/use-doc';
import { useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import type { Product, ProductVariant } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tag, Weight, Shirt, Scale, Loader2, Share2 } from 'lucide-react';
import AddToCartForm from '@/components/add-to-cart-form';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, useCarousel, type CarouselApi } from '@/components/ui/carousel';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.productId as string;

  const firestore = useFirestore();
  const productRef = useMemoFirebase(
    () => (firestore && productId ? doc(firestore, 'products', productId) : null),
    [firestore, productId]
  );
  const { data: product, isLoading } = useDoc<Product>(productRef);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [activeImage, setActiveImage] = useState<string | undefined>(undefined);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  useEffect(() => {
    if (product) {
      const initialVariant = product.variants?.[0];
      setSelectedVariant(initialVariant);
    }
  }, [product]);

  useEffect(() => {
    if (selectedVariant && selectedVariant.imageUrls && selectedVariant.imageUrls.length > 0) {
      const newGalleryImages = selectedVariant.imageUrls;
      setGalleryImages(newGalleryImages);
      setActiveImage(newGalleryImages[0]);
    } else if (product && product.imageUrls && product.imageUrls.length > 0) {
      const newGalleryImages = product.imageUrls;
      setGalleryImages(newGalleryImages);
      setActiveImage(newGalleryImages[0]);
    } else {
        setGalleryImages([]);
        setActiveImage(undefined);
    }
  }, [selectedVariant, product]);

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };
  
  const handleShare = async () => {
    if (!product) return;

    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this product: ${product.name}`,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 2000); // Hide message after 2 seconds
      });
    }
  };


  if (isLoading || !productId) {
    return <ProductPageSkeleton />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold font-headline mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The product you are looking for does not exist.
        </p>
        <Link href="/products" className="text-primary underline">
          Return to all products
        </Link>
      </div>
    );
  }

  const priceToShow = selectedVariant ? selectedVariant.price : product.price;

  function ImageGallery() {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!api) {
            return
        }

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap())

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap())
        })
    }, [api])


    const handleThumbnailClick = (index: number) => {
        if (!api) {
            return
        }
        setActiveImage(galleryImages[index]);
        api.scrollTo(index)
    }

    return (
        <div className="flex flex-col gap-4 md:sticky md:top-24">
            <Carousel setApi={setApi} className="md:hidden">
              <CarouselContent>
                {galleryImages.length > 0 ? (
                  galleryImages.map((imageUrl) => (
                    <CarouselItem key={imageUrl}>
                      <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="100vw"
                        />
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem>
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">No Image</span>
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              {count > 1 && (
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {Array.from({ length: count }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => api?.scrollTo(index)}
                          className={cn(
                            'h-2 w-2 rounded-full',
                            index === current ? 'bg-primary scale-125' : 'bg-primary/30'
                          )}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                 </div>
              )}
            </Carousel>

            <div className="relative aspect-square w-full overflow-hidden rounded-lg border hidden md:block">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">No Image</span>
                </div>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="hidden md:grid grid-cols-4 gap-2">
                {galleryImages.map((imageUrl, index) => (
                  <button
                    key={imageUrl}
                    onClick={() => handleThumbnailClick(index)}
                    className={cn(
                      'relative aspect-square w-full overflow-hidden rounded-md border-2 transition-all',
                      {
                        'border-primary shadow-md': activeImage === imageUrl,
                        'border-transparent hover:border-muted-foreground/50': activeImage !== imageUrl,
                      }
                    )}
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
            )}
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
        
        <ImageGallery />

        {/* Product Details */}
        <div className="flex flex-col gap-4">
          <div className="flex-grow">
            <div className="flex justify-between items-start">
                <div>
                    {product.category && (
                    <Link href={`/products?category=${product.category}`} className="w-fit">
                        <Badge variant="secondary">{product.category}</Badge>
                    </Link>
                    )}
                    <h1 className="text-3xl lg:text-4xl font-bold font-headline mt-2">
                    {product.name}
                    </h1>
                </div>
                <Button variant="ghost" size="icon" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                    <span className="sr-only">Share</span>
                </Button>
            </div>
             {isLinkCopied && (
              <div className="text-sm text-green-600 mt-2">Link Copied!</div>
            )}
            <p className="text-3xl font-semibold mt-4 text-destructive">{formatPrice(priceToShow)}</p>
            <Separator className="my-6" />
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <Accordion type="single" collapsible className="w-full mt-6" defaultValue="item-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>Product Details</AccordionTrigger>
                <AccordionContent>
                  <div className="text-sm text-muted-foreground space-y-2">
                    {product.brand && <p className="flex items-center gap-2"><Shirt className="w-4 h-4" /> <span className="font-semibold text-foreground">Brand:</span> {product.brand}</p>}
                    {product.material && <p className="flex items-center gap-2"><Scale className="w-4 h-4" /> <span className="font-semibold text-foreground">Material:</span> {product.material}</p>}
                    {product.countryOfOrigin && <p className="flex items-center gap-2"><Scale className="w-4 h-4" /> <span className="font-semibold text-foreground">Made in:</span> {product.countryOfOrigin}</p>}
                    {product.sku && <p><span className="font-semibold text-foreground">SKU:</span> {product.sku}</p>}
                    {product.weightGrams && <p className="flex items-center gap-2"><Weight className="w-4 h-4" /> <span className="font-semibold text-foreground">Weight:</span> {product.weightGrams}g</p>}
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
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="mt-auto pt-4">
            <Separator className="my-6" />
            <AddToCartForm product={product} selectedVariant={selectedVariant} onVariantChange={handleVariantChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductPageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 sm:py-16">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
            <div className="flex flex-col gap-4">
              <Skeleton className="aspect-square w-full" />
              <div className="grid grid-cols-4 gap-2">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="aspect-square w-full" />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-1/3" />
              <Separator className="my-6" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <Separator className="my-6" />
              <div className="space-y-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-10 w-48" />
              </div>
               <div className="space-y-4 mt-4">
                  <Skeleton className="h-6 w-20" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
              </div>
              <Button size="lg" className="w-full mt-6" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </Button>
            </div>
          </div>
        </div>
    )
}
