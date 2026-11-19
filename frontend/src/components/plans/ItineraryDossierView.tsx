import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  AutoAwesome as AiIcon,
  BookmarkAdd as SaveIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Diamond as GemIcon,
  LightbulbOutlined as TipIcon,
  LocationOn as LocationIcon,
  Print as PrintIcon,
  Restaurant as FoodIcon,
  RouteOutlined as RouteIcon,
  Send as SendIcon,
  ViewAgenda as OverviewIcon,
} from '@mui/icons-material';
import { DayPlan, ItineraryPlaceItem, TripPlanResponse } from '../../api/types';
import { plannerApi } from '../../api/plannerApi';
import { plansApi } from '../../api/plansApi';
import { useAuth } from '../../context/AuthContext';
import { ItineraryMap } from '../map/ItineraryMap';
import { BudgetCard } from '../planner/BudgetCard';
import { TransitConnector } from '../planner/TransitConnector';
import { SeasonalWeatherBadge } from '../planner/SeasonalWeatherBadge';
import { PrintItineraryDossier } from './PrintItineraryDossier';

export interface ItineraryDossierViewProps {
  plan: TripPlanResponse;
  savedPlanId?: number | null;
  customTitle?: string;
  onBack: () => void;
  onPlanUpdated?: (updated: TripPlanResponse) => void;
  onPlanSaved?: (savedId: number) => void;
  onOpenAuth?: () => void;
}

const CATEGORY_EMOJIS: Record<string, string> = {
  beach: '🏖️',
  temple: '🛕',
  heritage: '🏛️',
  wildlife: '🐅',
  hill_station: '⛰️',
  nature: '🌿',
  adventure: '🧭',
  city: '🏙️',
};

const getTimeBadgeColor = (timeStr: string) => {
  const lower = (timeStr || '').toLowerCase();
  if (lower.includes('morning')) return { bg: '#FEF3C7', color: '#92400E', label: '🌅 Morning' };
  if (lower.includes('afternoon')) return { bg: '#E0E7FF', color: '#3730A3', label: '☀️ Afternoon' };
  if (lower.includes('sunset') || lower.includes('evening'))
    return { bg: '#FFEDD5', color: '#9A3412', label: '🌇 Sunset / Evening' };
  return { bg: '#F1F5F9', color: '#334155', label: timeStr || 'Daytime' };
};

