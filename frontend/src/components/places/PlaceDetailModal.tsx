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
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
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

interface PlaceDetailModalProps {
  placeId: number | null;
  open: boolean;
  onClose: () => void;
  onPlanTrip: (stateId: number) => void;
}

const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
  beach: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85',
  temple: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=85',
  heritage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=85',
  wildlife: 'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=1200&q=85',
  hill_station: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=85',
  nature: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=1200&q=85',
  adventure: 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=1200&q=85',
  city: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=85',
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
  const [activeTab, setActiveTab] = useState<number>(0);

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

  const isFree =
    detail?.entry_fee === 0 ||
    (detail?.entry_fee === null && (detail?.category === 'beach' || detail?.category === 'temple'));
  const feeLabel = isFree ? 'Free Entry' : detail?.entry_fee ? `₹${detail.entry_fee}` : 'Open Entry';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      {/* Top Visual Image Banner */}
      {detail && (
        <Box sx={{ position: 'relative', height: { xs: 200, sm: 260 }, overflow: 'hidden' }}>
          <CardMedia
            component="img"
            height="260"
            image={imageUrl}
            alt={detail.name}
            sx={{ objectFit: 'cover' }}
          />

          {/* Dark Gradient Overlay */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)',
            }}
          />

          {/* Close Icon Button on Top-Right */}
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 14,
              top: 14,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {/* Floating Category and Hidden Gem Chips */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ position: 'absolute', top: 16, left: 16 }}
          >
            <Chip
              size="small"
              label={detail.category.replace('_', ' ').toUpperCase()}
              sx={{
                backgroundColor: categoryColor,
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.72rem',
              }}
            />
            {detail.is_hidden_gem && (
              <Chip
                size="small"
                icon={<GemIcon sx={{ fontSize: '13px !important', color: '#fff !important' }} />}
                label="Hidden Gem"
                color="secondary"
                sx={{ fontSize: '0.7rem', fontWeight: 800 }}
              />
            )}
          </Stack>

          {/* Place Title & Location Overlaid on Banner Bottom */}
          <Box sx={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: '#fff',
                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              {detail.name}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={0.6}>
              <LocationIcon sx={{ fontSize: 18, color: '#FDBA74' }} />
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: '#fff',
                  textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                }}
              >
                {detail.destination_name}, {detail.state_name}
              </Typography>
            </Stack>
          </Box>
        </Box>
      )}

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
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
            {/* Quick Metrics Bar */}
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                    <TicketIcon sx={{ fontSize: 16, color: isFree ? '#10B981' : theme.palette.primary.main }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      Entry Ticket
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: isFree ? '#10B981' : 'inherit' }}>
                    {feeLabel}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                    <CostIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      Est. Visit Cost
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                    ₹{detail.avg_daily_cost}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                    <SeasonIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      Best Season
                    </Typography>
                  </Stack>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'capitalize' }}>
                    {detail.best_season.replace('_', ' ')}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                    <FoodIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      Local Foods
                    </Typography>
                  </Stack>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {detail.nearby_foods.length} items
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Description */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                About the Attraction
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                {detail.description || 'Verified heritage and cultural destination in India.'}
              </Typography>
            </Box>

            <Divider />

            {/* Tabs for Foods, Eateries, and Cost Tiers */}
            <Box>
              <Tabs
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 2 }}
              >
                <Tab
                  icon={<FoodIcon sx={{ fontSize: 18 }} />}
                  iconPosition="start"
                  label={`Local Food & Specialties (${detail.nearby_foods.length})`}
                />
                <Tab
                  icon={<EateryIcon sx={{ fontSize: 18 }} />}
                  iconPosition="start"
                  label={`Recommended Eateries (${detail.nearby_eateries.length})`}
                />
                <Tab
                  icon={<CostIcon sx={{ fontSize: 18 }} />}
                  iconPosition="start"
                  label={`Destination Cost Tiers (${detail.cost_tiers.length})`}
                />
              </Tabs>

              {/* Tab 0: Foods */}
              {activeTab === 0 && (
                <Stack spacing={1.5}>
                  {detail.nearby_foods.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
                      No specific local food records associated with this destination yet.
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {detail.nearby_foods.map((food) => (
                        <Grid item xs={12} sm={6} key={food.id}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Box>
                              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                  {food.name}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={food.food_type.toUpperCase()}
                                  color={food.food_type === 'veg' ? 'success' : 'warning'}
                                  sx={{ fontSize: '0.65rem', height: 20, fontWeight: 700 }}
                                />
                              </Stack>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                                {food.description || 'Authentic regional culinary specialty.'}
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                              Avg. Price: ₹{food.avg_price}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Stack>
              )}

              {/* Tab 1: Eateries */}
              {activeTab === 1 && (
                <Stack spacing={1.5}>
                  {detail.nearby_eateries.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
                      No eatery records found for this immediate destination.
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {detail.nearby_eateries.map((eatery) => (
                        <Grid item xs={12} sm={6} key={eatery.id}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: 2,
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {eatery.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                              Area: {eatery.area || detail.destination_name}
                            </Typography>
                            <Chip
                              size="small"
                              label={eatery.meal_type}
                              sx={{
                                fontSize: '0.65rem',
                                height: 20,
                                fontWeight: 700,
                                backgroundColor:
                                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                              }}
                            />
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Stack>
              )}

              {/* Tab 2: Destination Cost Tiers */}
              {activeTab === 2 && (
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                    * Overall daily accommodation, food, and local transportation estimates for staying in {detail.destination_name}.
                  </Typography>
                  {detail.cost_tiers.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
                      Cost tier estimates are being compiled for this destination.
                    </Typography>
                  ) : (
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow
                            sx={{
                              backgroundColor:
                                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                            }}
                          >
                            <TableCell sx={{ fontWeight: 700 }}>Budget Tier</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Hotel / Night</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Dining / Day</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Local Transport</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Total Daily Living</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {detail.cost_tiers.map((tier) => (
                            <TableRow key={tier.id}>
                              <TableCell sx={{ fontWeight: 800, textTransform: 'capitalize' }}>
                                {tier.tier}
                              </TableCell>
                              <TableCell align="right">
                                ₹{tier.accommodation_min} - ₹{tier.accommodation_max}
                              </TableCell>
                              <TableCell align="right">
                                ₹{tier.food_min} - ₹{tier.food_max}
                              </TableCell>
                              <TableCell align="right">
                                ₹{tier.local_transport_min} - ₹{tier.local_transport_max}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                                ₹{tier.total_daily_min} - ₹{tier.total_daily_max}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        {detail && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlannerIcon />}
            onClick={() => {
              onClose();
              onPlanTrip(detail.state_id);
            }}
            sx={{ px: 3, borderRadius: 2 }}
          >
            Plan Trip to {detail.state_name}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
