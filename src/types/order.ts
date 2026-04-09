import { User } from "./user";

export interface Order {
  id: number;
  userId: string;
  status: "pending" | "confirmed" | "shipped" | "done" | string;
  totalPrice: number;
  receiver: string;
  phone: string;
  address: string;
  memo?: string | null;
  createdAt: Date | string;
  items?: OrderItem[];
  user?: User;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  order?: Order;
}
