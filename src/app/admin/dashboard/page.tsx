
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Separator } from '@/components/ui/separator';
import type { Category } from '@/lib/types';
import { useMemoFirebase } from '@/firebase/provider';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const productFormSchema = z.object({
  name: z.string().min(2, { message: 'Product name must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
  originalPrice: z.coerce.number().optional(),
  brand: z.string().min(2, { message: 'Brand is required.' }),
  category: z.string().min(1, { message: 'Category is required.' }),
  sizes: z.string().min(1, { message: 'At least one size is required.' }),
  imageIds: z.string().min(1, { message: 'At least one image ID is required.' }),
  material: z.string().min(2, { message: 'Material is required.' }),
  countryOfOrigin: z.string().min(2, { message: 'Country of origin is required.' }),
});

const categoryFormSchema = z.object({
    id: z.string().min(2, { message: 'Category ID must be at least 2 characters.'}),
    name: z.string().min(2, { message: 'Category name must be at least 2 characters.' }),
    imageId: z.string().min(1, { message: 'Image ID is required.' }),
});

export default function DashboardPage() {
  const [isProductSubmitting, setIsProductSubmitting] = useState(false);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesQuery);

  const productForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      brand: '',
      category: '',
      sizes: '',
      imageIds: '',
      material: '',
      countryOfOrigin: '',
      originalPrice: undefined,
    },
  });

  const categoryForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      id: '',
      name: '',
      imageId: '',
    },
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

    const productsCollection = collection(firestore, 'products');
    const newProductData = {
        ...values,
        sizes: values.sizes.split(',').map((s) => s.trim()),
        imageIds: values.imageIds.split(',').map((id) => id.trim()),
        price: Number(values.price),
        ...(values.originalPrice && { originalPrice: Number(values.originalPrice) }),
    };

    const docRefPromise = addDocumentNonBlocking(productsCollection, newProductData);

    toast({
        title: 'Product Added!',
        description: `${values.name} has been successfully added to the store.`,
    });

    const docRef = await docRefPromise;

    if (docRef) {
        router.push(`/products/${docRef.id}`);
    }
    
    setIsProductSubmitting(false);
    productForm.reset();
  }

  async function onCategorySubmit(values: z.infer<typeof categoryFormSchema>) {
    setIsCategorySubmitting(true);
    if (!firestore) {
      toast({ title: 'Error', description: 'Firestore is not available.', variant: 'destructive' });
      setIsCategorySubmitting(false);
      return;
    }

    const categoryDocRef = doc(firestore, 'categories', values.id);
    
    setDocumentNonBlocking(categoryDocRef, { name: values.name, imageId: values.imageId, id: values.id }, { merge: true });

    toast({
      title: 'Category Saved!',
      description: `The "${values.name}" category has been saved.`,
    });
    
    setIsCategorySubmitting(false);
    categoryForm.reset();
  }

  return (
    <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-12">
            <Card>
                <CardHeader>
                <CardTitle className="text-2xl font-headline">Dashboard</CardTitle>
                <CardDescription>Manage your store's products and categories.</CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle className="text-xl font-headline">Add New Product</CardTitle>
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
                                <FormLabel>Price (EGP)</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="e.g., 299.99" {...field} value={field.value ?? ''} />
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
                                <Input type="number" placeholder="e.g., 399.99" {...field} value={field.value ?? ''} onChange={field.onChange} />
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
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                            <FormLabel>Sizes</FormLabel>
                            <FormControl>
                            <Input placeholder="S, M, L, XL (comma-separated)" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={productForm.control}
                        name="imageIds"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Image IDs</FormLabel>
                            <FormControl>
                            <Input placeholder="image-id-1, image-id-2 (comma-separated)" {...field} />
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

                    <Button type="submit" className="w-full" disabled={isProductSubmitting}>
                        {isProductSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Product
                    </Button>
                    </form>
                </Form>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-headline">Manage Categories</CardTitle>
                    <CardDescription>Add a new category or edit an existing one by using the same ID.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...categoryForm}>
                        <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <FormField
                                    control={categoryForm.control}
                                    name="id"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category ID</FormLabel>
                                        <FormControl>
                                        <Input placeholder="e.g., clothing" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={categoryForm.control}
                                    name="name"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category Name</FormLabel>
                                        <FormControl>
                                        <Input placeholder="e.g., Clothing" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={categoryForm.control}
                                    name="imageId"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image ID</FormLabel>
                                        <FormControl>
                                        <Input placeholder="e.g., category-clothing" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto" disabled={isCategorySubmitting}>
                                {isCategorySubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Category
                            </Button>
                        </form>
                    </Form>
                    <Separator className="my-8" />
                    <h3 className="text-lg font-medium mb-4">Existing Categories</h3>
                    <div className="space-y-2">
                        {categoriesLoading && <p>Loading categories...</p>}
                        {categories && categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-2 border rounded-md">
                                <div>
                                    <p className="font-semibold">{cat.name}</p>
                                    <p className="text-sm text-muted-foreground">ID: {cat.id}</p>
                                    <p className="text-sm text-muted-foreground">Image ID: {cat.imageId}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => categoryForm.reset(cat)}>Edit</Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
