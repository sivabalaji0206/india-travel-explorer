import { apiClient } from './client';
import {
  Destination,
  Food,
  FoodType,
  PaginatedResponse,
  Place,
  PlaceCategory,
  PlaceDetail,
  Season,
  State,
} from './types';

export const catalogueApi = {
  getStates: async (region?: string): Promise<State[]> => {
    const response = await apiClient.get<State[]>('/states', {
      params: region ? { region } : undefined,
    });
    return response.data;
  },

  getState: async (id: number): Promise<State> => {
    const response = await apiClient.get<State>(`/states/${id}`);
    return response.data;
  },

  getPlaces: async (params?: {
    state_id?: number;
    destination_id?: number;
    category?: PlaceCategory;
    budget_level?: string;
    best_season?: Season;
    search?: string;
    is_hidden_gem?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Place>> => {
    const response = await apiClient.get<PaginatedResponse<Place>>('/places', {
      params,
    });
    return response.data;
  },

  getPlacesByState: async (
    stateId: number,
    params?: {
      category?: PlaceCategory;
      budget_level?: string;
      best_season?: Season;
      search?: string;
      page?: number;
      page_size?: number;
    }
  ): Promise<PaginatedResponse<Place>> => {
    const response = await apiClient.get<PaginatedResponse<Place>>(`/states/${stateId}/places`, {
      params,
    });
    return response.data;
  },

  getPlaceDetail: async (id: number): Promise<PlaceDetail> => {
    const response = await apiClient.get<PlaceDetail>(`/places/${id}`);
    return response.data;
  },

  getDestinations: async (params?: {
    state_id?: number;
    search?: string;
    trip_type?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Destination>> => {
    const response = await apiClient.get<PaginatedResponse<Destination>>('/destinations', {
      params,
    });
    return response.data;
  },

  getFoods: async (params?: {
    state_id?: number;
    destination_id?: number;
    food_type?: FoodType;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Food>> => {
    const response = await apiClient.get<PaginatedResponse<Food>>('/foods', {
      params,
    });
    return response.data;
  },
};
