import { apiClient } from './client';
import {
  PlannerAssistantRequest,
  PlannerAssistantResponse,
  PlannerChatRequest,
  PlannerChatResponse,
  TripPlanRequest,
  TripPlanResponse,
} from './types';

export const plannerApi = {
  converse: async (payload: PlannerAssistantRequest): Promise<PlannerAssistantResponse> => {
    const response = await apiClient.post<PlannerAssistantResponse>('/planner/converse', payload);
    return response.data;
  },

  generatePlan: async (payload: TripPlanRequest): Promise<TripPlanResponse> => {
    const response = await apiClient.post<TripPlanResponse>('/planner/generate', payload);
    return response.data;
  },

  chatFollowUp: async (payload: PlannerChatRequest): Promise<PlannerChatResponse> => {
    const response = await apiClient.post<PlannerChatResponse>('/planner/chat', payload);
    return response.data;
  },
};


