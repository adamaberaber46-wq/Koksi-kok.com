import { products } from '@/lib/products';
import ProductGrid from '@/components/product-grid';

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8 sm:py-16">
      <h1 className="text-4xl font-headline font-bold mb-8 text-center">
        All Products
      </h1>
      <ProductGrid allProducts={products} />
    </div>
  );
}
