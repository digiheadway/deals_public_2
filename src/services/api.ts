import axios from 'axios';
import { Property, PropertyFormData, FilterOptions } from '../types/property';

const API_BASE_URL = 'https://prop.digiheadway.in/api/network.php';

function normalizeProperty(data: any): Property {
  return {
    ...data,
    id: Number(data.id),
    owner_id: Number(data.owner_id),
    min_size: Number(data.min_size),
    size_max: Number(data.size_max),
    price_min: Number(data.price_min),
    price_max: Number(data.price_max),
    is_public: Number(data.is_public),
    public_rating: data.public_rating ? Number(data.public_rating) : undefined,
    my_rating: data.my_rating ? Number(data.my_rating) : undefined,
  };
}

function normalizeProperties(data: any[]): Property[] {
  return data.map(normalizeProperty);
}

export const propertyApi = {
  async getUserProperties(ownerId: number): Promise<Property[]> {
    const response = await axios.get(API_BASE_URL, {
      params: {
        action: 'get_user_properties',
        owner_id: ownerId,
      },
    });
    return normalizeProperties(response.data);
  },

  async getPublicProperties(ownerId: number): Promise<Property[]> {
    const response = await axios.get(API_BASE_URL, {
      params: {
        action: 'get_public_properties',
        owner_id: ownerId,
      },
    });
    return normalizeProperties(response.data);
  },

  async getAllProperties(ownerId: number): Promise<Property[]> {
    const response = await axios.get(API_BASE_URL, {
      params: {
        action: 'get_all_properties',
        owner_id: ownerId,
      },
    });
    return normalizeProperties(response.data);
  },

  async addProperty(ownerId: number, data: PropertyFormData): Promise<{ success: boolean; id: number }> {
    const response = await axios.post(
      `${API_BASE_URL}?action=add_property`,
      {
        owner_id: ownerId,
        ...data,
      }
    );
    return response.data;
  },

  async updateProperty(id: number, ownerId: number, data: Partial<PropertyFormData>): Promise<{ success: boolean }> {
    const response = await axios.post(
      `${API_BASE_URL}?action=update_property`,
      {
        id,
        owner_id: ownerId,
        ...data,
      }
    );
    return response.data;
  },

  async deleteProperty(id: number, ownerId: number): Promise<{ success: boolean }> {
    const response = await axios.get(API_BASE_URL, {
      params: {
        action: 'delete_property',
        id,
        owner_id: ownerId,
      },
    });
    return response.data;
  },

  async filterProperties(filters: FilterOptions): Promise<Property[]> {
    const response = await axios.get(API_BASE_URL, {
      params: {
        action: 'filter_properties',
        ...filters,
      },
    });
    return normalizeProperties(response.data);
  },

  async searchProperties(query: string, column?: string): Promise<Property[]> {
    const response = await axios.get(API_BASE_URL, {
      params: {
        action: 'search_properties',
        query,
        ...(column && { column }),
      },
    });
    return normalizeProperties(response.data);
  },
};
