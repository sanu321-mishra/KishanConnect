export interface Crop {
  id?: number;
  name: string;
  type: string;
  price: number;
  quantity: number;
  village: string;
  contact: string;
  health_status?: string;
  harvest_date?: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
} 