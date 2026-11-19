import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Card,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Diamond as GemIcon,
  ExpandMore as ExpandMoreIcon,
  LightbulbOutlined as TipIcon,
  LocationOn as LocationIcon,
  PaymentsOutlined as FeeIcon,
  Restaurant as MealIcon,
} from '@mui/icons-material';
import { DayPlan } from '../../api/types';
import { designTokens } from '../../theme/tokens';
import { TransitConnector } from './TransitConnector';
import { SeasonalWeatherBadge } from './SeasonalWeatherBadge';

interface ItineraryViewProps {
  days: DayPlan[];
  overallAdvice?: string;
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

export const ItineraryView: React.FC<ItineraryViewProps> = ({ days, overallAdvice }) => {
  const theme = useTheme();
  // Expanded days: default expand first day
  const [expanded, setExpanded] = useState<string | false>('day-1');

  const handleChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Stack spacing={2.5}>
      {overallAdvice && (
        <Alert
          severity="info"
          icon={<TipIcon sx={{ color: '#1E7D5C' }} />}
          sx={{
            borderRadius: 3,
            backgroundColor: '#F0FDF4',
            color: '#1E293B',
            border: '1px solid #BBF7D0',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E7D5C', mb: 0.5 }}>
            AI Travel Advisory & Route Optimization
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.6, color: '#334155' }}>
            {overallAdvice}
          </Typography>
        </Alert>
      )}

      {days.map((day) => {
        const panelId = `day-${day.day_number}`;
        const isCurrentExpanded = expanded === panelId;

        return (
          <Accordion
            key={day.day_number}
            expanded={isCurrentExpanded}
            onChange={handleChange(panelId)}
            disableGutters
            sx={{
              borderRadius: '14px !important',
              border: `1.5px solid ${isCurrentExpanded ? '#1E7D5C' : '#E2E8F0'}`,
              boxShadow: isCurrentExpanded ? '0 6px 20px rgba(30, 125, 92, 0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
              '&:before': { display: 'none' },
              overflow: 'hidden',
              transition: 'all 0.25s ease',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: isCurrentExpanded ? '#1E7D5C' : '#64748B' }} />}
              sx={{
                px: 2.5,
                py: 1.2,
                backgroundColor: isCurrentExpanded ? '#F8FAFC' : '#FFFFFF',
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                sx={{ width: '100%', pr: 2 }}
                spacing={1}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      backgroundColor: isCurrentExpanded ? '#1E7D5C' : '#0F172A',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.88rem',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}
                  >
                    D{day.day_number}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.25, color: '#1E293B' }}>
                      {day.theme || `Day ${day.day_number}`}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: '#64748B', mt: 0.2 }}>
                      <LocationIcon sx={{ fontSize: 14, color: '#1E7D5C' }} />
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {day.destination_name}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <SeasonalWeatherBadge
                    destinationName={day.destination_name}
                    variant="compact"
                    latitude={day.places.find((p) => p.latitude != null && p.longitude != null)?.latitude}
                    longitude={day.places.find((p) => p.latitude != null && p.longitude != null)?.longitude}
                  />
                  <Chip
                    size="small"
                    label={`${day.places.length} Attractions`}
                    sx={{
                      fontSize: '0.72rem',
                      height: 24,
                      fontWeight: 700,
                      backgroundColor: '#F1F5F9',
                      color: '#334155',
                    }}
                  />
                  <Chip
                    size="small"
                    label={`Est. ₹${day.day_budget.toLocaleString()}`}
                    sx={{
                      fontSize: '0.74rem',
                      height: 24,
                      fontWeight: 800,
                      backgroundColor: '#ECFDF5',
                      color: '#065F46',
                      border: '1px solid #A7F3D0',
                    }}
                  />
                </Stack>
              </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ px: 2.5, pb: 3, pt: 1.5, backgroundColor: '#FFFFFF' }}>
              <Stack spacing={2.5}>
                {/* Weather Insight Strip */}
                <SeasonalWeatherBadge
                  destinationName={day.destination_name}
                  variant="detailed"
                  latitude={day.places.find((p) => p.latitude != null && p.longitude != null)?.latitude}
                  longitude={day.places.find((p) => p.latitude != null && p.longitude != null)?.longitude}
                />

