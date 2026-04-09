import { Product } from "./product";
import { User } from "./user";

export interface CartItem {
  id: number;
  userId: string;
  productId: number;
  quantity: number;
  createdAt: Date | string;
  user?: User;
  product?: Product;
}
