import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { products } from "@/lib/products";
import Link from "next/link";

export default function OffersPage() {

    const featuredOffers = products.slice(0, 3);

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold font-headline mb-2">Special Offers</h1>
                <p className="text-lg text-muted-foreground">Don't miss out on our limited-time deals!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredOffers.map((product, index) => (
                    <Card key={product.id} className="flex flex-col">
                        <CardHeader>
                            <Badge className="w-fit">
                                {index === 0 ? '50% OFF' : index === 1 ? '30% OFF' : 'BUY ONE GET ONE'}
                            </Badge>
                            <CardTitle className="pt-2">{product.name}</CardTitle>
                            <CardDescription>{product.category}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground text-sm">{product.description}</p>
                        </CardContent>
                        <CardFooter>
                             <Button asChild className="w-full">
                                <Link href={`/products/${product.id}`}>View Deal</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
