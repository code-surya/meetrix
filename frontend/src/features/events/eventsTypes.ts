export interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  slug: string;
  start_date: string;
  end_date: string;
  timezone: string;
  venue: {
    name: string;
    address: string;
    city: string;
    state?: string;
    country: string;
    postal_code?: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  image_url?: string;
  banner_url?: string;
  featured: boolean;
  organizer?: {
    id: number;
    name: string;
    email?: string;
  };
  ticket_types?: TicketType[];
  statistics?: {
    total_tickets_sold: number;
    available_tickets: number;
    min_price?: number;
    max_price?: number;
    average_rating?: number;
    total_reviews?: number;
    sold_out?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface TicketType {
  id: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sold_quantity: number;
  available_quantity: number;
  on_sale: boolean;
  sale_start_date: string;
  sale_end_date: string;
}

export interface EventFilters {
  category?: string;
  status?: string;
  start_date_from?: string;
  start_date_to?: string;
  upcoming?: boolean;
  past?: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number;
  city?: string;
  state?: string;
  country?: string;
  min_price?: number;
  max_price?: number;
  organizer_id?: number;
  sort_by?: 'date' | 'price' | 'created_at' | 'title' | 'popularity';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  data: {
    [key: string]: T[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      per_page: number;
      has_next_page: boolean;
      has_prev_page: boolean;
    };
  };
}

