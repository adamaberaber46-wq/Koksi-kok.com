

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
import { Loader2, Trash2, PlusCircle } from 'lucide-react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Separator } from '@/components/ui/separator';
import type { Category, Product, HeroSection, FooterSettings, SiteSettings, ProductVariant } from '@/lib/types';
import { useMemoFirebase, useUser } from '@/firebase/provider';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
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
} from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { useDoc } from '@/firebase/firestore/use-doc';

const productVariantSchema = z.object({
    color: z.string().min(1, 'Color name is required'),
    imageUrls: z.string().min(1, 'At least one image URL is required.'),
    price: z.coerce.number().positive('Price must be a positive number'),
});

const productFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: 'Product name must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  price: z.coerce.number().positive({ message: 'Base price must be a positive number.' }),
  originalPrice: z.coerce.number().optional().nullable(),
  brand: z.string().min(2, { message: 'Brand is required.' }),
  category: z.string().min(1, { message: 'Category is required.' }),
  sizes: z.string().min(1, { message: 'At least one size is required.' }),
  imageUrls: z.string().min(1, { message: 'At least one general image URL is required.' }),
  material: z.string().min(2, { message: 'Material is required.' }),
  countryOfOrigin: z.string().min(2, { message: 'Country of origin is required.' }),
  variants: z.array(productVariantSchema).min(1, "At least one color variant is required."),
  isFeatured: z.boolean().default(false),
  // Optional fields
  tags: z.string().optional(),
  sku: z.string().optional(),
  weightGrams: z.coerce.number().optional(),
  careInstructions: z.string().optional(),
});

const categoryFormSchema = z.object({
    id: z.string().min(2, { message: 'Category ID must be at least 2 characters.'}),
    name: z.string().min(2, { message: 'Category name must be at least 2 characters.' }),
    imageUrl: z.string().url({ message: 'Please enter a valid URL.' }),
});

const heroSectionFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters."}),
  subtitle: z.string().min(10, { message: "Subtitle must be at least 10 characters."}),
  imageUrl: z.string().url({ message: "Please enter a valid URL."}),
});

const footerFormSchema = z.object({
  socialLinks: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    url: z.string().url("Invalid URL"),
  })).optional(),
});

const siteSettingsFormSchema = z.object({
    faviconUrl: z.string().url({ message: "Please enter a valid URL for the favicon."}).optional().or(z.literal('')),
});

