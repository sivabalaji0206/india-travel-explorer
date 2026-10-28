import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  Diamond as GemIcon,
  LocationOn as LocationIcon,
  PaymentsOutlined as CostIcon,
  Restaurant as FoodIcon,
  Storefront as EateryIcon,
  WbSunnyOutlined as SeasonIcon,
} from '@mui/icons-material';
import { catalogueApi } from '../../api/catalogueApi';
import { PlaceDetail } from '../../api/types';
import { designTokens } from '../../theme/tokens';

interface PlaceDetailModalProps {
  placeId: number | null;
  open: boolean;
  onClose: () => void;
  onPlanTrip: (stateId: number) => void;
}

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

  const categoryColor = detail ? designTokens.colors.categories[detail.category] || theme.palette.primary.main : theme.palette.primary.main;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ pb: 1, pr: 6 }}>
        {detail && (
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip
                size="small"
                label={detail.category.replace('_', ' ').toUpperCase()}
                sx={{
                  backgroundColor: `${categoryColor}20`,
                  color: categoryColor,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                }}
              />
              <Chip
                size="small"
                label={`${detail.budget_level.toUpperCase()} BUDGET`}
                sx={{ fontSize: '0.7rem', fontWeight: 600 }}
              />
              {detail.is_hidden_gem && (
                <Chip
                  size="small"
                  icon={<GemIcon sx={{ fontSize: '13px !important' }} />}
                  label="Hidden Gem"
                  color="secondary"
                  sx={{ fontSize: '0.7rem', fontWeight: 700 }}
                />
              )}
            </Stack>

            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {detail.name}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: theme.palette.text.secondary }}>
              <LocationIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {detail.destination_name}, {detail.state_name}
              </Typography>
            </Stack>
          </Stack>
        )}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12, color: theme.palette.text.secondary }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
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
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Entry Fee
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {detail.entry_fee === null
                      ? 'N/A'
                      : detail.entry_fee === 0
                      ? 'Free'
                      : `₹${detail.entry_fee}`}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Avg Daily Cost
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    ₹{detail.avg_daily_cost}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Best Season
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                    {detail.best_season.replace('_', ' ')}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Local Delicacies
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {detail.nearby_foods.length} items
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Description */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
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
                  label={`Destination Budget Tiers (${detail.cost_tiers.length})`}
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
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                  {food.name}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={food.food_type.toUpperCase()}
                                  color={food.food_type === 'veg' ? 'success' : 'warning'}
                                  sx={{ fontSize: '0.65rem', height: 20 }}
                                />
                              </Stack>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                                {food.description || 'Authentic regional culinary specialty.'}
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
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
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
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
                                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                              }}
                            />
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Stack>
              )}

              {/* Tab 2: Cost Tiers */}
              {activeTab === 2 && (
                <Box>
                  {detail.cost_tiers.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', py: 2 }}>
                      Cost tier estimates are being compiled for this destination.
                    </Typography>
                  ) : (
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F8FAFC' }}>
                            <TableCell sx={{ fontWeight: 700 }}>Budget Tier</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Hotel / Day</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Food / Day</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Local Transport</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Daily Range</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {detail.cost_tiers.map((tier) => (
                            <TableRow key={tier.id}>
                              <TableCell sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
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
                              <TableCell align="right" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
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

