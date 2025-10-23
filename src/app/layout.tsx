import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';
import Header from '@/components/header';
import Footer from '@/components/footer';

export const metadata: Metadata = {
  title: 'Koksi Kok',
  description: 'تسوق الآن من شركة Koksi Kok أفضل الملابس، الأحذية، والإكسسوارات الأصلية بأسعار مميزة وجودة مضمونة. تسوق أونلاين بسهولة مع شحن سريع لجميع المحافظات.',
  keywords: "Koksi Kok, شركة ملابس وأحذية وإكسسوارات, متجر إلكتروني, تسوق أونلاين, كوتشي أديداس, أحذية نايك, ملابس رجالي ونسائي, ترنجات أصلية, ساعات وإكسسوارات, موضة عصرية, منتجات أصلية, خصومات, عروض, ملابس كاجوال, أحذية سبورت, شنط, تسوق الآن, جودة عالية",
  authors: [{ name: 'Koksi Kok Company' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Koksi Kok | متجر إلكتروني للأزياء والأحذية والإكسسوارات',
    description: 'أفضل متجر إلكتروني لشراء الأحذية والملابس والإكسسوارات الأصلية بأسعار مميزة وجودة مضمونة.',
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
    description: 'تسوق أحدث الأزياء والأحذية والإكسسوارات الأصلية من Koksi Kok.',
    images: ['https://koksi-kok.vercel.app/logo.png'],
  },
};

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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add Google Search Console verification tag here */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased'
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
