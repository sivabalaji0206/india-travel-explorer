import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material';
import {
  BookmarkAdd as SaveIcon,
  Check as CheckIcon,
  Diamond as GemIcon,
  DirectionsCar as TransportIcon,
  Hotel as HotelIcon,
  LightbulbOutlined as TipIcon,
  LocalActivity as TicketIcon,
  LocationOn as LocationIcon,
  Print as PrintIcon,
  Refresh as RestartIcon,
  Restaurant as FoodIcon,
  ViewAgenda as OverviewIcon,
} from '@mui/icons-material';
import { TripPlanResponse } from '../../api/types';
import { designTokens } from '../../theme/tokens';

interface ChatItineraryCardProps {
  plan: TripPlanResponse;
  savedPlanId: number | null;
  saving: boolean;
  onSavePlan: () => void;
  onResetPlan: () => void;
}

export const ChatItineraryCard: React.FC<ChatItineraryCardProps> = ({
  plan,
  savedPlanId,
  saving,
  onSavePlan,
  onResetPlan,
}) => {
  const theme = useTheme();
  // 0: Overview (All Days), 1..N: Individual Days
  const [activeTab, setActiveTab] = useState<number>(1);

  const formatCurrency = (val: number | string | undefined | null) => {
    if (val === undefined || val === null) return '0';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return Math.round(Number.isNaN(num) ? 0 : num).toLocaleString();
  };

  const getShortDestName = (name: string): string => {
    if (!name) return '';
    const lower = name.toLowerCase();
    if (lower.includes('visakhapatnam')) return 'Vizag';
    if (lower.includes('araku')) return 'Araku';
    if (lower.includes('thiruvananthapuram')) return 'Trivandrum';
    if (lower.includes('sambhaji nagar')) return 'Sambhaji Nagar';
    const firstSegment = name.split(/[,&]/)[0].trim();
    const cleaned = firstSegment
      .replace(/\b(Island|Islands|Valley|Hills|City|Foothills|Complex)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleaned.length <= 16) return cleaned || firstSegment;
    return `${cleaned.slice(0, 15).trim()}…`;
  };

  const getTimeBadgeColor = (timeStr: string) => {
    const lower = (timeStr || '').toLowerCase();
    if (lower.includes('morning')) return { bg: '#FEF3C7', color: '#92400E', label: '🌅 Morning' };
    if (lower.includes('afternoon')) return { bg: '#E0E7FF', color: '#3730A3', label: '☀️ Afternoon' };
    if (lower.includes('sunset') || lower.includes('evening'))
      return { bg: '#FFEDD5', color: '#9A3412', label: '🌇 Sunset / Evening' };
    return { bg: '#F1F5F9', color: '#334155', label: timeStr || 'Daytime' };
  };

  const handlePrint = () => {
    window.print();
  };

  const b = plan.budget_breakdown;
  const activeDay = activeTab > 0 ? plan.days[activeTab - 1] : null;

  return (
    <Paper
      elevation={0}
      className="printable-itinerary-card"
      sx={{
        borderRadius: 3.5,
        border: `1.5px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        p: { xs: 2, sm: 3 },
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0,0,0,0.4)'
            : '0 8px 30px rgba(0,0,0,0.06)',
      }}
    >
      {/* 1. Header & Actions */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.25, mb: 0.75 }}>
            {plan.trip_title}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 0.75 }}>
            <Chip
              size="small"
              icon={<LocationIcon sx={{ fontSize: '15px !important' }} />}
              label={plan.state_name}
              sx={{ fontWeight: 700, borderRadius: 1.5 }}
            />
            <Chip
              size="small"
              label={`🗓️ ${plan.total_days} Days`}
              sx={{ fontWeight: 700, borderRadius: 1.5 }}
            />
            <Chip
              size="small"
              label={`💰 Est. Total: ₹${formatCurrency(b.total_estimated_cost || plan.total_budget)} (Target: ₹${formatCurrency(plan.total_budget)})`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 800, borderRadius: 1.5 }}
            />
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap className="no-print">
          <Button
            size="small"
            variant={savedPlanId ? 'outlined' : 'contained'}
            color={savedPlanId ? 'success' : 'primary'}
            startIcon={savedPlanId ? <CheckIcon /> : <SaveIcon />}
            onClick={onSavePlan}
            disabled={saving}
            sx={{ borderRadius: 2, fontWeight: 700, px: 2 }}
          >
            {saving ? 'Saving...' : savedPlanId ? 'Saved' : 'Save Itinerary'}
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            title="Download or Print PDF"
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            PDF / Print
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<RestartIcon />}
            onClick={onResetPlan}
            title="Start New Plan"
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            New Plan
          </Button>
        </Stack>
      </Stack>

      {/* 2. Itemized Budget Distribution Bar */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.75,
          borderRadius: 2.5,
          backgroundColor:
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
          mb: 2.5,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={6} sm={3}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  p: 0.85,
                  borderRadius: 2,
                  bgcolor: 'rgba(59, 130, 246, 0.12)',
                  color: '#2563EB',
                  display: 'flex',
                }}
              >
                <HotelIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                  Stay & Hotel
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  ₹{formatCurrency(b.accommodation_estimate)}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  p: 0.85,
                  borderRadius: 2,
                  bgcolor: 'rgba(16, 185, 129, 0.12)',
                  color: '#059669',
                  display: 'flex',
                }}
              >
                <FoodIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                  Food & Dining
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  ₹{formatCurrency(b.food_estimate)}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  p: 0.85,
                  borderRadius: 2,
                  bgcolor: 'rgba(245, 158, 11, 0.12)',
                  color: '#D97706',
                  display: 'flex',
                }}
              >
                <TicketIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                  Entry Tickets
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  ₹{formatCurrency(b.activities_and_entry)}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  p: 0.85,
                  borderRadius: 2,
                  bgcolor: 'rgba(139, 92, 246, 0.12)',
                  color: '#7C3AED',
                  display: 'flex',
                }}
              >
                <TransportIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                  Local Transit
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  ₹{formatCurrency(b.local_transport_estimate)}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* 3. Navigation Tabs: Overview + Day 1..N */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5 }} className="no-print">
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 42,
            '& .MuiTabs-scroller': {
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiTab-root': {
              minHeight: 42,
              minWidth: 'auto',
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'none',
              borderRadius: '8px 8px 0 0',
              px: { xs: 1.5, sm: 2 },
              py: 0.75,
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            },
            '& .MuiTabs-scrollButtons': {
              width: 28,
              '&.Mui-disabled': { opacity: 0.2 },
            },
          }}
        >
          <Tab
            value={0}
            icon={<OverviewIcon sx={{ fontSize: '16px !important' }} />}
            iconPosition="start"
            label="Overview"
          />
          {plan.days.map((d) => (
            <Tab
              key={d.day_number}
              value={d.day_number}
              label={`Day ${d.day_number}: ${getShortDestName(d.destination_name)}`}
            />
          ))}
        </Tabs>
      </Box>

      {/* 4A. View: Overview (All Days Summary) */}
      {activeTab === 0 && (
        <Stack spacing={2.5}>
          {plan.days.map((d) => (
            <Card
              key={d.day_number}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor:
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                  Day {d.day_number}: {d.destination_name}
                </Typography>
                <Chip
                  size="small"
                  label={`Est. ₹${formatCurrency(d.day_budget)}`}
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
                {d.theme}
              </Typography>
              <Stack spacing={0.75}>
                {d.places.map((p, pIdx) => (
                  <Stack key={pIdx} direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 80, color: 'text.secondary' }}>
                      {p.recommended_time}:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {p.place_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      ({p.entry_fee && p.entry_fee > 0 ? `₹${formatCurrency(p.entry_fee)}` : 'Free'})
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      {/* 4B. View: Single Selected Day */}
      {activeTab > 0 && activeDay && (
        <Stack spacing={2.5}>
          {/* Destination Hub Banner */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2.5,
              bgcolor:
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                {activeDay.theme || `Day ${activeDay.day_number}`}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                📍 Destination Hub: <strong>{activeDay.destination_name}</strong>
              </Typography>
            </Box>
            <Chip
              label={`Est. Day Spend: ₹${formatCurrency(activeDay.day_budget)}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 800 }}
            />
          </Paper>

          {/* Attraction Cards for this Day */}
          <Stack spacing={1.5}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5 }}>
              VERIFIED ATTRACTIONS & VISITS
            </Typography>

            {activeDay.places.map((place) => {
              const timeBadge = getTimeBadgeColor(place.recommended_time);
              const feeAmount = typeof place.entry_fee === 'string' ? parseFloat(place.entry_fee) : place.entry_fee;
              const isFree = !feeAmount || Number.isNaN(feeAmount) || feeAmount <= 0;
              const catColor =
                designTokens.colors.categories[place.category] || theme.palette.primary.main;

              return (
                <Card
                  key={place.place_id || place.place_name}
                  variant="outlined"
                  sx={{
                    p: 2.25,
                    borderRadius: 2.5,
                    borderLeft: `5px solid ${catColor}`,
                    transition: 'box-shadow 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    },
                  }}
                >
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      flexWrap="wrap"
                      useFlexGap
                      sx={{ gap: 1 }}
                    >
                      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Chip
                          label={timeBadge.label}
                          size="small"
                          sx={{
                            backgroundColor: timeBadge.bg,
                            color: timeBadge.color,
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            height: 24,
                          }}
                        />
                        <Chip
                          label={(place.category || 'Sightseeing').toUpperCase()}
                          size="small"
                          sx={{
                            backgroundColor: `${catColor}15`,
                            color: catColor,
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            height: 24,
                          }}
                        />
                        {place.is_hidden_gem && (
                          <Chip
                            icon={<GemIcon sx={{ fontSize: '13px !important' }} />}
                            label="Hidden Gem"
                            size="small"
                            color="secondary"
                            sx={{ fontWeight: 800, fontSize: '0.7rem', height: 24 }}
                          />
                        )}
                      </Stack>

                      {/* Official Entry Ticket Badge */}
                      <Chip
                        icon={<TicketIcon sx={{ fontSize: '15px !important' }} />}
                        label={isFree ? 'Free Entry' : `Official Ticket: ₹${formatCurrency(feeAmount)} / person`}
                        color={isFree ? 'success' : 'default'}
                        variant={isFree ? 'filled' : 'outlined'}
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          height: 26,
                        }}
                      />
                    </Stack>

                    <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                      {place.place_name}
                    </Typography>

                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.55 }}>
                      {place.description}
                    </Typography>
                  </Stack>
                </Card>
              );
            })}
          </Stack>

          {/* Authentic Regional Culinary Recommendation */}
          {activeDay.meals && activeDay.meals.length > 0 && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2.5,
                backgroundColor:
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#FFFBEB',
                borderColor: '#FDE68A',
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: '#FEF3C7',
                    color: '#B45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FoodIcon fontSize="small" />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 800, display: 'block' }}>
                    RECOMMENDED LOCAL DINING & SPECIALTY
                  </Typography>
                  {activeDay.meals.map((m, mIdx) => (
                    <Typography key={mIdx} variant="subtitle2" sx={{ fontWeight: 800, color: '#78350F' }}>
                      {m.dish_name}{' '}
                      <Box component="span" sx={{ fontWeight: 600, fontSize: '0.78rem', color: '#B45309' }}>
                        ({m.meal_type || 'Lunch'} • {m.food_type === 'veg' ? '🥗 Vegetarian' : '🍗 Non-Veg'} • Avg ₹
                        {formatCurrency(m.avg_price)})
                      </Box>
                    </Typography>
                  ))}
                </Box>
              </Stack>
            </Paper>
          )}

          {/* Travel Tip for this Day */}
          {activeDay.travel_tips && (
            <Alert
              severity="info"
              icon={<TipIcon sx={{ color: theme.palette.primary.main }} />}
              sx={{
                borderRadius: 2.5,
                backgroundColor:
                  theme.palette.mode === 'dark' ? 'rgba(224, 93, 56, 0.08)' : 'rgba(224, 93, 56, 0.05)',
                border: `1px solid ${theme.palette.primary.main}30`,
                color: theme.palette.text.primary,
                py: 0.75,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, color: theme.palette.primary.main, display: 'block' }}>
                DAY TRAVEL TIP
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.84rem', lineHeight: 1.5 }}>
                {activeDay.travel_tips}
              </Typography>
            </Alert>
          )}
        </Stack>
      )}

      {/* 5. Advisory Footer Note */}
      {plan.overall_advice && (
        <Box sx={{ mt: 2.5, pt: 2, borderTop: `1px dashed ${theme.palette.divider}` }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}>
            💡 <strong>Travel Advisory:</strong> {plan.overall_advice}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
