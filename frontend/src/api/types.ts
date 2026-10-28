/**
 * TypeScript domain models aligned with backend schemas.
 */

export type PlaceCategory =
  | 'beach'
  | 'hill_station'
  | 'temple'
  | 'wildlife'
  | 'heritage'
  | 'adventure'
  | 'city'
  | 'nature';

export type BudgetLevel = 'low' | 'medium' | 'high';
export type Season = 'winter' | 'summer' | 'monsoon' | 'all_year';
export type FoodType = 'veg' | 'non_veg' | 'vegan';
export type UserRole = 'user' | 'admin';
export type ChatRole = 'user' | 'assistant' | 'system';

export interface PageMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PageMeta;
}

export interface State {
  id: number;
  name: string;
  region: string | null;
  description: string | null;
  best_time_to_visit: string | null;
  place_count: number;
  destination_count: number;
}

export interface Destination {
  id: number;
  state_id: number;
  state_name?: string;
  name: string;
  district: string | null;
  popularity_score: number | null;
  best_seasons: string[];
  trip_types: string[];
  min_days: number | null;
  ideal_days: number | null;
  max_days: number | null;
  description: string | null;
  safety_rating: number | null;
  permits_required: boolean;
  place_count: number;
}

export interface DestinationCostTier {
  id: number;
  destination_id: number;
  tier: BudgetLevel;
  accommodation_min: number;
  accommodation_max: number;
  food_min: number;
  food_max: number;
  activities_min: number;
  activities_max: number;
  local_transport_min: number;
  local_transport_max: number;
  total_daily_min: number;
  total_daily_max: number;
  is_estimated: boolean;
}

export interface Food {
  id: number;
  state_id: number;
  destination_id: number;
  destination_name?: string;
  name: string;
  food_type: FoodType;
  description: string | null;
  avg_price: number;
  price_is_estimated: boolean;
}

export interface Eatery {
  id: number;
  destination_id: number;
  name: string;
  area: string | null;
  meal_type: string;
}

export interface Place {
  id: number;
  state_id: number;
  state_name: string;
  destination_id: number;
  destination_name: string;
  name: string;
  category: PlaceCategory;
  description: string | null;
  best_season: Season;
  entry_fee: number | null;
  avg_daily_cost: number;
  budget_level: BudgetLevel;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  is_hidden_gem: boolean;
}

export interface PlaceDetail extends Place {
  nearby_foods: Food[];
  nearby_eateries: Eatery[];
  cost_tiers: DestinationCostTier[];
}

export interface ItineraryPlaceItem {
  place_id: number;
  place_name: string;
  category: PlaceCategory;
  description: string;
  entry_fee: number;
  recommended_time: string;
  is_hidden_gem: boolean;
}

export interface ItineraryMealItem {
  meal_type: string;
  dish_name: string;
  food_type: FoodType;
  avg_price: number;
}

export interface DayPlan {
  day_number: number;
  theme: string;
  destination_name: string;
  places: ItineraryPlaceItem[];
  meals: ItineraryMealItem[];
  day_budget: number;
  travel_tips: string;
}

export interface BudgetBreakdown {
  accommodation_estimate: number;
  food_estimate: number;
  activities_and_entry: number;
  local_transport_estimate: number;
  total_estimated_cost: number;
}

export interface TripPlanResponse {
  state_id: number;
  state_name: string;
  trip_title: string;
  total_days: number;
  total_budget: number;
  budget_breakdown: BudgetBreakdown;
  days: DayPlan[];
  overall_advice: string;
}

export interface TripPlanRequest {
  state_id: number;
  duration_days: number;
  total_budget: number;
  budget_tier: BudgetLevel;
  food_preference?: FoodType | null;
  travel_month?: string | null;
  interests?: PlaceCategory[];
}

export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export interface PlannerChatRequest {
  state_id: number;
  message: string;
  current_plan: TripPlanResponse;
  chat_history?: ChatTurn[];
  plan_id?: number | null;
}

export interface PlannerChatResponse {
  reply: string;
  updated_plan?: TripPlanResponse | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface SavedPlanSummary {
  id: number;
  user_id: number;
  state_id: number;
  state_name: string;
  title: string;
  total_days: number;
  created_at: string;
  updated_at: string;
}

export interface SavedPlanDetail {
  id: number;
  user_id: number;
  state_id: number;
  state_name: string;
  title: string;
  preferences?: Record<string, unknown> | null;
  plan_json: TripPlanResponse;
  created_at: string;
  updated_at: string;
}
