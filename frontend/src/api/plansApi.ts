import { apiClient } from './client';
import { SavedPlanDetail, SavedPlanSummary, TripPlanResponse } from './types';

export const plansApi = {
  listPlans: async (): Promise<SavedPlanSummary[]> => {
    const response = await apiClient.get<SavedPlanSummary[]>('/plans');
    return response.data;
  },

  savePlan: async (payload: {
    state_id: number;
    title: string;
    preferences?: Record<string, unknown>;
    plan_json: TripPlanResponse;
  }): Promise<SavedPlanDetail> => {
    const response = await apiClient.post<SavedPlanDetail>('/plans', payload);
    return response.data;
  },

  getPlan: async (id: number): Promise<SavedPlanDetail> => {
    const response = await apiClient.get<SavedPlanDetail>(`/plans/${id}`);
    return response.data;
  },

  updatePlan: async (
    id: number,
    payload: { title?: string; plan_json?: TripPlanResponse }
  ): Promise<SavedPlanDetail> => {
    const response = await apiClient.patch<SavedPlanDetail>(`/plans/${id}`, payload);
    return response.data;
  },

  deletePlan: async (id: number): Promise<void> => {
    await apiClient.delete(`/plans/${id}`);
  },
};
