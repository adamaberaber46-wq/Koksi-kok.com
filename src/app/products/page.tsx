
import { collection, getDocs, query, where } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server-only';
import type { Product } from '@/lib/types';
import ProductGrid from '@/components/product-grid';

// Helper function to fetch products from the server
async function getProducts(category?: string): Promise<Product[]> {
  const { firestore } = initializeFirebase();
  const productsRef = collection(firestore, 'products');
  
  let productsQuery;
  if (category && category !== 'All') {
    productsQuery = query(productsRef, where('category', '==', category));
  } else {
    productsQuery = query(productsRef);
  }

  const querySnapshot = await getDocs(productsQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

// This is now a Server Component
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const selectedCategory = typeof searchParams.category === 'string' ? searchParams.category : 'All';

  // Fetch only the products for the current category on the server
  const products = await getProducts(selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-16">
      <h1 className="text-4xl font-headline font-bold mb-8 text-center">
        All Products
      </h1>
      {/* Pass the server-fetched products and the current category to the client component */}
      <ProductGrid allProducts={products} initialCategory={selectedCategory} />
    </div>
  );
}
