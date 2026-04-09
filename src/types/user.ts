export interface User {
  id: number;
  userId: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: Date | string;
}
