export interface Product {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  description: string;
  stock: number;
  minorder: number;
  imageUrl?: string | null;
  detailImageUrls?: string | null;
  badge?: string | null;
  discountRate: number;
  createdAt: Date | string;
}