export const ItineraryDossierView: React.FC<ItineraryDossierViewProps> = ({
  plan,
  savedPlanId: initialSavedId = null,
  customTitle,
  onBack,
  onPlanUpdated,
  onPlanSaved,
  onOpenAuth,
}) => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<TripPlanResponse>(plan);
  const [savedId, setSavedId] = useState<number | null>(initialSavedId);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(1); // 0: Overview, 1..N: Individual Days
  const [mobileViewTab, setMobileViewTab] = useState<'schedule' | 'map'>('schedule');

  // AI Chat Assistant Drawer
  const [aiDrawerOpen, setAiDrawerOpen] = useState<boolean>(false);
  const [aiInput, setAiInput] = useState<string>('');
  const [aiSending, setAiSending] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; isPlanUpdated?: boolean }>
  >([
    {
      role: 'assistant',
      text: `Hello! I'm your AI travel concierge for ${currentPlan.state_name}. You can ask me to tweak any day, add temples or waterfalls, adjust the budget, or change dietary options.`,
    },
  ]);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToMyTrips = async () => {
    if (!isAuthenticated) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (savedId || isSaving) return;

    setIsSaving(true);
    try {
      const saved = await plansApi.savePlan({
        state_id: currentPlan.state_id,
        title: customTitle || currentPlan.trip_title,
        plan_json: currentPlan,
        preferences: {},
      });
      setSavedId(saved.id);
      if (onPlanSaved) {
        onPlanSaved(saved.id);
      }
    } catch (err: unknown) {
      console.error('Failed to save plan:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendAiMessage = async () => {
    if (!aiInput.trim() || aiSending) return;
    const msg = aiInput.trim();
    setAiInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setAiSending(true);

    try {
      const res = await plannerApi.chatFollowUp({
        state_id: currentPlan.state_id,
        message: msg,
        current_plan: currentPlan,
        plan_id: savedId,
      });

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.reply || 'Your itinerary has been updated!',
          isPlanUpdated: !!res.updated_plan,
        },
      ]);

      if (res.updated_plan) {
        setCurrentPlan(res.updated_plan);
        if (activeTab > res.updated_plan.total_days) {
          setActiveTab(1);
        }
        if (savedId) {
          await plansApi.updatePlan(savedId, { plan_json: res.updated_plan });
        }
        if (onPlanUpdated) {
          onPlanUpdated(res.updated_plan);
        }
      }
    } catch (err: unknown) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Sorry, I encountered an issue updating the plan. Please try again.' },
      ]);
    } finally {
      setAiSending(false);
    }
  };

  const activeDay = activeTab > 0 ? currentPlan.days[activeTab - 1] : null;

  return (
    <>
      <Box sx={{ py: 4, minHeight: '85vh', backgroundColor: '#F8FAFC' }} className="no-print">
        <Container maxWidth="xl">
        {/* Navigation & Action Bar */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Button
              startIcon={<BackIcon />}
              onClick={onBack}
              sx={{
                fontWeight: 700,
                color: '#334155',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 2,
                px: 2,
                py: 0.8,
                textTransform: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                '&:hover': { backgroundColor: '#F1F5F9' },
              }}
            >
              Back
            </Button>
            <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>
              AI Travel Dossier
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            {/* Save to My Trips Button */}
            <Button
              variant={savedId ? 'outlined' : 'contained'}
              startIcon={savedId ? <CheckIcon /> : <SaveIcon />}
              onClick={handleSaveToMyTrips}
              disabled={isSaving}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                backgroundColor: savedId ? '#F0FDF4' : '#1E7D5C',
                color: savedId ? '#15803D' : '#FFFFFF',
                borderColor: savedId ? '#86EFAC' : undefined,
                textTransform: 'none',
                boxShadow: savedId ? 'none' : '0 2px 8px rgba(30, 125, 92, 0.25)',
                '&:hover': {
                  backgroundColor: savedId ? '#DCFCE7' : '#176449',
                },
              }}
            >
              {isSaving ? 'Saving...' : savedId ? 'Saved in My Trips' : 'Save to My Trips'}
            </Button>

            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                color: '#334155',
                borderColor: '#CBD5E1',
                backgroundColor: '#FFFFFF',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#F1F5F9' },
              }}
            >
              PDF / Print
            </Button>

            <Button
              variant="contained"
              startIcon={<AiIcon />}
              onClick={() => setAiDrawerOpen(true)}
              sx={{
                borderRadius: 2,
                fontWeight: 800,
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.2)',
                '&:hover': {
                  backgroundColor: '#1E293B',
                },
              }}
            >
              Refine with AI Assistant
            </Button>
          </Stack>
        </Stack>

        {/* Title Header Card */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 3.5,
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
            mb: 3.5,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: '#1E293B',
                fontSize: { xs: '1.4rem', sm: '1.85rem' },
                lineHeight: 1.25,
                mb: 1,
              }}
            >
              {customTitle || currentPlan.trip_title}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 0.8 }}>
              <Chip
                size="small"
                icon={<LocationIcon sx={{ fontSize: '14px !important', color: '#1E7D5C !important' }} />}
                label={currentPlan.state_name}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  backgroundColor: '#F0FDF4',
                  color: '#1E7D5C',
                  border: '1px solid #BBF7D0',
                }}
              />
              <Chip
                size="small"
                label={`⏱️ ${currentPlan.total_days} Days Circuit`}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  backgroundColor: '#F8FAFC',
                  color: '#334155',
                  border: '1px solid #E2E8F0',
                }}
              />
              <Chip
                size="small"
                label={`💰 Est. Total: ₹${Math.round(currentPlan.budget_breakdown?.total_estimated_cost || currentPlan.total_budget).toLocaleString()}`}
                sx={{
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  backgroundColor: '#F8FAFC',
                  color: '#047857',
                  border: '1px solid #E2E8F0',
                }}
              />
            </Stack>
          </Box>
        </Paper>

        {/* Mobile View Switcher (Schedule vs Route Map) */}
        <Box sx={{ display: { xs: 'block', lg: 'none' }, mb: 2.5 }} className="no-print">
          <Paper
            elevation={0}
            sx={{
              p: 0.5,
              borderRadius: 2.5,
              backgroundColor: '#F1F5F9',
              border: '1px solid #E2E8F0',
            }}
          >
            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                size="small"
                variant={mobileViewTab === 'schedule' ? 'contained' : 'text'}
                onClick={() => setMobileViewTab('schedule')}
                sx={{
                  borderRadius: 2,
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  backgroundColor: mobileViewTab === 'schedule' ? '#1E7D5C' : 'transparent',
                  color: mobileViewTab === 'schedule' ? '#FFFFFF' : '#475569',
                  boxShadow: mobileViewTab === 'schedule' ? '0 2px 6px rgba(30,125,92,0.25)' : 'none',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: mobileViewTab === 'schedule' ? '#176449' : '#E2E8F0',
                  },
                }}
              >
                📋 Day Schedule & Budget
              </Button>
              <Button
                fullWidth
                size="small"
                variant={mobileViewTab === 'map' ? 'contained' : 'text'}
                onClick={() => setMobileViewTab('map')}
                sx={{
                  borderRadius: 2,
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  backgroundColor: mobileViewTab === 'map' ? '#1E7D5C' : 'transparent',
                  color: mobileViewTab === 'map' ? '#FFFFFF' : '#475569',
                  boxShadow: mobileViewTab === 'map' ? '0 2px 6px rgba(30,125,92,0.25)' : 'none',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: mobileViewTab === 'map' ? '#176449' : '#E2E8F0',
                  },
                }}
              >
                🗺️ Route Map
              </Button>
            </Stack>
          </Paper>
        </Box>

        {/* 2-Column Split: Itinerary Details (Left 58%) & Live Route Map (Right 42%) */}
        <Grid container spacing={3.5} alignItems="flex-start">
          {/* Left Column: Day Navigation Tabs & Schedule */}
          <Grid
            item
            xs={12}
            lg={7}
            sx={{ display: { xs: mobileViewTab === 'schedule' ? 'block' : 'none', lg: 'block' } }}
          >
            {/* Day Selector Tabs */}
            <Box
              sx={{
                mb: 2.5,
                backgroundColor: '#FFFFFF',
                borderRadius: 2.5,
                p: 0.5,
                border: '1px solid #E2E8F0',
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 44,
                  '& .MuiTab-root': {
                    minHeight: 44,
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 2,
                    color: '#64748B',
                    '&.Mui-selected': {
                      color: '#FFFFFF',
                      backgroundColor: '#1E7D5C',
                      boxShadow: '0 2px 6px rgba(30, 125, 92, 0.25)',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    display: 'none',
                  },
                }}
              >
                <Tab
                  value={0}
                  icon={<OverviewIcon sx={{ fontSize: '16px !important' }} />}
                  iconPosition="start"
                  label="All Days Overview"
                />
                {currentPlan.days.map((d) => (
                  <Tab
                    key={d.day_number}
                    value={d.day_number}
                    label={`Day ${d.day_number}: ${d.destination_name.split(/[,&]/)[0].trim()}`}
                  />
                ))}
              </Tabs>
            </Box>

            {/* View: Overview of All Days */}
            {activeTab === 0 && (
              <Stack spacing={2.5}>
                {currentPlan.days.map((d) => (
                  <Paper
                    key={d.day_number}
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            backgroundColor: '#1E7D5C',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                          }}
                        >
                          D{d.day_number}
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E293B' }}>
                            {d.destination_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                            {d.theme}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <SeasonalWeatherBadge
                          destinationName={d.destination_name}
                          stateName={currentPlan.state_name}
                          variant="compact"
                          latitude={d.places.find((p) => p.latitude != null && p.longitude != null)?.latitude}
                          longitude={d.places.find((p) => p.latitude != null && p.longitude != null)?.longitude}
                        />
                        <Chip
                          size="small"
                          label={`Est. ₹${d.day_budget.toLocaleString()}`}
                          sx={{ fontWeight: 800, backgroundColor: '#F8FAFC', color: '#1E7D5C' }}
                        />
                      </Stack>
                    </Stack>

                    <Stack spacing={1}>
                      {d.places.map((p, pIdx) => (
                        <Stack
                          key={pIdx}
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                          sx={{
                            p: 1.2,
                            borderRadius: 1.5,
                            backgroundColor: '#F8FAFC',
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', minWidth: 70 }}>
                            {p.recommended_time}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155', flexGrow: 1 }}>
                            {p.place_name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                            {p.entry_fee === 0 ? 'Free Entry' : `Ticket: ₹${p.entry_fee}`}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}

            {/* View: Single Active Day */}
            {activeTab > 0 && activeDay && (
              <Stack spacing={2.5}>
                {/* Destination Hub Banner */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={1.5}
                    sx={{ mb: 1.5 }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.3 }}>
                        {activeDay.theme || `Day ${activeDay.day_number}`}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.6}>
                        <LocationIcon sx={{ fontSize: 16, color: '#1E7D5C' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748B' }}>
                          Destination Hub: <strong>{activeDay.destination_name}</strong>
                        </Typography>
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <SeasonalWeatherBadge
                        destinationName={activeDay.destination_name}
                        stateName={currentPlan.state_name}
                        variant="compact"
                        latitude={activeDay.places.find((p) => p.latitude != null && p.longitude != null)?.latitude}
                        longitude={activeDay.places.find((p) => p.latitude != null && p.longitude != null)?.longitude}
                      />
                      <Chip
                        size="small"
                        label={`Est. Day Spend: ₹${activeDay.day_budget.toLocaleString()}`}
                        sx={{
                          fontWeight: 800,
                          backgroundColor: '#F0FDF4',
                          color: '#166534',
                          border: '1px solid #BBF7D0',
                        }}
                      />
                    </Stack>
                  </Stack>

                  {/* Weather & Travel Season Insight Strip */}
                  <SeasonalWeatherBadge
                    destinationName={activeDay.destination_name}
                    stateName={currentPlan.state_name}
                    variant="detailed"
                    latitude={activeDay.places.find((p) => p.latitude != null && p.longitude != null)?.latitude}
                    longitude={activeDay.places.find((p) => p.latitude != null && p.longitude != null)?.longitude}
                  />
                </Paper>

                {/* Attraction Cards for Active Day */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#64748B', letterSpacing: 0.5, mb: 1.5, display: 'block' }}
                  >
                    Scheduled Sightseeing Stops ({activeDay.places.length})
                  </Typography>

                  <Stack spacing={0}>
                    {activeDay.places.map((place, idx) => {
                      const timeInfo = getTimeBadgeColor(place.recommended_time);
                      const catEmoji = CATEGORY_EMOJIS[place.category] || '📍';
                      const nextPlace = activeDay.places[idx + 1];

                      return (
                        <React.Fragment key={`${place.place_id}-${idx}`}>
                          <Card
                            elevation={0}
                            sx={{
                              p: 2.5,
                              borderRadius: 3,
                              border: '1px solid #E2E8F0',
                              backgroundColor: '#FFFFFF',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: '#1E7D5C',
                                boxShadow: '0 4px 16px rgba(30, 125, 92, 0.08)',
                              },
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.2 }}>
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                <Chip
                                  size="small"
                                  label={timeInfo.label}
                                  sx={{
                                    fontWeight: 800,
                                    fontSize: '0.7rem',
                                    height: 24,
                                    backgroundColor: timeInfo.bg,
                                    color: timeInfo.color,
                                  }}
                                />
                                <Chip
                                  size="small"
                                  label={`${catEmoji} ${place.category.replace('_', ' ').toUpperCase()}`}
                                  sx={{
                                    backgroundColor: '#F1F5F9',
                                    color: '#334155',
                                    fontWeight: 700,
                                    fontSize: '0.68rem',
                                    height: 24,
                                  }}
                                />
                                {place.is_hidden_gem && (
                                  <Chip
                                    size="small"
                                    icon={<GemIcon sx={{ fontSize: '13px !important', color: '#0EA5E9 !important' }} />}
                                    label="Hidden Gem"
                                    sx={{
                                      fontSize: '0.68rem',
                                      height: 24,
                                      fontWeight: 800,
                                      backgroundColor: 'rgba(14, 165, 233, 0.1)',
                                      color: '#0284C7',
                                    }}
                                  />
                                )}
                              </Stack>

                              <Typography variant="body2" sx={{ fontWeight: 800, color: '#1E293B' }}>
                                {place.entry_fee === 0 ? 'Free Entry' : `Ticket: ₹${place.entry_fee}`}
                              </Typography>
                            </Stack>

                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.8, fontSize: '1.05rem' }}>
                              {place.place_name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6 }}>
                              {place.description}
                            </Typography>
                          </Card>

                          {/* Inter-Attraction Driving & Transit Connector */}
                          {nextPlace && (
                            <TransitConnector
                              fromCoords={{ lat: place.latitude ?? null, lng: place.longitude ?? null }}
                              toCoords={{ lat: nextPlace.latitude ?? null, lng: nextPlace.longitude ?? null }}
                              fromName={place.place_name}
                              toName={nextPlace.place_name}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </Stack>
                </Box>

                {/* Local Culinary Specialties */}
                {activeDay.meals && activeDay.meals.length > 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                      <FoodIcon sx={{ fontSize: 20, color: '#1E7D5C' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E293B' }}>
                        Authentic Local Dining & Specialties
                      </Typography>
                    </Stack>

                    <Grid container spacing={1.5}>
                      {activeDay.meals.map((meal, mIdx) => {
                        const isVeg = meal.food_type.toLowerCase() === 'veg';
                        return (
                          <Grid item xs={12} sm={6} key={mIdx}>
                            <Box
                              sx={{
                                p: 1.8,
                                borderRadius: 2,
                                backgroundColor: '#F8FAFC',
                                border: '1px solid #E2E8F0',
                              }}
                            >
                              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#64748B' }}>
                                  {meal.meal_type}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={meal.food_type.toUpperCase()}
                                  sx={{
                                    fontSize: '0.62rem',
                                    height: 18,
                                    fontWeight: 800,
                                    backgroundColor: isVeg ? '#DCFCE7' : '#FFE4E6',
                                    color: isVeg ? '#15803D' : '#BE123C',
                                  }}
                                />
                              </Stack>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E293B' }}>
                                {meal.dish_name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#1E7D5C', fontWeight: 800 }}>
                                Avg. ₹{meal.avg_price}
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Paper>
                )}

                {/* Travel Tips for Active Day */}
                {activeDay.travel_tips && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                    }}
                  >
                    <Stack direction="row" spacing={1.2} alignItems="flex-start">
                      <TipIcon sx={{ fontSize: 18, color: '#10B981', mt: 0.2 }} />
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#047857', display: 'block', mb: 0.2 }}>
                          Day Route Tip & Practical Advice
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.85rem', lineHeight: 1.55 }}>
                          {activeDay.travel_tips}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}
              </Stack>
            )}

            {/* Itemized Budget Card at bottom of left column */}
            <Box sx={{ mt: 3.5 }}>
              <BudgetCard
                breakdown={
                  currentPlan.budget_breakdown || {
                    accommodation_estimate: 4000,
                    food_estimate: 2500,
                    activities_and_entry: 500,
                    local_transport_estimate: 2000,
                    total_estimated_cost: currentPlan.total_budget,
                  }
                }
                targetBudget={currentPlan.total_budget}
                totalDays={currentPlan.total_days}
              />
            </Box>
          </Grid>

          {/* Right Column: Sticky Live Route Map (42%) */}
          <Grid
            item
            xs={12}
            lg={5}
            sx={{ display: { xs: mobileViewTab === 'map' ? 'block' : 'none', lg: 'block' } }}
          >
            <Box sx={{ position: { lg: 'sticky' }, top: 90 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3.5,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <RouteIcon sx={{ color: '#1E7D5C', fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E293B' }}>
                    Interactive Circuit Map
                  </Typography>
                </Stack>

                <ItineraryMap
                  days={currentPlan.days}
                  activeDayNumber={activeTab}
                  height={500}
                />
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* AI Assistant Drawer */}
      <Drawer
        anchor="right"
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 420 },
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
      >
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AiIcon sx={{ color: '#1E7D5C' }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B' }}>
                AI Trip Assistant
              </Typography>
            </Stack>
            <IconButton onClick={() => setAiDrawerOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 2.5 }} />

          {/* Chat Messages Log */}
          <Stack spacing={2} sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 0.5 }}>
            {chatMessages.map((m, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 1.8,
                  borderRadius: 2.5,
                  backgroundColor: m.role === 'user' ? '#1E7D5C' : '#F8FAFC',
                  border: m.role === 'user' ? 'none' : '1px solid #E2E8F0',
                  color: m.role === 'user' ? '#FFFFFF' : '#1E293B',
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '92%',
                  boxShadow: m.role === 'user' ? '0 2px 6px rgba(30,125,92,0.2)' : '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                {m.isPlanUpdated && (
                  <Box sx={{ mb: 1.2 }}>
                    <Chip
                      icon={<AiIcon sx={{ fontSize: '0.85rem !important', color: '#047857 !important' }} />}
                      label="Itinerary & Map Updated on Screen"
                      size="small"
                      sx={{
                        backgroundColor: '#ECFDF5',
                        color: '#065F46',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        height: 24,
                        border: '1px solid #A7F3D0',
                      }}
                    />
                  </Box>
                )}
                <Typography
                  variant="body2"
                  sx={{
                    lineHeight: 1.6,
                    fontSize: '0.86rem',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.text}
                </Typography>
              </Box>
            ))}
            {aiSending && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5 }}>
                <CircularProgress size={16} sx={{ color: '#1E7D5C' }} />
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Optimizing itinerary & rerouting map...
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Suggestion Chips & Input Bar */}
        <Box sx={{ pt: 2, borderTop: '1px solid #E2E8F0' }}>
          <Stack direction="row" spacing={0.8} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.8 }}>
            {[
              'Add mixed places for last 2 days',
              'Make Day 2 more relaxed',
              'Feature regional veg dining',
              'Add waterfalls & nature',
            ].map((promptText) => (
              <Chip
                key={promptText}
                label={promptText}
                size="small"
                onClick={() => {
                  setAiInput(promptText);
                }}
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  backgroundColor: '#F1F5F9',
                  color: '#334155',
                  cursor: 'pointer',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#E2E8F0',
                    color: '#1E7D5C',
                  },
                }}
              />
            ))}
          </Stack>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              fullWidth
              placeholder="e.g. Make Day 2 more relaxed..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendAiMessage();
                }
              }}
              disabled={aiSending}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                },
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSendAiMessage}
              disabled={aiSending || !aiInput.trim()}
              sx={{
                backgroundColor: '#1E7D5C',
                color: '#FFFFFF',
                borderRadius: 2,
                '&:hover': { backgroundColor: '#176449' },
                '&.Mui-disabled': { backgroundColor: '#E2E8F0', color: '#94A3B8' },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Drawer>
    </Box>

    {/* Printable Dedicated Travel Dossier (Activated on PDF / Print) */}
    <PrintItineraryDossier plan={currentPlan} customTitle={customTitle} />
  </>
);
};
