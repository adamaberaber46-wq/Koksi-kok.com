import { products } from "@/lib/products";
import ProductCard from "@/components/product-card";

export default function OffersPage() {

    const discountedProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price);

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold font-headline mb-2">Special Offers</h1>
                <p className="text-lg text-muted-foreground">Don't miss out on our limited-time deals!</p>
            </div>

            {discountedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {discountedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">There are no special offers at the moment. Please check back later.</p>
                </div>
            )}
        </div>
    )
}
