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

interface ItineraryViewProps {
  days: DayPlan[];
  overallAdvice?: string;
}

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
          icon={<TipIcon sx={{ color: theme.palette.primary.main }} />}
          sx={{
            borderRadius: 2,
            backgroundColor:
              theme.palette.mode === 'dark' ? 'rgba(224, 93, 56, 0.1)' : 'rgba(224, 93, 56, 0.06)',
            color: theme.palette.text.primary,
            border: `1px solid ${theme.palette.primary.main}30`,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 0.5 }}>
            AI Travel Advisory
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
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
              borderRadius: '12px !important',
              border: `1px solid ${
                isCurrentExpanded ? theme.palette.primary.main : theme.palette.divider
              }`,
              boxShadow: isCurrentExpanded
                ? '0 4px 16px rgba(0,0,0,0.06)'
                : 'none',
              '&:before': { display: 'none' },
              overflow: 'hidden',
              transition: 'border-color 0.2s ease',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                px: 2.5,
                py: 1,
                backgroundColor:
                  isCurrentExpanded
                    ? theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.03)'
                      : '#F8FAFC'
                    : 'inherit',
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
                      width: 34,
                      height: 34,
                      borderRadius: '8px',
                      backgroundColor: theme.palette.primary.main,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                    }}
                  >
                    D{day.day_number}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                      {day.theme || `Day ${day.day_number}`}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary' }}>
                      <LocationIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {day.destination_name}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    label={`${day.places.length} Attractions`}
                    sx={{ fontSize: '0.7rem', height: 22 }}
                  />
                  <Chip
                    size="small"
                    label={`Est. ₹${day.day_budget.toLocaleString()}`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: '0.72rem', height: 22, fontWeight: 700 }}
                  />
                </Stack>
              </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ px: 2.5, pb: 3, pt: 1 }}>
              <Stack spacing={3}>
                {/* Scheduled Attractions */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 0.5 }}>
                    Scheduled Itinerary & Sightseeing
                  </Typography>

                  <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                    {day.places.map((place, idx) => {
                      const catColor =
                        designTokens.colors.categories[place.category] || theme.palette.primary.main;

                      return (
                        <Card
                          key={`${place.place_id}-${idx}`}
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            backgroundColor:
                              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#FFFFFF',
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
                                label={place.recommended_time}
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.7rem',
                                  height: 22,
                                  backgroundColor:
                                    theme.palette.mode === 'dark'
                                      ? 'rgba(255,255,255,0.08)'
                                      : '#EEF2F6',
                                }}
                              />
                              <Chip
                                size="small"
                                label={place.category.replace('_', ' ').toUpperCase()}
                                sx={{
                                  backgroundColor: `${catColor}18`,
                                  color: catColor,
                                  fontWeight: 700,
                                  fontSize: '0.68rem',
                                  height: 22,
                                }}
                              />
                              {place.is_hidden_gem && (
                                <Chip
                                  size="small"
                                  icon={<GemIcon sx={{ fontSize: '13px !important' }} />}
                                  label="Hidden Gem"
                                  color="secondary"
                                  sx={{ fontSize: '0.68rem', height: 22, fontWeight: 700 }}
                                />
                              )}
                            </Stack>

                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <FeeIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                {place.entry_fee === 0 ? 'Free Entry' : `Ticket: ₹${place.entry_fee}`}
                              </Typography>
                            </Stack>
                          </Stack>

                          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                            {place.place_name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                            {place.description}
                          </Typography>
                        </Card>
                      );
                    })}
                  </Stack>
                </Box>

                {/* Verified Meals for the day */}
                {day.meals && day.meals.length > 0 && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', letterSpacing: 0.5 }}
                    >
                      Authentic Regional Culinary Guide
                    </Typography>

                    <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                      {day.meals.map((meal, mIdx) => (
                        <Grid item xs={12} sm={4} key={`${meal.dish_name}-${mIdx}`}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              backgroundColor:
                                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#FBFBFC',
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <MealIcon sx={{ fontSize: 15, color: theme.palette.primary.main }} />
                                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>
                                  {meal.meal_type}
                                </Typography>
                              </Stack>
                              <Chip
                                size="small"
                                label={meal.food_type.toUpperCase()}
                                color={meal.food_type === 'veg' ? 'success' : 'warning'}
                                sx={{ fontSize: '0.62rem', height: 18 }}
                              />
                            </Stack>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {meal.dish_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Avg. ₹{meal.avg_price}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Day Travel Tips */}
                {day.travel_tips && (
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor:
                        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F0FDF4',
                      border: `1px dashed ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#86EFAC'}`,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <TipIcon sx={{ fontSize: 18, color: '#10B981', mt: 0.2 }} />
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#047857', display: 'block' }}>
                          Local Tips & Recommendations
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
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