export default function DashboardPage() {
  const [isProductSubmitting, setIsProductSubmitting] = useState(false);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const [isHeroSubmitting, setIsHeroSubmitting] = useState(false);
  const [isFooterSubmitting, setIsFooterSubmitting] = useState(false);
  const [isSiteSettingsSubmitting, setIsSiteSettingsSubmitting] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
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
  const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesQuery);

  const productsQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  const heroSectionDocRef = useMemoFirebase(() => (firestore ? doc(firestore, 'site_settings', 'hero') : null), [firestore]);
  const { data: heroSectionData } = useDoc<HeroSection>(heroSectionDocRef);

  const footerSettingsDocRef = useMemoFirebase(() => (firestore ? doc(firestore, 'site_settings', 'footer') : null), [firestore]);
  const { data: footerData } = useDoc<FooterSettings>(footerSettingsDocRef);
  
  const siteSettingsDocRef = useMemoFirebase(() => (firestore ? doc(firestore, 'site_settings', 'general') : null), [firestore]);
  const { data: siteSettingsData } = useDoc<SiteSettings>(siteSettingsDocRef);

  const productForm = useForm<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      originalPrice: undefined,
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
      careInstructions: '',
    },
  });
  
  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control: productForm.control,
    name: 'variants',
  });

  const categoryForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      id: '',
      name: '',
      imageUrl: '',
    },
  });

  const heroSectionForm = useForm<z.infer<typeof heroSectionFormSchema>>({
    resolver: zodResolver(heroSectionFormSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      imageUrl: '',
    },
  });

  const footerForm = useForm<z.infer<typeof footerFormSchema>>({
    resolver: zodResolver(footerFormSchema),
    defaultValues: {
      socialLinks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "socialLinks",
    control: footerForm.control,
  });

  const siteSettingsForm = useForm<z.infer<typeof siteSettingsFormSchema>>({
    resolver: zodResolver(siteSettingsFormSchema),
    defaultValues: {
        faviconUrl: '',
    }
  });

  useEffect(() => {
    if (heroSectionData) {
      heroSectionForm.reset(heroSectionData);
    }
  }, [heroSectionData, heroSectionForm]);
  
  useEffect(() => {
    if (footerData) {
      footerForm.reset({ socialLinks: footerData.socialLinks || [] });
    }
  }, [footerData, footerForm]);

  useEffect(() => {
    if (siteSettingsData) {
        siteSettingsForm.reset(siteSettingsData);
    }
  }, [siteSettingsData, siteSettingsForm]);


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
      name: values.name,
      description: values.description,
      price: Number(values.price),
      brand: values.brand,
      category: values.category,
      sizes: values.sizes.split(',').map((s) => s.trim()),
      imageUrls: values.imageUrls.split(',').map((url) => url.trim()),
      material: values.material,
      countryOfOrigin: values.countryOfOrigin,
      isFeatured: values.isFeatured,
      variants: values.variants.map(v => ({
        ...v,
        price: Number(v.price),
        imageUrls: v.imageUrls.split(',').map(url => url.trim()),
      })),
      ...(values.tags && { tags: values.tags.split(',').map(t => t.trim()) }),
      ...(values.sku && { sku: values.sku }),
      ...(values.weightGrams && { weightGrams: Number(values.weightGrams) }),
      ...(values.careInstructions && { careInstructions: values.careInstructions }),
    };
    
    if (values.originalPrice) {
      newProductData.originalPrice = Number(values.originalPrice);
    } else {
      newProductData.originalPrice = undefined;
    }

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
    productForm.reset({
      name: '',
      description: '',
      price: 0,
      originalPrice: undefined,
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
      careInstructions: '',
    });
    setEditingProductId(null);
  }

  function handleEditProduct(product: Product) {
    setEditingProductId(product.id);
    productForm.reset({
        ...product,
        price: product.price || 0,
        originalPrice: product.originalPrice || undefined,
        sizes: product.sizes ? product.sizes.join(', ') : '',
        imageUrls: product.imageUrls ? product.imageUrls.join(', ') : '',
        tags: product.tags ? product.tags.join(', ') : '',
        isFeatured: product.isFeatured || false,
        variants: product.variants.map(v => ({
            ...v,
            imageUrls: Array.isArray(v.imageUrls) ? v.imageUrls.join(', ') : '',
        })) || [{ color: '', imageUrls: '', price: product.price }]
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingProductId(null);
    productForm.reset({
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
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
      careInstructions: '',
    });
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
    
    setDocumentNonBlocking(categoryDocRef, { name: values.name, imageUrl: values.imageUrl, id: values.id }, { merge: true });

    toast({
      title: 'Category Saved!',
      description: `The "${values.name}" category has been saved.`,
    });
    
    setIsCategorySubmitting(false);
    categoryForm.reset();
  }

  function handleDeleteCategory(categoryId: string) {
    if (!firestore) return;
    const categoryDocRef = doc(firestore, 'categories', categoryId);
    deleteDocumentNonBlocking(categoryDocRef);
    toast({
      title: 'Category Deleted',
      description: 'The category has been successfully removed.',
      variant: 'destructive',
    });
  }


  async function onHeroSubmit(values: z.infer<typeof heroSectionFormSchema>) {
    setIsHeroSubmitting(true);
    if (!heroSectionDocRef) {
      toast({ title: 'Error', description: 'Firestore is not available.', variant: 'destructive' });
      setIsHeroSubmitting(false);
      return;
    }

    setDocumentNonBlocking(heroSectionDocRef, values, { merge: true });

    toast({
      title: 'Hero Section Updated!',
      description: 'The homepage hero section has been successfully updated.',
    });
    
    setIsHeroSubmitting(false);
  }

  async function onFooterSubmit(values: z.infer<typeof footerFormSchema>) {
    setIsFooterSubmitting(true);
    if (!footerSettingsDocRef) {
        toast({ title: 'Error', description: 'Firestore is not available.', variant: 'destructive' });
        setIsFooterSubmitting(false);
        return;
    }

    setDocumentNonBlocking(footerSettingsDocRef, values, { merge: true });

    toast({
        title: 'Footer Updated!',
        description: 'The footer social links have been successfully updated.',
    });

    setIsFooterSubmitting(false);
  }
  
  async function onSiteSettingsSubmit(values: z.infer<typeof siteSettingsFormSchema>) {
    setIsSiteSettingsSubmitting(true);
    if (!siteSettingsDocRef) {
        toast({ title: 'Error', description: 'Firestore is not available.', variant: 'destructive' });
        setIsSiteSettingsSubmitting(false);
        return;
    }

    setDocumentNonBlocking(siteSettingsDocRef, values, { merge: true });

    toast({
        title: 'Site Settings Updated!',
        description: 'Your general site settings have been saved.',
    });
    
    setIsSiteSettingsSubmitting(false);
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
                <CardTitle className="text-2xl font-headline">Dashboard</CardTitle>
                <CardDescription>Manage your store's products, categories, and site settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/admin/orders">View Orders</Link>
                    </Button>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-headline">General Site Settings</CardTitle>
                    <CardDescription>Manage global settings for your site like the favicon.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...siteSettingsForm}>
                        <form onSubmit={siteSettingsForm.handleSubmit(onSiteSettingsSubmit)} className="space-y-8">
                            <FormField
                                control={siteSettingsForm.control}
                                name="faviconUrl"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Favicon URL</FormLabel>
                                    <FormControl>
                                    <Input placeholder="https://example.com/favicon.png" {...field} />
                                    </FormControl>
                                    <FormDescription>The icon that appears in the browser tab. Use a square .png or .ico file.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full md:w-auto" disabled={isSiteSettingsSubmitting}>
                                {isSiteSettingsSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Site Settings
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-headline">Manage Hero Section</CardTitle>
                    <CardDescription>Update the main content of your homepage hero.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...heroSectionForm}>
                        <form onSubmit={heroSectionForm.handleSubmit(onHeroSubmit)} className="space-y-8">
                            <FormField
                                control={heroSectionForm.control}
                                name="title"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., Find Your Signature Style" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={heroSectionForm.control}
                                name="subtitle"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subtitle</FormLabel>
                                    <FormControl>
                                    <Textarea placeholder="e.g., Discover curated collections..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={heroSectionForm.control}
                                name="imageUrl"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Image URL</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., https://example.com/image.jpg" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full md:w-auto" disabled={isHeroSubmitting}>
                                {isHeroSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Hero Section
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-headline">Manage Footer</CardTitle>
                    <CardDescription>Update the social media links in your site's footer.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...footerForm}>
                        <form onSubmit={footerForm.handleSubmit(onFooterSubmit)} className="space-y-8">
                            <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex flex-col sm:flex-row items-end gap-4 p-4 border rounded-md">
                                    <FormField
                                        control={footerForm.control}
                                        name={`socialLinks.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1 w-full">
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Facebook" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={footerForm.control}
                                        name={`socialLinks.${index}.url`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1 w-full">
                                            <FormLabel>URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://facebook.com/..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className='w-full sm:w-10'>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            </div>
                            <div className='flex flex-col sm:flex-row gap-2'>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => append({ name: '', url: '' })}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Social Link
                                </Button>
                                <Button type="submit" disabled={isFooterSubmitting}>
                                    {isFooterSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Footer Links
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
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
                    
                    {/* Product Variants Section */}
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
                                    name="imageUrl"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image URL</FormLabel>
                                        <FormControl>
                                        <Input placeholder="e.g., https://example.com/image.jpg" {...field} />
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
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold">{cat.name}</p>
                                    <p className="text-sm text-muted-foreground">ID: {cat.id}</p>
                                    <p className="text-sm text-muted-foreground truncate">Image URL: {cat.imageUrl}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => categoryForm.reset(cat)}>Edit</Button>
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
                                                This action cannot be undone. This will permanently delete the category
                                                "{cat.name}".
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteCategory(cat.id)}>
                                                Delete
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

    