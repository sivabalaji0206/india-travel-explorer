import React from 'react';
import { Box, Chip, Divider, Grid, Paper, Stack, Typography } from '@mui/material';
import { TripPlanResponse } from '../../api/types';
import { calculateDistanceKm, getDriveEstimate, getSeasonalWeather } from '../../utils/travelEnhancements';

interface PrintItineraryDossierProps {
  plan: TripPlanResponse;
  customTitle?: string;
}

export const PrintItineraryDossier: React.FC<PrintItineraryDossierProps> = ({
  plan,
  customTitle,
}) => {
  const b = plan.budget_breakdown;

  return (
    <Box
      className="print-only"
      sx={{
        display: 'none',
        '@media print': {
          display: 'block !important',
          color: '#0F172A',
          backgroundColor: '#FFFFFF',
          p: 0,
        },
      }}
    >
      {/* 1. Header & Branding */}
      <Box sx={{ borderBottom: '2.5px solid #1E7D5C', pb: 2, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="overline" sx={{ fontWeight: 800, color: '#1E7D5C', letterSpacing: 1.5 }}>
              INDIA TRAVEL EXPLORER • VERIFIED TRAVEL DOSSIER
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.2, my: 0.5 }}>
              {customTitle || plan.trip_title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
              Destination: <strong>{plan.state_name}</strong> • Duration: <strong>{plan.total_days} Days Circuit</strong>
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
              Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#1E7D5C', mt: 0.5 }}>
              Est. Total: ₹{Math.round(Number(b.total_estimated_cost)).toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Target: ₹{Math.round(Number(plan.total_budget)).toLocaleString()}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* 2. Itemized Budget Breakdown Table */}
      <Box sx={{ mb: 3.5, p: 2, border: '1px solid #E2E8F0', borderRadius: 2, backgroundColor: '#F8FAFC' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E293B', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.78rem' }}>
          Estimated Regional Expense Breakdown
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Stay & Hotel</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
              ₹{Math.round(Number(b.accommodation_estimate)).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Food & Dining</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
              ₹{Math.round(Number(b.food_estimate)).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Entry Tickets</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
              ₹{Math.round(Number(b.activities_and_entry)).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>Local Transit</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
              ₹{Math.round(Number(b.local_transport_estimate)).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* 3. Day-by-Day Complete Itinerary */}
      <Stack spacing={3}>
        {plan.days.map((day) => {
          const weather = getSeasonalWeather(day.destination_name, plan.state_name);

          return (
            <Box
              key={day.day_number}
              sx={{
                border: '1px solid #CBD5E1',
                borderRadius: 2.5,
                p: 2.5,
                pageBreakInside: 'avoid',
                breakInside: 'avoid',
              }}
            >
              {/* Day Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ borderBottom: '1px solid #E2E8F0', pb: 1.5, mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1E7D5C' }}>
                    Day {day.day_number}: {day.theme || day.destination_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                    Hub: <strong>{day.destination_name}</strong> • Climate: {weather.icon} {weather.temperature} ({weather.condition})
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                  Day Spend: ₹{Math.round(Number(day.day_budget)).toLocaleString()}
                </Typography>
              </Stack>

              {/* Scheduled Stops */}
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                {day.places.map((place, pIdx) => {
                  const nextPlace = day.places[pIdx + 1];
                  const dist = calculateDistanceKm(
                    place.latitude,
                    place.longitude,
                    nextPlace?.latitude,
                    nextPlace?.longitude
                  );
                  const drive = getDriveEstimate(dist);

                  return (
                    <React.Fragment key={pIdx}>
                      <Box sx={{ p: 1.5, border: '1px solid #E2E8F0', borderRadius: 2, backgroundColor: '#FFFFFF' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 800,
                                backgroundColor: '#F1F5F9',
                                color: '#1E293B',
                                px: 1,
                                py: 0.3,
                                borderRadius: 1,
                              }}
                            >
                              Stop {pIdx + 1} • {place.recommended_time}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                              {place.place_name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', textTransform: 'capitalize' }}>
                              ({place.category.replace('_', ' ')})
                            </Typography>
                          </Stack>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#16A34A' }}>
                            {Number(place.entry_fee) > 0 ? `₹${place.entry_fee}` : 'Free Entry'}
                          </Typography>
                        </Stack>
                        {place.description && (
                          <Typography variant="body2" sx={{ color: '#475569', mt: 0.8, fontSize: '0.84rem', lineHeight: 1.45 }}>
                            {place.description}
                          </Typography>
                        )}
                      </Box>

                      {/* Commute Connector */}
                      {nextPlace && (
                        <Box sx={{ pl: 2, py: 0.4 }}>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                            🚗 Commute to {nextPlace.place_name}: {drive.distanceStr} ({drive.timeStr}) • {drive.transitHint}
                          </Typography>
                        </Box>
                      )}
                    </React.Fragment>
                  );
                })}
              </Stack>

              {/* Meals & Tips */}
              <Grid container spacing={2}>
                {day.meals && day.meals.length > 0 && (
                  <Grid item xs={6}>
                    <Box sx={{ p: 1.2, backgroundColor: '#FEF9C3', borderRadius: 1.5, border: '1px solid #FEF08A' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#854D0E', display: 'block' }}>
                        🍽️ Regional Culinary Specialty:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#713F12' }}>
                        {day.meals[0].dish_name} (₹{day.meals[0].avg_price})
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {day.travel_tips && (
                  <Grid item xs={day.meals && day.meals.length > 0 ? 6 : 12}>
                    <Box sx={{ p: 1.2, backgroundColor: '#F0FDF4', borderRadius: 1.5, border: '1px solid #BBF7D0' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534', display: 'block' }}>
                        💡 Practical Travel Tip:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#14532D', fontSize: '0.82rem' }}>
                        {day.travel_tips}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          );
        })}
      </Stack>

      {/* 4. Travel Advisory & Helpline */}
      <Box sx={{ mt: 3.5, p: 2, border: '1px solid #E2E8F0', borderRadius: 2, backgroundColor: '#F8FAFC', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E7D5C', mb: 0.5 }}>
          Verified Travel Advisory & Important Numbers
        </Typography>
        <Typography variant="body2" sx={{ color: '#334155', mb: 1, fontSize: '0.84rem' }}>
          {plan.overall_advice}
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
          🚨 All-India Tourist Emergency Helpline: <strong>112 / 1363</strong> (Toll-Free 24x7) • State Road Transport & Railway Enquiries: <strong>139</strong>
        </Typography>
      </Box>

      {/* 5. Footer */}
      <Box sx={{ textAlign: 'center', mt: 3, pt: 1.5, borderTop: '1px solid #E2E8F0' }}>
        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
          Official itinerary produced by India Travel Explorer AI • Keep digital or printed copy during journey
        </Typography>
      </Box>
    </Box>
  );
};
