import Image from 'next/image';
import { notFound } from 'next/navigation';
import { products } from '@/lib/products';
import { formatPrice } from '@/lib/utils';
import AddToCartForm from '@/components/add-to-cart-form';
import { Separator } from '@/components/ui/separator';
import placeholderImages from '@/lib/placeholder-images.json';
import { Badge } from '@/components/ui/badge';

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.id,
  }));
}

export default function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = products.find((p) => p.id === params.slug);

  if (!product) {
    notFound();
  }

  const image = placeholderImages.find((img) => img.id === product.imageId);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
          {image && (
             <Image
                src={image.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                data-ai-hint={image.imageHint}
              />
          )}
        </div>
        <div className="flex flex-col gap-4">
          <Badge variant="secondary" className="w-fit">{product.category}</Badge>
          <h1 className="text-2xl font-bold font-headline">
            {product.name}
          </h1>
          <p className="text-2xl font-semibold">{formatPrice(product.price)}</p>
          <Separator />
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><span className="font-semibold text-foreground">Brand:</span> {product.brand}</p>
            <p><span className="font-semibold text-foreground">Material:</span> {product.material}</p>
            <p><span className="font-semibold text-foreground">Made in:</span> {product.countryOfOrigin}</p>
          </div>
          <Separator />
          <AddToCartForm product={product} />
        </div>
      </div>
    </div>
  );
}
