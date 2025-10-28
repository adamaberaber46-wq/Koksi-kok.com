'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/product-card';
import CategoryCard from '@/components/category-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase';
import { collection, limit, query, where, doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import type { Category, Product, HeroSection } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc } from '@/firebase/firestore/use-doc';

export default function Home() {
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'products'), where('isFeatured', '==', true), limit(8))
        : null,
    [firestore]
  );
  const { data: featuredProducts, isLoading: productsLoading } =
    useCollection<Product>(productsQuery);

  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories, isLoading: categoriesLoading } =
    useCollection<Category>(categoriesQuery);

  const heroSectionDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'site_settings', 'hero') : null),
    [firestore]
  );
  const { data: heroData, isLoading: heroLoading } = useDoc<HeroSection>(heroSectionDocRef);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[600px] lg:h-screen flex items-center justify-center text-center text-primary-foreground">
        {heroLoading && <Skeleton className="absolute inset-0" />}
        {heroData && heroData.imageUrl && (
          <Image
            src={heroData.imageUrl}
            alt={heroData.title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="container mx-auto px-4 z-10">
          {heroLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-12 md:h-16 w-3/4 max-w-2xl" />
              <Skeleton className="h-6 w-1/2 max-w-lg" />
              <Skeleton className="h-12 w-48" />
            </div>
          ) : heroData ? (
            <>
              <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 drop-shadow-lg">
                {heroData.title}
              </h1>
              <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 drop-shadow-md text-primary-foreground/80">
                {heroData.subtitle}
              </p>
              <Button asChild size="lg" className="font-bold">
                <Link href="/offers">
                  Shop Offers <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold">Hero section not configured.</h2>
              <p className="text-primary-foreground/80">
                Please set the title, subtitle, and image URL in the admin dashboard.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ✅ Best Sellers Section */}
      {(!productsLoading && featuredProducts && featuredProducts.length > 0) && (
        <section className="py-12 md:py-20 bg-card">
          <div className="container mx-auto px-3 sm:px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold text-center mb-8 sm:mb-12">
              Best Sellers
            </h2>

            <Carousel
              opts={{
                align: 'center',
                loop: featuredProducts.length > 3,
              }}
              className="w-full"
            >
              {/* 👇 تم تعديل المسافة إلى 5px ثابتة */}
              <CarouselContent className="flex gap-[5px]">
                {productsLoading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <CarouselItem
                      key={i}
                      className="basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 flex justify-center"
                    >
                      <div className="p-1">
                        <div className="flex flex-col gap-2">
                          <Skeleton className="aspect-square w-full" />
                          <Skeleton className="w-3/4 h-6" />
                          <Skeleton className="w-1/2 h-5" />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}

                {!productsLoading &&
                  featuredProducts &&
                  featuredProducts.map((product) => (
                    <CarouselItem
                      key={product.id}
                      className="basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 flex justify-center"
                    >
                      <div className="p-1">
                        <ProductCard product={product} />
                      </div>
                    </CarouselItem>
                  ))}
              </CarouselContent>

              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">
            Shop by Category
          </h2>
          <Carousel opts={{ align: 'start' }} className="w-full">
            <CarouselContent>
              {categoriesLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <CarouselItem key={i} className="sm:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Skeleton className="aspect-[4/3] w-full" />
                    </div>
                  </CarouselItem>
                ))}
              {!categoriesLoading &&
                categories &&
                categories.map((category) => (
                  <CarouselItem
                    key={category.id}
                    className="sm:basis-1/2 lg:basis-1/3"
                  >
                    <div className="p-1">
                      <CategoryCard category={category} />
                    </div>
                  </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </section>
    </div>
  );
}
