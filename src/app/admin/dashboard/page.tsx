
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
import { useState, useEffect } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Separator } from '@/components/ui/separator';
import type { Category, Product } from '@/lib/types';
import { useMemoFirebase } from '@/firebase/provider';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { formatPrice } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const productFormSchema = z.object({
  id: z.string().optional(),
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
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const router = useRouter();

  const categoriesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesQuery);

  const productsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

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

    const newProductData = {
        ...values,
        sizes: values.sizes.split(',').map((s) => s.trim()),
        imageIds: values.imageIds.split(',').map((id) => id.trim()),
        price: Number(values.price),
        ...(values.originalPrice && { originalPrice: Number(values.originalPrice) }),
    };
    
    delete (newProductData as any).id; // Don't save the form's 'id' field in Firestore

    if (editingProductId) {
        const productDocRef = doc(firestore, 'products', editingProductId);
        setDocumentNonBlocking(productDocRef, newProductData, { merge: true });
        toast({
            title: 'Product Updated!',
            description: `${values.name} has been successfully updated.`,
        });
    } else {
        const productsCollection = collection(firestore, 'products');
        addDocumentNonBlocking(productsCollection, newProductData);
        toast({
            title: 'Product Added!',
            description: `${values.name} has been successfully added to the store.`,
        });
    }

    setIsProductSubmitting(false);
    productForm.reset();
    setEditingProductId(null);
  }

  function handleEditProduct(product: Product) {
    setEditingProductId(product.id);
    productForm.reset({
        ...product,
        sizes: product.sizes.join(', '),
        imageIds: product.imageIds.join(', '),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingProductId(null);
    productForm.reset();
  }

  function handleDeleteProduct(productId: string) {
    if (!firestore) return;
    const productDocRef = doc(firestore, 'products', productId);
    deleteDocumentNonBlocking(productDocRef);
    toast({
        title: 'Product Deleted',
        description: 'The product has been successfully removed.',
        variant: 'destructive',
    });
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
                    <CardTitle className="text-xl font-headline">{editingProductId ? "Edit Product" : "Add New Product"}</CardTitle>
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

                    <div className="flex gap-2">
                        {editingProductId && (
                            <Button type="button" variant="outline" onClick={handleCancelEdit}>
                                Cancel
                            </Button>
                        )}
                        <Button type="submit" className="w-full" disabled={isProductSubmitting}>
                            {isProductSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingProductId ? "Save Changes" : "Add Product"}
                        </Button>
                    </div>
                    </form>
                </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-headline">Manage Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {productsLoading && <p>Loading products...</p>}
                        {products && products.map(product => (
                            <div key={product.id} className="flex items-center justify-between p-4 border rounded-md gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>Edit</Button>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                             <Button variant="destructive" size="icon">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the product
                                                "{product.name}".
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                                                Delete
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                         {products?.length === 0 && !productsLoading && (
                            <p className="text-muted-foreground text-center py-4">No products found.</p>
                         )}
                    </div>
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

    