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
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Snackbar,
  Stack,
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
  Tune as TuneIcon,
} from '@mui/icons-material';
import { plannerApi } from '../../api/plannerApi';
import { plansApi } from '../../api/plansApi';
import {
  BudgetLevel,
  FoodType,
  PlaceCategory,
  State,
  TripPlanRequest,
  TripPlanResponse,
} from '../../api/types';
import { useAuth } from '../../context/AuthContext';
import { designTokens } from '../../theme/tokens';
import { BudgetCard } from './BudgetCard';
import { ChatWidget } from './ChatWidget';
import { ItineraryView } from './ItineraryView';

interface PlannerModalProps {
  open: boolean;
  onClose: () => void;
  initialStateId?: number | null;
  states: State[];
  onOpenAuth: () => void;
}

const CATEGORY_INTERESTS: { label: string; value: PlaceCategory }[] = [
  { label: 'Heritage & Forts', value: 'heritage' },
  { label: 'Temples & Sacred', value: 'temple' },
  { label: 'Nature & Waterfalls', value: 'nature' },
  { label: 'Hill Stations', value: 'hill_station' },
  { label: 'Beaches & Coast', value: 'beach' },
  { label: 'Wildlife Sanctuaries', value: 'wildlife' },
  { label: 'Adventure & Treks', value: 'adventure' },
  { label: 'City & Culture', value: 'city' },
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const PlannerModal: React.FC<PlannerModalProps> = ({
  open,
  onClose,
  initialStateId,
  states,
  onOpenAuth,
}) => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();

  // Form states
  const [stateId, setStateId] = useState<number>(initialStateId || (states[0]?.id ?? 1));
  const [durationDays, setDurationDays] = useState<number>(3);
  const [totalBudget, setTotalBudget] = useState<number>(15000);
  const [budgetTier, setBudgetTier] = useState<BudgetLevel>('medium');
  const [foodPreference, setFoodPreference] = useState<FoodType>('veg');
  const [travelMonth, setTravelMonth] = useState<string>('November');
  const [interests, setInterests] = useState<PlaceCategory[]>(['heritage', 'nature']);

  // UI Flow states
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<TripPlanResponse | null>(null);
  const [savedPlanId, setSavedPlanId] = useState<number | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialStateId) {
      setStateId(initialStateId);
    } else if (states.length > 0 && !stateId) {
      setStateId(states[0].id);
    }
  }, [initialStateId, states]);

  const toggleInterest = (category: PlaceCategory) => {
    setInterests((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);

    const payload: TripPlanRequest = {
      state_id: Number(stateId),
      duration_days: durationDays,
      total_budget: totalBudget,
      budget_tier: budgetTier,
      food_preference: foodPreference,
      travel_month: travelMonth,
      interests: interests.length > 0 ? interests : undefined,
    };

    try {
      const generated = await plannerApi.generatePlan(payload);
      setPlan(generated);
      setIsGenerated(true);
      setSavedPlanId(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to generate trip plan. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    if (!plan) return;

    setSaving(true);
    try {
      const saved = await plansApi.savePlan({
        state_id: plan.state_id,
        title: plan.trip_title,
        preferences: {
          duration_days: durationDays,
          budget_tier: budgetTier,
          food_preference: foodPreference,
        },
        plan_json: plan,
      });
      setSavedPlanId(saved.id);
      setToastMessage('Itinerary successfully saved to My Plans!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setToastMessage(`Failed to save: ${err.message}`);
      } else {
        setToastMessage('Failed to save itinerary.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleResetToForm = () => {
    setIsGenerated(false);
    setError(null);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
      {/* Modal Header */}
      <DialogTitle sx={{ pb: 1.5, pr: 6 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                backgroundColor: theme.palette.primary.main,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AiIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {isGenerated && plan ? plan.trip_title : 'AI Trip Planner'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {isGenerated && plan
                  ? `${plan.state_name} • ${plan.total_days} Days • ₹${plan.total_budget.toLocaleString()} Target`
                  : 'RAG Grounded with PostgreSQL Tourism Dataset'}
              </Typography>
            </Box>
          </Stack>
        </Stack>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12, color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* VIEW 1: Input Form */}
        {!isGenerated && (
          <Stack spacing={3}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Configure your preferences. Our RAG engine queries verified destinations, entry ticket
              costs, daily expense tiers, and authentic dishes to synthesize a fully grounded itinerary.
            </Typography>

            <Grid container spacing={3}>
              {/* Destination State */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="medium">
                  <InputLabel id="select-state-label">Select Destination State</InputLabel>
                  <Select
                    labelId="select-state-label"
                    value={stateId}
                    label="Select Destination State"
                    onChange={(e) => setStateId(Number(e.target.value))}
                  >
                    {states.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.name} ({s.place_count} places)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Travel Month */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="medium">
                  <InputLabel id="select-month-label">Travel Month</InputLabel>
                  <Select
                    labelId="select-month-label"
                    value={travelMonth}
                    label="Travel Month"
                    onChange={(e) => setTravelMonth(e.target.value)}
                  >
                    {MONTHS.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Duration Slider */}
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Trip Duration
                    </Typography>
                    <Chip
                      label={`${durationDays} Days`}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 800 }}
                    />
                  </Stack>
                  <Slider
                    value={durationDays}
                    min={1}
                    max={15}
                    step={1}
                    marks={[
                      { value: 1, label: '1d' },
                      { value: 3, label: '3d' },
                      { value: 7, label: '7d' },
                      { value: 10, label: '10d' },
                      { value: 15, label: '15d' },
                    ]}
                    onChange={(_, val) => setDurationDays(val as number)}
                    valueLabelDisplay="auto"
                  />
                </Paper>
              </Grid>

              {/* Total Budget */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Travel Budget"
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Math.max(1000, Number(e.target.value)))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  helperText="Total target budget for activities, stay, transport & food"
                />
              </Grid>

              {/* Comfort Tier */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="select-tier-label">Comfort / Budget Tier</InputLabel>
                  <Select
                    labelId="select-tier-label"
                    value={budgetTier}
                    label="Comfort / Budget Tier"
                    onChange={(e) => setBudgetTier(e.target.value as BudgetLevel)}
                  >
                    <MenuItem value="low">Budget / Backpacker (Hostels & Public Transport)</MenuItem>
                    <MenuItem value="medium">Standard / Comfort (3-Star Hotels, Cabs)</MenuItem>
                    <MenuItem value="high">Luxury / Premium (Resorts, Chauffeur)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Food Preference */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="select-food-label">Food Preference</InputLabel>
                  <Select
                    labelId="select-food-label"
                    value={foodPreference}
                    label="Food Preference"
                    onChange={(e) => setFoodPreference(e.target.value as FoodType)}
                  >
                    <MenuItem value="veg">Vegetarian</MenuItem>
                    <MenuItem value="non_veg">Non-Vegetarian / All-inclusive</MenuItem>
                    <MenuItem value="vegan">Pure Vegan / Plant-Based</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Travel Interests (Multi-select Chips) */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Primary Interests & Themes
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                  {CATEGORY_INTERESTS.map((item) => {
                    const isSelected = interests.includes(item.value);
                    const color = designTokens.colors.categories[item.value];
                    return (
                      <Chip
                        key={item.value}
                        label={item.label}
                        onClick={() => toggleInterest(item.value)}
                        variant={isSelected ? 'filled' : 'outlined'}
                        sx={{
                          fontWeight: 600,
                          cursor: 'pointer',
                          borderColor: isSelected ? color : undefined,
                          backgroundColor: isSelected ? `${color}25` : undefined,
                          color: isSelected ? color : undefined,
                        }}
                      />
                    );
                  })}
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        )}

        {/* VIEW 2: Generated Plan Display */}
        {isGenerated && plan && (
          <Stack spacing={3}>
            {/* Action Bar for Plan */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1}
            >
              <Button
                startIcon={<TuneIcon />}
                onClick={handleResetToForm}
                variant="outlined"
                color="inherit"
                size="small"
              >
                Change Preferences
              </Button>

              <Stack direction="row" spacing={1}>
                <Button
                  startIcon={savedPlanId ? <CheckIcon /> : <SaveIcon />}
                  onClick={handleSavePlan}
                  variant={savedPlanId ? 'outlined' : 'contained'}
                  color={savedPlanId ? 'success' : 'primary'}
                  disabled={saving}
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  {saving ? 'Saving...' : savedPlanId ? 'Saved to My Plans' : 'Save Itinerary'}
                </Button>
              </Stack>
            </Stack>

            {/* Itemized Budget Breakdown Card */}
            <BudgetCard
              breakdown={plan.budget_breakdown}
              targetBudget={plan.total_budget}
              totalDays={plan.total_days}
            />

            {/* Layout: Day-by-Day Itinerary (Left/Main) & Conversational Assistant (Right/Side) */}
            <Grid container spacing={3}>
              <Grid item xs={12} lg={7}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Day-by-Day Grounded Schedule
                </Typography>
                <ItineraryView days={plan.days} overallAdvice={plan.overall_advice} />
              </Grid>

              <Grid item xs={12} lg={5}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Refine Itinerary with AI
                </Typography>
                <ChatWidget
                  stateId={plan.state_id}
                  currentPlan={plan}
                  planId={savedPlanId}
                  onPlanUpdated={(newPlan) => setPlan(newPlan)}
                />
              </Grid>
            </Grid>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>

        {!isGenerated ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AiIcon />}
            onClick={handleGenerate}
            disabled={loading}
            sx={{
              px: 4,
              borderRadius: 2.5,
              fontWeight: 700,
              boxShadow: '0 6px 18px rgba(224, 93, 56, 0.35)',
            }}
          >
            {loading ? 'Synthesizing Itinerary...' : 'Generate Grounded Itinerary'}
          </Button>
        ) : (
          <Button
            variant="outlined"
            onClick={handleResetToForm}
            startIcon={<BackIcon />}
          >
            Create Another Plan
          </Button>
        )}
      </DialogActions>

      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
      />
    </Dialog>
  );
};

