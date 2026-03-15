export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  quantity: number;
  min_quantity: number;
  price: number;
  category_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  type: 'IN' | 'OUT';
  quantity: number;
  notes: string | null;
  user_id: string | null;
  created_at: string;
  products?: { name: string };
}
