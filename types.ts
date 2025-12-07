
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  weight?: string;
  image: string;
  images?: string[]; // Array for multiple images
  category: string;
  discount?: string;
  eta?: string;
  details?: string;
}

export interface SubCategory {
  name: string;
  image: string;
}

export interface MainSection {
  title: string;
  subCategories: SubCategory[];
}

export interface Banner {
  id: number | string;
  image: string;
  linkTo: string;
}

export type MenuOption = 'home' | 'orders' | 'address' | 'contact' | 'terms' | 'about' | 'logout';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
  weight?: string;
}

export interface Order {
  id: string;
  userId?: string; // Link order to specific user
  date: string; // ISO string
  status: 'Placed' | 'Processing' | 'Confirmed' | 'Packing' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Returned';
  items: OrderItem[];
  totalAmount: number;
  address: string;
  deliveryBoyName?: string; // New field for Delivery Partner Name
  deliveryBoyPhone?: string; // New field for Delivery Partner Phone
}