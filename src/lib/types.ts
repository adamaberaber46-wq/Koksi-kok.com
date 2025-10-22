export type Product = {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  originalPrice?: number;
  sizes: string[];
  category: 'Clothing' | 'Shoes';
  imageId: string;
  hoverImageId: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  imageId: string;
};

export type Category = {
  id: string;
  name: string;
  imageId: string;
};
