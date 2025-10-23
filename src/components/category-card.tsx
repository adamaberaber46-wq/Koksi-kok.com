import Image from 'next/image';
import Link from 'next/link';
import type { Category } from '@/lib/types';
import {
  Card,
} from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function CategoryCard({ category }: { category: Category }) {
  const imageUrl = category.imageUrl;

  return (
    <Card className="overflow-hidden group rounded-none">
      <Link href={`/products?category=${category.name}`} className="block relative">
        <div className="relative aspect-[4/3] w-full">
            {imageUrl && (
               <Image
                src={imageUrl}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            )}
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className='text-center'>
                    <h3 className="text-2xl font-headline font-bold text-primary-foreground">
                        {category.name}
                    </h3>
                    <div className="flex items-center justify-center mt-2 text-sm font-semibold text-primary-foreground/80 group-hover:text-primary-foreground transition-colors">
                        <span>Shop Now</span>
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
        </div>
      </Link>
    </Card>
  );
}
