import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Cairo } from 'next/font/google';
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { SiteSettings } from '@/lib/types';
import type { Metadata } from 'next';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-cairo',
});

// Helper function to fetch site settings
async function getSiteSettings() {
  try {
    const { firestore } = initializeFirebase();
    const settingsDocRef = doc(firestore, 'site_settings', 'general');
    const docSnap = await getDoc(settingsDocRef);

    if (docSnap.exists()) {
      return docSnap.data() as SiteSettings;
    }
    return null;
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const metadata: Metadata = {
    title: 'Koksi Kok | Fashion & Shoes Store',
    description:
      'تسوق الآن من شركة Koksi Kok أفضل الملابس، الأحذية، والإكسسوارات الأصلية بأسعار مميزة وجودة مضمونة. تسوق أونلاين بسهولة مع شحن سريع لجميع المحافظات.',
    keywords:
      'Koksi Kok, شركة ملابس وأحذية وإكسسوارات, متجر إلكتروني, تسوق أونلاين, كوتشي أديداس, أحذية نايك, ملابس رجالي ونسائي, ترنجات أصلية, ساعات وإكسسوارات, موضة عصرية, منتجات أصلية, خصومات, عروض, ملابس كاجوال, أحذية سبورت, شنط, تسوق الآن, جودة عالية',
    authors: [{ name: 'Koksi Kok Company' }],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: 'Koksi Kok | متجر إلكتروني للأزياء والأحذية والإكسسوارات',
      description:
        'أفضل متجر إلكتروني لشراء الأحذية والملابس والإكسسوارات الأصلية بأسعار مميزة وجودة مضمونة.',
      url: 'https://koksi-kok.vercel.app',
      siteName: 'Koksi Kok',
      images: [
        {
          url: 'https://koksi-kok.vercel.app/logo.png',
          width: 800,
          height: 600,
          alt: 'Koksi Kok Logo',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Koksi Kok | Fashion & Shoes Store',
      description:
        'تسوق أحدث الأزياء والأحذية والإكسسوارات الأصلية من Koksi Kok.',
      images: ['https://koksi-kok.vercel.app/logo.png'],
    },
    icons: {
      icon: settings?.faviconUrl || '/favicon.ico',
    },
  };

  return metadata;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Koksi Kok',
    url: 'https://koksi-kok.vercel.app',
    logo: 'https://koksi-kok.vercel.app/logo.png',
    sameAs: [
      'https://www.facebook.com/koksi.kok',
      'https://www.instagram.com/koksi.kok',
      'https://www.linkedin.com/company/koksi-kok',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+201234567890',
      contactType: 'customer service',
      areaServed: 'EG',
      availableLanguage: ['Arabic', 'English'],
    },
  };

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* ✅ General Meta Tags */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="author" content="Koksi Kok Company" />
        <meta name="copyright" content="Koksi Kok © 2025" />
        <meta name="language" content="Arabic" />
        <meta name="rating" content="General" />
        <meta name="distribution" content="global" />
        <meta name="classification" content="E-commerce, Fashion, Shoes, Accessories" />

        {/* ✅ Google Search Console */}
        <meta name="google-site-verification" content="ZQLPiVxNUyCsG-X88B3lCMLXTsaffJg3kgE6KdLYuro" />
        {/* ✅ Open Graph (Facebook, Instagram, WhatsApp) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Koksi Kok | Fashion & Shoes Store" />
        <meta
          property="og:description"
          content="تسوق أحدث الأزياء والأحذية والإكسسوارات الأصلية من Koksi Kok بأسعار مميزة وجودة مضمونة."
        />
        <meta property="og:url" content="https://koksi-kok.vercel.app" />
        <meta property="og:site_name" content="Koksi Kok" />
        <meta property="og:locale" content="ar_AR" />
        <meta property="og:image" content="https://koksi-kok.vercel.app/logo.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="600" />

        {/* ✅ Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Koksi Kok | Fashion & Shoes Store" />
        <meta
          name="twitter:description"
          content="تسوق أحدث الأزياء والأحذية والإكسسوارات الأصلية من Koksi Kok."
        />
        <meta name="twitter:image" content="https://koksi-kok.vercel.app/logo.png" />

        {/* ✅ WhatsApp Preview (uses OG tags, but we reinforce it for better display) */}
        <meta property="og:whatsapp:title" content="Koksi Kok | Fashion & Shoes Store" />
        <meta
          property="og:whatsapp:description"
          content="🛍️ اكتشف أحدث الموديلات من الملابس والأحذية والإكسسوارات الأصلية فقط على Koksi Kok!"
        />
        <meta
          property="og:whatsapp:image"
          content="https://koksi-kok.vercel.app/logo.png"
        />

        {/* ✅ Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>

      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          cairo.variable
        )}
      >
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