                {/* Scheduled Attractions Journey Trail */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#64748B', letterSpacing: 0.6 }}
                  >
                    Scheduled Itinerary & Route Stops
                  </Typography>

                  <Stack spacing={0} sx={{ mt: 1.5 }}>
                    {day.places.map((place, idx) => {
                      const timeInfo = getTimeBadgeColor(place.recommended_time);
                      const catEmoji = CATEGORY_EMOJIS[place.category] || '📍';
                      const nextPlace = day.places[idx + 1];

                      return (
                        <React.Fragment key={`${place.place_id}-${idx}`}>
                          <Card
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: 2.5,
                              backgroundColor: '#FFFFFF',
                              borderColor: '#E2E8F0',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: '#1E7D5C',
                                boxShadow: '0 4px 12px rgba(30, 125, 92, 0.08)',
                              },
                            }}
                          >
                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              justifyContent="space-between"
                              alignItems={{ xs: 'flex-start', sm: 'center' }}
                              spacing={1}
                              sx={{ mb: 1 }}
                            >
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                <Chip
                                  size="small"
                                  icon={<TimeIcon sx={{ fontSize: '13px !important' }} />}
                                  label={timeInfo.label}
                                  sx={{
                                    fontWeight: 800,
                                    fontSize: '0.72rem',
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

                              <Stack direction="row" alignItems="center" spacing={0.6}>
                                <FeeIcon sx={{ fontSize: 16, color: '#64748B' }} />
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E293B' }}>
                                  {place.entry_fee === 0 ? 'Free Entry' : `Ticket: ₹${place.entry_fee}`}
                                </Typography>
                              </Stack>
                            </Stack>

                            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: '#1E293B', fontSize: '0.95rem' }}>
                              {place.place_name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.5, fontSize: '0.84rem' }}>
                              {place.description}
                            </Typography>
                          </Card>

                          {/* Inter-Attraction Driving Connector */}
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

                {/* Verified Meals for the Day */}
                {day.meals && day.meals.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#64748B', letterSpacing: 0.6 }}
                    >
                      Authentic Regional Culinary Guide
                    </Typography>

                    <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                      {day.meals.map((meal, mIdx) => {
                        const isVeg = meal.food_type.toLowerCase() === 'veg';
                        return (
                          <Grid item xs={12} sm={4} key={`${meal.dish_name}-${mIdx}`}>
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 1.8,
                                borderRadius: 2.5,
                                backgroundColor: '#F8FAFC',
                                borderColor: '#E2E8F0',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Box>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.6 }}>
                                  <Stack direction="row" alignItems="center" spacing={0.6}>
                                    <MealIcon sx={{ fontSize: 15, color: '#1E7D5C' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>
                                      {meal.meal_type}
                                    </Typography>
                                  </Stack>
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
                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
                                  {meal.dish_name}
                                </Typography>
                              </Box>
                              <Typography variant="caption" sx={{ color: '#1E7D5C', fontWeight: 800, mt: 0.5 }}>
                                Avg. ₹{meal.avg_price}
                              </Typography>
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                )}

                {/* Day Travel Tips */}
                {day.travel_tips && (
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: 2.5,
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                    }}
                  >
                    <Stack direction="row" spacing={1.2} alignItems="flex-start">
                      <TipIcon sx={{ fontSize: 18, color: '#10B981', mt: 0.2 }} />
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#047857', display: 'block', mb: 0.2 }}>
                          Local Route Tips & Practical Advice
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.84rem', lineHeight: 1.55 }}>
                          {day.travel_tips}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
};
