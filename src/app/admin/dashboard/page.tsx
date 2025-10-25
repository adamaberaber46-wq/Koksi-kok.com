

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
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Loader2, Trash2, PlusCircle } from 'lucide-react';
import { useCollection } from '@/firebase';
import { useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Separator } from '@/components/ui/separator';
import type { Category, HeroSection, FooterSettings, SiteSettings, ShippingRate } from '@/lib/types';
import { useMemoFirebase, useUser } from '@/firebase/provider';
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
import { useDoc } from '@/firebase/firestore/use-doc';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EGYPTIAN_GOVERNORATES } from '@/lib/egyptian-governorates';

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

const shippingRateFormSchema = z.object({
    id: z.string().optional(),
    governorate: z.string().min(1, { message: "Please select a governorate." }),
    rate: z.coerce.number().min(0, { message: "Rate must be a positive number." }),
});

export default function DashboardPage() {
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const [isHeroSubmitting, setIsHeroSubmitting] = useState(false);
  const [isFooterSubmitting, setIsFooterSubmitting] = useState(false);
  const [isSiteSettingsSubmitting, setIsSiteSettingsSubmitting] = useState(false);
  const [isShippingRateSubmitting, setIsShippingRateSubmitting] = useState(false);
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

  const shippingRatesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'shipping_rates') : null),
    [firestore]
  );
  const { data: shippingRates, isLoading: shippingRatesLoading } = useCollection<ShippingRate>(shippingRatesQuery);


  const heroSectionDocRef = useMemoFirebase(() => (firestore ? doc(firestore, 'site_settings', 'hero') : null), [firestore]);
  const { data: heroSectionData } = useDoc<HeroSection>(heroSectionDocRef);

  const footerSettingsDocRef = useMemoFirebase(() => (firestore ? doc(firestore, 'site_settings', 'footer') : null), [firestore]);
  const { data: footerData } = useDoc<FooterSettings>(footerSettingsDocRef);
  
  const siteSettingsDocRef = useMemoFirebase(() => (firestore ? doc(firestore, 'site_settings', 'general') : null), [firestore]);
  const { data: siteSettingsData } = useDoc<SiteSettings>(siteSettingsDocRef);


  const categoryForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      id: '',
      name: '',
      imageUrl: '',
    },
  });

  const shippingRateForm = useForm<z.infer<typeof shippingRateFormSchema>>({
    resolver: zodResolver(shippingRateFormSchema),
    defaultValues: {
      governorate: '',
      rate: 0,
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
  
  async function onShippingRateSubmit(values: z.infer<typeof shippingRateFormSchema>) {
    setIsShippingRateSubmitting(true);
    if (!firestore) {
      toast({ title: 'Error', description: 'Firestore is not available.', variant: 'destructive' });
      setIsShippingRateSubmitting(false);
      return;
    }

    const rateDocRef = doc(firestore, 'shipping_rates', values.governorate);
    const dataToSave = { id: values.governorate, governorate: values.governorate, rate: values.rate };
    
    setDocumentNonBlocking(rateDocRef, dataToSave, { merge: true });

    toast({
      title: 'Shipping Rate Saved!',
      description: `The rate for ${values.governorate} has been saved.`,
    });
    
    setIsShippingRateSubmitting(false);
    shippingRateForm.reset({ governorate: '', rate: 0});
  }

  function handleDeleteShippingRate(rateId: string) {
    if (!firestore) return;
    const rateDocRef = doc(firestore, 'shipping_rates', rateId);
    deleteDocumentNonBlocking(rateDocRef);
    toast({
      title: 'Shipping Rate Deleted',
      description: 'The shipping rate has been successfully removed.',
      variant: 'destructive',
    });
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
                <CardDescription>Manage your store's content, products, and orders.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button asChild variant="outline">
                        <Link href="/admin/products">Manage Products</Link>
                    </Button>
                     <Button asChild variant="outline">
                        <Link href="/admin/products/add">Add New Product</Link>
                    </Button>
                    <Button asChild variant="outline">
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
                    <CardTitle className="text-xl font-headline">Manage Shipping Rates</CardTitle>
                    <CardDescription>Set shipping costs for each governorate.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...shippingRateForm}>
                        <form onSubmit={shippingRateForm.handleSubmit(onShippingRateSubmit)} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                                <FormField
                                    control={shippingRateForm.control}
                                    name="governorate"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Governorate</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a governorate" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {EGYPTIAN_GOVERNORATES.map(gov => (
                                                    <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    control={shippingRateForm.control}
                                    name="rate"
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Shipping Rate (EGP)</FormLabel>
                                        <FormControl>
                                        <Input type="number" placeholder="e.g., 50" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto" disabled={isShippingRateSubmitting}>
                                {isShippingRateSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Shipping Rate
                            </Button>
                        </form>
                    </Form>
                    <Separator className="my-8" />
                    <h3 className="text-lg font-medium mb-4">Existing Shipping Rates</h3>
                    <div className="space-y-2">
                        {shippingRatesLoading && <p>Loading rates...</p>}
                        {shippingRates && shippingRates.map(rate => (
                            <div key={rate.id} className="flex items-center justify-between p-2 border rounded-md">
                                <div>
                                    <p className="font-semibold">{rate.governorate}</p>
                                    <p className="text-sm text-muted-foreground">Rate: {rate.rate} EGP</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => shippingRateForm.reset(rate)}>Edit</Button>
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
                                                This will permanently delete the shipping rate for "{rate.governorate}".
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteShippingRate(rate.id)}>
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
