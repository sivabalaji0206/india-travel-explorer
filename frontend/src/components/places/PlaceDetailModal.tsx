import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CardMedia,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome as PlannerIcon,
  Close as CloseIcon,
  ConfirmationNumberOutlined as TicketIcon,
  Diamond as GemIcon,
  LocationOn as LocationIcon,
  PaymentsOutlined as CostIcon,
  Restaurant as FoodIcon,
  Storefront as EateryIcon,
  WbSunnyOutlined as SeasonIcon,
} from '@mui/icons-material';
import { catalogueApi } from '../../api/catalogueApi';
import type { PlaceDetail } from '../../api/types';
import { designTokens } from '../../theme/tokens';
import { PlaceMiniMap } from '../map/PlaceMiniMap';

interface PlaceDetailModalProps {
  placeId: number | null;
  open: boolean;
  onClose: () => void;
  onPlanTrip: (stateId: number) => void;
}

const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
  temple: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=85',
  heritage: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=85',
  wildlife: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=85',
  hill_station: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
  nature: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1200&q=85',
  adventure: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
  city: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=85',
};

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

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  placeId,
  open,
  onClose,
  onPlanTrip,
}) => {
  const theme = useTheme();
  const [detail, setDetail] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !placeId) {
      setDetail(null);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await catalogueApi.getPlaceDetail(placeId);
        setDetail(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load attraction details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [open, placeId]);

  if (!open) return null;

  const categoryColor = detail
    ? designTokens.colors.categories[detail.category] || theme.palette.primary.main
    : theme.palette.primary.main;

  const imageUrl = detail
    ? detail.image_url || FALLBACK_CATEGORY_IMAGES[detail.category] || FALLBACK_CATEGORY_IMAGES.nature
    : FALLBACK_CATEGORY_IMAGES.nature;

  const feeAmount =
    detail?.entry_fee !== null && detail?.entry_fee !== undefined ? Number(detail.entry_fee) : 0;
  const hasTicket = !Number.isNaN(feeAmount) && feeAmount > 0;
  const isFree = !hasTicket;
  const feeLabel = hasTicket ? `₹${Math.round(feeAmount)} / person` : 'Free Entry';
  const visitCostLabel = detail ? `₹${Math.round(Number(detail.avg_daily_cost || 200))}` : '₹200';
  const categoryEmoji = detail ? CATEGORY_EMOJIS[detail.category] || '📍' : '📍';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 4,
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)',
        },
      }}
    >
      {/* Top Header Bar */}
      <Box sx={{ p: { xs: 2, sm: 3 }, pb: 2, borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ pr: 2 }}>
            {detail && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
                <Chip
                  size="small"
                  label={`${categoryEmoji} ${detail.category.replace('_', ' ').toUpperCase()}`}
                  sx={{
                    backgroundColor: '#F1F5F9',
                    color: '#1E293B',
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    border: '1px solid #E2E8F0',
                  }}
                />
                {detail.is_hidden_gem && (
                  <Chip
                    size="small"
                    icon={<GemIcon sx={{ fontSize: '13px !important', color: '#0EA5E9 !important' }} />}
                    label="Hidden Gem"
                    sx={{
                      backgroundColor: 'rgba(14, 165, 233, 0.1)',
                      color: '#0284C7',
                      fontWeight: 800,
                      fontSize: '0.7rem',
                      border: '1px solid rgba(14, 165, 233, 0.3)',
                    }}
                  />
                )}
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <LocationIcon sx={{ fontSize: 16, color: '#1E7D5C' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#64748B' }}>
                    {detail.destination_name}, {detail.state_name}
                  </Typography>
                </Stack>
              </Stack>
            )}

            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: '#1E293B',
                fontSize: { xs: '1.4rem', sm: '1.85rem' },
                lineHeight: 1.2,
              }}
            >
              {detail ? detail.name : 'Loading Landmark...'}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            sx={{
              backgroundColor: '#F1F5F9',
              color: '#64748B',
              '&:hover': { backgroundColor: '#E2E8F0', color: '#0F172A' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {detail && !loading && (
          <Stack spacing={3}>
            {/* Visual Media Showcase: Side-by-Side Landmark Photography & Live MiniMap */}
            <Grid container spacing={2.5} alignItems="stretch">
              {/* Photo Showcase (Left 58%) */}
              <Grid item xs={12} md={7}>
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: 220, sm: 320 },
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#0F172A',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <CardMedia
                    component="img"
                    height="320"
                    image={imageUrl}
                    alt={detail.name}
                    referrerPolicy="no-referrer"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        FALLBACK_CATEGORY_IMAGES[detail.category] || FALLBACK_CATEGORY_IMAGES.nature;
                    }}
                    sx={{
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 1.5,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, transparent 100%)',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.75rem' }}>
                      📸 Verified Destination Visuals • {detail.name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Geographic Live MiniMap (Right 42%) */}
              <Grid item xs={12} md={5}>
                {detail.latitude != null && detail.longitude != null ? (
                  <PlaceMiniMap
                    lat={Number(detail.latitude)}
                    lng={Number(detail.longitude)}
                    placeName={detail.name}
                    category={detail.category}
                    destinationName={detail.destination_name}
                    height={320}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 320,
                      borderRadius: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 3,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                      textAlign: 'center',
                    }}
                  >
                    <LocationIcon sx={{ fontSize: 36, color: '#94A3B8', mb: 1 }} />
                    <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                      Precise geo-coordinates for {detail.destination_name} are calibrated in the state circuit.
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>

            {/* Quick Metrics Bar */}
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 2.5,
                    backgroundColor: '#F8FAFC',
                    borderColor: '#E2E8F0',
                  }}
                >
                  <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.6} sx={{ mb: 0.5 }}>
                    <TicketIcon sx={{ fontSize: 16, color: isFree ? '#10B981' : '#1E7D5C' }} />
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                      Entry Ticket
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: isFree ? '#059669' : '#1E293B', fontSize: '1.05rem' }}>
                    {feeLabel}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 2.5,
                    backgroundColor: '#F8FAFC',
                    borderColor: '#E2E8F0',
                  }}
                >
                  <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.6} sx={{ mb: 0.5 }}>
                    <CostIcon sx={{ fontSize: 16, color: '#1E7D5C' }} />
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                      Est. Visit Cost
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#1E7D5C', fontSize: '1.05rem' }}>
                    {visitCostLabel}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 2.5,
                    backgroundColor: '#F8FAFC',
                    borderColor: '#E2E8F0',
                  }}
                >
                  <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.6} sx={{ mb: 0.5 }}>
                    <SeasonIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                      Best Season
                    </Typography>
                  </Stack>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#1E293B', textTransform: 'capitalize' }}>
                    {detail.best_season.replace('_', ' ')}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 2.5,
                    backgroundColor: '#F8FAFC',
                    borderColor: '#E2E8F0',
                  }}
                >
                  <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.6} sx={{ mb: 0.5 }}>
                    <FoodIcon sx={{ fontSize: 16, color: '#E11D48' }} />
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                      Local Cuisine
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#1E293B', fontSize: '1.05rem' }}>
                    {detail.nearby_foods.length} Dishes
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* About Attraction Narrative */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.6 }}>
                About the Attraction
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {detail.description || 'Verified heritage and cultural destination in India.'}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: '#E2E8F0' }} />

            {/* Authentic Regional Culinary & Eateries Showcase (Cost Tiers Table Removed) */}
            <Box>
              <Stack spacing={2.5}>
                {detail.nearby_foods.length === 0 && detail.nearby_eateries.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#64748B', py: 2 }}>
                    No specific local food records associated with this destination yet.
                  </Typography>
                ) : (
                  <>
                    {/* Food Cards */}
                    {detail.nearby_foods.length > 0 && (
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.8 }}>
                          <FoodIcon sx={{ fontSize: 20, color: '#1E7D5C' }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E293B' }}>
                            Local Food & Culinary Specialties ({detail.nearby_foods.length})
                          </Typography>
                        </Stack>

                        <Grid container spacing={2}>
                          {detail.nearby_foods.map((food) => {
                            const isVeg = food.food_type.toLowerCase() === 'veg';
                            const isVegan = food.food_type.toLowerCase() === 'vegan';
                            return (
                              <Grid item xs={12} sm={6} key={food.id}>
                                <Paper
                                  variant="outlined"
                                  sx={{
                                    p: 2,
                                    borderRadius: 2.5,
                                    borderColor: '#E2E8F0',
                                    backgroundColor: '#F8FAFC',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <Box>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E293B', fontSize: '0.92rem' }}>
                                        {food.name}
                                      </Typography>
                                      <Chip
                                        size="small"
                                        label={food.food_type.toUpperCase()}
                                        sx={{
                                          fontSize: '0.66rem',
                                          height: 20,
                                          fontWeight: 800,
                                          backgroundColor: isVeg ? '#DCFCE7' : isVegan ? '#FEF3C7' : '#FFE4E6',
                                          color: isVeg ? '#15803D' : isVegan ? '#B45309' : '#BE123C',
                                        }}
                                      />
                                    </Stack>
                                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.2, lineHeight: 1.45 }}>
                                      {food.description || 'Authentic regional culinary specialty.'}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E7D5C', fontSize: '0.8rem' }}>
                                    Avg. Price: ₹{Math.round(Number(food.avg_price || 150))}
                                  </Typography>
                                </Paper>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                    )}

                    {/* Eateries */}
                    {detail.nearby_eateries.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.8 }}>
                          <EateryIcon sx={{ fontSize: 20, color: '#1E7D5C' }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E293B' }}>
                            Recommended Local Eateries ({detail.nearby_eateries.length})
                          </Typography>
                        </Stack>

                        <Grid container spacing={2}>
                          {detail.nearby_eateries.map((eatery) => (
                            <Grid item xs={12} sm={6} key={eatery.id}>
                              <Paper
                                variant="outlined"
                                sx={{
                                  p: 2,
                                  borderRadius: 2.5,
                                  borderColor: '#E2E8F0',
                                  backgroundColor: '#FFFFFF',
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                  <EateryIcon sx={{ fontSize: 18, color: '#1E7D5C' }} />
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E293B' }}>
                                    {eatery.name}
                                  </Typography>
                                </Stack>
                                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.8 }}>
                                  Area: {eatery.area || detail.destination_name}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={eatery.meal_type}
                                  sx={{
                                    fontSize: '0.66rem',
                                    height: 20,
                                    fontWeight: 700,
                                    backgroundColor: '#F1F5F9',
                                    color: '#475569',
                                  }}
                                />
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </>
                )}
              </Stack>
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, px: 3, justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#64748B',
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { color: '#0F172A', backgroundColor: '#E2E8F0' },
          }}
        >
          Close
        </Button>
        {detail && (
          <Button
            variant="contained"
            startIcon={<PlannerIcon />}
            onClick={() => {
              onClose();
              onPlanTrip(detail.state_id);
            }}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 800,
              fontSize: '0.88rem',
              backgroundColor: '#1E7D5C',
              color: '#FFFFFF',
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(30, 125, 92, 0.25)',
              '&:hover': {
                backgroundColor: '#176449',
                boxShadow: '0 4px 12px rgba(30, 125, 92, 0.35)',
              },
            }}
          >
            Plan AI Trip to {detail.state_name}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
