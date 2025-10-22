'use client';
import Link from 'next/link';
import { Shirt, Facebook, Instagram, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import type { FooterSettings } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

// Custom TikTok icon component
const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16.5 8.5a4.5 4.5 0 1 0-9 0v7a4.5 4.5 0 1 0 9 0" />
    <path d="M12 15.5V4" />
    <path d="M16.5 4H12" />
  </svg>
);

const socialIcons: { [key: string]: React.ComponentType<any> } = {
    facebook: Facebook,
    instagram: Instagram,
    tiktok: TikTokIcon,
};

export default function Footer() {
  const firestore = useFirestore();
  const footerSettingsRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'site_settings', 'footer') : null),
    [firestore]
  );
  const { data: footerData, isLoading } = useDoc<FooterSettings>(footerSettingsRef);


  return (
    <TooltipProvider>
      <footer className="border-t bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-full lg:col-span-2 mb-8 lg:mb-0">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline mb-4">
                <Shirt className="h-6 w-6" />
                <span>Koksi Kok</span>
              </Link>
              <p className="text-primary-foreground/70 max-w-xs">
                Your one-stop shop for the latest fashion trends.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-2">
                <li>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/products" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                        Products
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View all our products</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
                <li>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/offers" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                        Offers
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Check out our special deals</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">About</h4>
              <ul className="space-y-2">
                <li>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/about" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                        About Us
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Learn more about Koksi Kok</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/privacy-policy" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                        Privacy Policy
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Read our privacy policy</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
                <li>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/terms-of-service" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                        Terms of Service
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Review our terms of service</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-primary-foreground/70 mb-4 sm:mb-0">
              &copy; {new Date().getFullYear()} Koksi Kok. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              {isLoading && (
                  <>
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                  </>
              )}
              {footerData?.socialLinks?.map((link, index) => {
                const Icon = socialIcons[link.name.toLowerCase()];
                return (
                  Icon && (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" asChild className="hover:bg-primary-foreground/10">
                          <Link href={link.url} aria-label={link.name} target="_blank" rel="noopener noreferrer">
                            <Icon className="h-5 w-5" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Follow us on {link.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                );
              })}
            </div>
          </div>
        </div>
      </footer>
    </TooltipProvider>
  );
}
