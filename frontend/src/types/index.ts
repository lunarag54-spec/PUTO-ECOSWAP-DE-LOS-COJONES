export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'NEW' | 'LIKE_NEW' | 'USED' | 'DAMAGED' | 'REFURBISHED';
  imageUrl?: string;
  username: string;        
  createdAt: string;
  isSold?: boolean;
}