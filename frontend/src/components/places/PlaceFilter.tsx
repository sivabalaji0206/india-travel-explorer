import React from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Diamond as GemIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { PlaceCategory, Season, State } from '../../api/types';
import { designTokens } from '../../theme/tokens';

const CATEGORIES: { label: string; value: PlaceCategory }[] = [
  { label: 'Beach', value: 'beach' },
  { label: 'Hill Station', value: 'hill_station' },
  { label: 'Temple', value: 'temple' },
  { label: 'Wildlife', value: 'wildlife' },
  { label: 'Heritage', value: 'heritage' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'City', value: 'city' },
  { label: 'Nature', value: 'nature' },
];

const SEASONS: { label: string; value: Season }[] = [
  { label: 'Winter (Oct - Mar)', value: 'winter' },
  { label: 'Summer (Apr - Jun)', value: 'summer' },
  { label: 'Monsoon (Jul - Sep)', value: 'monsoon' },
  { label: 'All Year', value: 'all_year' },
];

const BUDGET_TIERS = [
  { label: 'All Budgets', value: '' },
  { label: 'Budget Friendly (Low)', value: 'low' },
  { label: 'Moderate (Medium)', value: 'medium' },
  { label: 'Luxury (High)', value: 'high' },
];

interface PlaceFilterProps {
  states: State[];
  selectedStateId: number | '';
  onSelectState: (stateId: number | '') => void;
  selectedCategory: PlaceCategory | '';
  onSelectCategory: (category: PlaceCategory | '') => void;
  selectedBudget: string;
  onSelectBudget: (tier: string) => void;
  selectedSeason: Season | '';
  onSelectSeason: (season: Season | '') => void;
  search: string;
  onSearchChange: (search: string) => void;
  hiddenGemOnly: boolean;
  onToggleHiddenGem: (checked: boolean) => void;
  onReset: () => void;
}

export const PlaceFilter: React.FC<PlaceFilterProps> = ({
  states,
  selectedStateId,
  onSelectState,
  selectedCategory,
  onSelectCategory,
  selectedBudget,
  onSelectBudget,
  selectedSeason,
  onSelectSeason,
  search,
  onSearchChange,
  hiddenGemOnly,
  onToggleHiddenGem,
  onReset,
}) => {
  const theme = useTheme();

  const hasActiveFilters =
    selectedStateId !== '' ||
    selectedCategory !== '' ||
    selectedBudget !== '' ||
    selectedSeason !== '' ||
    search !== '' ||
    hiddenGemOnly;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 4,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <FilterIcon sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Filter Attractions
          </Typography>
        </Stack>
        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={onReset}
            color="inherit"
            sx={{ textTransform: 'none', color: theme.palette.text.secondary }}
          >
            Reset Filters
          </Button>
        )}
      </Stack>

      <Stack spacing={2.5}>
        {/* Row 1: Search & Dropdowns */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            size="small"
            placeholder="Search attractions by name or keyword..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 220 } }}>
            <InputLabel id="state-select-label">Select State</InputLabel>
            <Select
              labelId="state-select-label"
              value={selectedStateId}
              label="Select State"
              onChange={(e) => onSelectState(e.target.value as number | '')}
            >
              <MenuItem value="">
                <em>All India (All States)</em>
              </MenuItem>
              {states.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name} ({s.place_count})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 } }}>
            <InputLabel id="budget-select-label">Budget Tier</InputLabel>
            <Select
              labelId="budget-select-label"
              value={selectedBudget}
              label="Budget Tier"
              onChange={(e) => onSelectBudget(e.target.value)}
            >
              {BUDGET_TIERS.map((b) => (
                <MenuItem key={b.value} value={b.value}>
                  {b.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 } }}>
            <InputLabel id="season-select-label">Best Season</InputLabel>
            <Select
              labelId="season-select-label"
              value={selectedSeason}
              label="Best Season"
              onChange={(e) => onSelectSeason(e.target.value as Season | '')}
            >
              <MenuItem value="">
                <em>Any Season</em>
              </MenuItem>
              {SEASONS.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Row 2: Category chips and Hidden Gem toggle */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={2}
        >
          {/* Category Chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 0.75 }}>
            <Chip
              label="All Categories"
              size="small"
              onClick={() => onSelectCategory('')}
              color={selectedCategory === '' ? 'primary' : 'default'}
              variant={selectedCategory === '' ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600 }}
            />
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.value;
              const catColor = designTokens.colors.categories[cat.value];
              return (
                <Chip
                  key={cat.value}
                  label={cat.label}
                  size="small"
                  onClick={() => onSelectCategory(isSelected ? '' : cat.value)}
                  sx={{
                    fontWeight: 600,
                    borderColor: isSelected ? catColor : undefined,
                    backgroundColor: isSelected ? `${catColor}20` : undefined,
                    color: isSelected ? catColor : undefined,
                  }}
                  variant={isSelected ? 'filled' : 'outlined'}
                />
              );
            })}
          </Stack>

          {/* Hidden Gem Switch */}
          <FormControlLabel
            control={
              <Switch
                checked={hiddenGemOnly}
                onChange={(e) => onToggleHiddenGem(e.target.checked)}
                color="secondary"
              />
            }
            label={
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <GemIcon sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Hidden Gems Only
                </Typography>
              </Stack>
            }
          />
        </Stack>
      </Stack>
    </Paper>
  );
};

