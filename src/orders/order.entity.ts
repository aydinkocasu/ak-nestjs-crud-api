export class Order {
  id: number;
  user_id: number;
  total: number;
  order_status: string;
  created_at: Date;
  order_items: OrderItem[];
}

export class OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
}
