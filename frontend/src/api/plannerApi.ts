import { apiClient } from './client';
import {
  PlannerChatRequest,
  PlannerChatResponse,
  TripPlanRequest,
  TripPlanResponse,
} from './types';

export const plannerApi = {
  generatePlan: async (payload: TripPlanRequest): Promise<TripPlanResponse> => {
    const response = await apiClient.post<TripPlanResponse>('/planner/generate', payload);
    return response.data;
  },

  chatFollowUp: async (payload: PlannerChatRequest): Promise<PlannerChatResponse> => {
    const response = await apiClient.post<PlannerChatResponse>('/planner/chat', payload);
    return response.data;
  },
};

