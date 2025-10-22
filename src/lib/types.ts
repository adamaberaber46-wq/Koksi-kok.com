export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  sizes: string[];
  category: 'Clothing' | 'Shoes';
  imageId: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  imageId: string;
};
