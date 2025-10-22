import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import placeholderImages from "@/lib/placeholder-images.json";

export default function AboutPage() {
    const aboutImage = placeholderImages.find(img => img.id === 'hero');
    return (
        <div className="container mx-auto px-4 py-16">
            <h1 className="text-4xl font-bold font-headline text-center mb-12">About Koksi Kok</h1>
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-lg">
                    {aboutImage && (
                        <Image 
                            src={aboutImage.imageUrl}
                            alt="About Koksi Kok"
                            fill
                            className="object-cover"
                            data-ai-hint="fashion store interior"
                        />
                    )}
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Our Story</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Founded in 2024, Koksi Kok was born out of a passion for fashion and a desire to bring curated, high-quality apparel to style-conscious individuals. We believe that what you wear is a form of self-expression, and our goal is to provide you with pieces that make you feel confident and unique.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Our Mission</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Our mission is to empower individual expression through fashion. We are committed to sourcing the finest materials, prioritizing sustainable and ethical practices, and offering timeless designs that transcend seasons. We are more than just a store; we are a community for fashion lovers.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
