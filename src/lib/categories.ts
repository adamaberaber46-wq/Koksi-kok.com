import type { Category } from '@/lib/types';

// This file is now deprecated and categories are fetched from Firestore.
// You can manage categories from the admin dashboard.
export const categories: Category[] = [
  {
    id: 'clothing',
    name: 'Clothing',
    imageId: 'category-clothing',
  },
  {
    id: 'shoes',
    name: 'Shoes',
    imageId: 'category-shoes',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    imageId: 'category-accessories',
  },
];
