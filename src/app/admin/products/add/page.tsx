
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2, Trash2, PlusCircle, ArrowLeft } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Separator } from '@/components/ui/separator';
import type { Category, Product } from '@/lib/types';
import { useMemoFirebase, useUser } from '@/firebase/provider';
import Link from 'next/link';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';

const productVariantSchema = z.object({
    color: z.string().optional(),
    imageUrls: z.string().optional(),
    price: z.coerce.number().optional(),
});

const productFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().optional(),
  originalPrice: z.coerce.number().optional().nullable(),
  brand: z.string().optional(),
  category: z.string().optional(),
  sizes: z.string().optional(),
  imageUrls: z.string().optional(),
  material: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  variants: z.array(productVariantSchema).optional(),
  isFeatured: z.boolean().default(false),
  // Optional fields
  tags: z.string().optional(),
  sku: z.string().optional(),
  weightGrams: z.coerce.number().optional().nullable(),
  careInstructions: z.string().optional(),
});


export default function AddProductPage() {
  const [isProductSubmitting, setIsProductSubmitting] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const isAdmin = user?.email === 'adamaber50@gmail.com';

  useEffect(() => {
    if (!isUserLoading) {
      if (!user || !isAdmin) {
        router.push('/login');
      }
    }
  }, [user, isUserLoading, isAdmin, router]);

  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories } = useCollection<Category>(categoriesQuery);

  const productForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      originalPrice: null,
      brand: '',
      category: '',
      sizes: '',
      imageUrls: '',
      material: '',
      countryOfOrigin: '',
      variants: [{ color: '', imageUrls: '', price: 0 }],
      isFeatured: false,
      tags: '',
      sku: '',
      weightGrams: null,
      careInstructions: '',
    },
  });
  
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: productForm.control,
    name: 'variants',
  });

  async function onProductSubmit(values: z.infer<typeof productFormSchema>) {
    setIsProductSubmitting(true);

    if (!firestore) {
        toast({
            title: 'Error',
            description: 'Firestore is not available. Please try again later.',
            variant: 'destructive',
        });
        setIsProductSubmitting(false);
        return;
    }

    const newProductData: Omit<Product, 'id'> = {
      name: values.name || 'Untitled Product',
      description: values.description || '',
      price: Number(values.price) || 0,
      brand: values.brand || '',
      category: values.category || '',
      sizes: values.sizes ? values.sizes.split(',').map((s) => s.trim()) : [],
      imageUrls: values.imageUrls ? values.imageUrls.split(',').map((url) => url.trim()) : [],
      material: values.material || '',
      countryOfOrigin: values.countryOfOrigin || '',
      isFeatured: values.isFeatured,
      variants: values.variants ? values.variants.map(v => ({
        color: v.color || '',
        price: Number(v.price) || 0,
        imageUrls: v.imageUrls ? v.imageUrls.split(',').map(url => url.trim()) : [],
      })) : [],
      ...(values.tags && { tags: values.tags.split(',').map(t => t.trim()) }),
      ...(values.sku && { sku: values.sku }),
      ...(values.weightGrams && { weightGrams: Number(values.weightGrams) }),
      ...(values.careInstructions && { careInstructions: values.careInstructions }),
    };
    
    if (values.originalPrice && values.originalPrice > 0) {
      newProductData.originalPrice = Number(values.originalPrice);
    } else {
      newProductData.originalPrice = undefined;
    }

    const productsCollection = collection(firestore, 'products');
    await addDocumentNonBlocking(productsCollection, newProductData);
    toast({
        title: 'Product Added!',
        description: `${values.name || 'Untitled Product'} has been successfully added to the store.`,
    });
    
    setIsProductSubmitting(false);
    router.push('/admin/products');
  }

  if (isUserLoading || !isAdmin) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin" />
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-3xl mx-auto space-y-12">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-headline">Add New Product</CardTitle>
                    <CardDescription>Fill out the details below to add a new product to your catalog.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...productForm}>
                        <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-8">
                        <FormField
                            control={productForm.control}
                            name="name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., Classic White Tee" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={productForm.control}
                            name="isFeatured"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel>Mark as Best Seller</FormLabel>
                                    <FormDescription>
                                    If checked, this product will appear on the homepage.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={productForm.control}
                            name="description"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                <Textarea placeholder="Describe the product..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField
                                control={productForm.control}
                                name="price"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Base Price (EGP)</FormLabel>
                                    <FormControl>
                                    <Input type="number" placeholder="e.g., 299.99" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={productForm.control}
                                name="originalPrice"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Original Price (Optional)</FormLabel>
                                    <FormControl>
                                    <Input type="number" placeholder="e.g., 399.99" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField
                                control={productForm.control}
                                name="brand"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Brand</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., Koksi Kok" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={productForm.control}
                                name="category"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories && categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={productForm.control}
                            name="sizes"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Available Sizes</FormLabel>
                                <FormControl>
                                <Input placeholder="S, M, L, XL (comma-separated)" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        
                        <FormField
                            control={productForm.control}
                            name="imageUrls"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>General Image URLs (comma-separated)</FormLabel>
                                <FormControl>
                                <Textarea placeholder="https://.../img1.jpg, https://.../img2.jpg" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField
                                control={productForm.control}
                                name="material"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Material</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., 100% Cotton" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={productForm.control}
                                name="countryOfOrigin"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country of Origin</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., Egypt" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        
                        <div className="space-y-6">
                            <Separator />
                            <h3 className="text-lg font-medium">Product Variants (Colors)</h3>
                            {variantFields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                                    <h4 className="font-semibold">Variant {index + 1}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={productForm.control}
                                            name={`variants.${index}.color`}
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Color Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Red" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={productForm.control}
                                            name={`variants.${index}.price`}
                                            render={({ field }) => (
                                                <FormItem>
                                                <FormLabel>Variant Price (EGP)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 350.00" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={productForm.control}
                                        name={`variants.${index}.imageUrls`}
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Variant Image URLs (comma-separated)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="https://.../red-1.jpg, https://.../red-2.jpg" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {variantFields.length > 1 && (
                                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => removeVariant(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    )}
                                </div>
                            ))}
                            <FormField
                                control={productForm.control}
                                name="variants"
                                render={() => (
                                    <FormItem>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => appendVariant({ color: '', imageUrls: '', price: 0 })}
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Another Variant
                            </Button>
                            <Separator />
                        </div>

                        <Collapsible>
                            <CollapsibleTrigger asChild>
                                <Button variant="link" className="p-0">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add More Details (Optional)
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                            <div className="space-y-8 pt-6">
                                    <FormField
                                        control={productForm.control}
                                        name="tags"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tags</FormLabel>
                                            <FormControl>
                                            <Input placeholder="e.g. summer, casual, sale" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormField
                                            control={productForm.control}
                                            name="sku"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>SKU</FormLabel>
                                                <FormControl>
                                                <Input placeholder="e.g. TSHIRT-WHT-LG" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={productForm.control}
                                            name="weightGrams"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Weight (grams)</FormLabel>
                                                <FormControl>
                                                <Input type="number" placeholder="e.g. 250" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={productForm.control}
                                        name="careInstructions"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Care Instructions</FormLabel>
                                            <FormControl>
                                            <Textarea placeholder="e.g. Machine wash cold, tumble dry low" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                            </div>
                            </CollapsibleContent>
                        </Collapsible>


                        <div className="flex flex-col sm:flex-row gap-2">
                             <Button type="button" variant="outline" asChild>
                                <Link href="/admin/products"><ArrowLeft className="mr-2" /> Cancel</Link>
                             </Button>
                            <Button type="submit" className="w-full" disabled={isProductSubmitting}>
                                {isProductSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Product
                            </Button>
                        </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

    

    