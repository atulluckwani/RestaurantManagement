export interface MenuItem {
  id: string;
  name: string;
  cuisine: "North Indian" | "South Indian" | "Chinese";
  price: number;
}

export interface CartItemInput {
  itemId: string;
  quantity: number;
}

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface DeliveryAddress {
  flatHomeDetails: string;
  area: string;
  landmark: string;
  pinCode: string;
  city: string;
  state: string;
}

export interface Order {
  orderId: string;
  address: string | DeliveryAddress;
  items: OrderItem[];
  totalPrice: number;
  status: "In process" | "Delivered";
  createdAt: string;
  deliveredAt?: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}
