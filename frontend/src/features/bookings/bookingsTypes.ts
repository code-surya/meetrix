export interface Booking {
  id: number;
  booking_reference: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  total_amount: number;
  discount_amount?: number;
  discount_percentage?: number;
  total_tickets: number;
  event?: {
    id: number;
    title: string;
    start_date: string;
    venue_name: string;
    venue?: {
      name: string;
      city: string;
    };
  };
  booking_items?: BookingItem[];
  payment?: {
    id: number;
    status: string;
    amount: number;
    transaction_id?: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  confirmed_at?: string;
  cancelled_at?: string;
}

export interface BookingItem {
  id: number;
  ticket_type: {
    id: number;
    name: string;
    price: number;
  };
  quantity: number;
  unit_price: number;
  subtotal: number;
  qr_codes?: Array<{
    data: string;
    image_base64: string;
    image_url: string;
    generated_at: string;
  }>;
}

