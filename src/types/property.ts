export interface Property {
  id: number;
  owner_id: number;
  city: string;
  area: string;
  type: string;
  description: string;
  note_private?: string;
  min_size: number;
  size_max: number;
  size_unit: string;
  price_min: number;
  price_max: number;
  location: string;
  location_accuracy?: string;
  is_public: number;
  public_rating?: number;
  my_rating?: number;
  created_on: string;
  updated_on?: string;
  tags?: string;
  highlights?: string;
}

export interface PropertyFormData {
  city: string;
  area: string;
  type: string;
  description: string;
  note_private?: string;
  min_size: number;
  size_max: number;
  size_unit: string;
  price_min: number;
  price_max: number;
  location: string;
  location_accuracy?: string;
  is_public: number;
  tags?: string;
  highlights?: string;
  public_rating?: number;
  my_rating?: number;
}

export interface FilterOptions {
  city?: string;
  area?: string;
  type?: string;
  min_price?: number;
  max_price?: number;
  is_public?: number;
}
