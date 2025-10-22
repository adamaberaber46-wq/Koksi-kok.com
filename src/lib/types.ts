
export type Product = {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  originalPrice?: number;
  sizes: string[];
  category: 'Clothing' | 'Shoes' | 'Accessories';
  imageUrls: string[];
  material: string;
  countryOfOrigin: string;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
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
};
    