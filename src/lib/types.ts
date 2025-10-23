

export const ORDER_STATUSES = ['Pending', 'Shipped', 'Delivered', 'Cancelled'] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export type ProductVariant = {
  color: string;
  imageUrls: string[]; // Changed from imageUrl: string
  price: number;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number; // Base price
  originalPrice?: number;
  sizes: string[];
  category: string;
  imageUrls: string[]; // General images
  variants: ProductVariant[];
  material: string;
  countryOfOrigin: string;
  isFeatured?: boolean;
  tags?: string[];
  sku?: string;
  weightGrams?: number;
  careInstructions?: string;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  imageUrl: string;
};

export type Category = {
  id: string;
  name: string;
  imageUrl: string;
};

export type HeroSection = {
  title: string;
  subtitle: string;
  imageUrl: string;
};

export type FooterSettings = {
    socialLinks: {
        name: string;
        url: string;
    }[];
};

export type SiteSettings = {
    faviconUrl?: string;
}

export type Order = {
    id: string;
    userId: string | null;
    customerInfo: {
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        zip: string;
    };
    items: {
        id: string;
        name: string;
        quantity: number;
        price: number;
        size: string;
        imageUrl: string;
    }[];
    total: number;
    createdAt: any; // Firestore Timestamp
    orderStatus: OrderStatus;
};
    
export type UserRole = {
    roles: ('admin' | 'customer')[];
}
