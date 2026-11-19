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

const CATEGORIES: { label: string; value: PlaceCategory; emoji: string }[] = [
  { label: 'Beach', value: 'beach', emoji: '🏖️' },
  { label: 'Hill Station', value: 'hill_station', emoji: '⛰️' },
  { label: 'Temple', value: 'temple', emoji: '🛕' },
  { label: 'Wildlife', value: 'wildlife', emoji: '🐅' },
  { label: 'Heritage', value: 'heritage', emoji: '🏛️' },
  { label: 'Adventure', value: 'adventure', emoji: '🧭' },
  { label: 'City', value: 'city', emoji: '🏙️' },
  { label: 'Nature', value: 'nature', emoji: '🌿' },
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
        p: { xs: 2.5, md: 3 },
        mb: 4,
        borderRadius: 3.5,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <FilterIcon sx={{ color: '#1E7D5C', fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#1E293B' }}>
            Filter Attractions
          </Typography>
        </Stack>
        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<ClearIcon fontSize="small" />}
            onClick={onReset}
            color="inherit"
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: '#64748B',
              backgroundColor: '#F1F5F9',
              borderRadius: 2,
              px: 1.5,
              '&:hover': { backgroundColor: '#E2E8F0', color: '#0F172A' },
            }}
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
                  <SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2.5,
                backgroundColor: '#F8FAFC',
                '& fieldset': { borderColor: '#E2E8F0' },
                '&:hover fieldset': { borderColor: '#CBD5E1' },
              },
            }}
          />

          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 220 } }}>
            <InputLabel id="state-select-label">Select State</InputLabel>
            <Select
              labelId="state-select-label"
              value={selectedStateId}
              label="Select State"
              onChange={(e) => onSelectState(e.target.value as number | '')}
              sx={{
                borderRadius: 2.5,
                backgroundColor: '#F8FAFC',
                '& fieldset': { borderColor: '#E2E8F0' },
              }}
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
              sx={{
                borderRadius: 2.5,
                backgroundColor: '#F8FAFC',
                '& fieldset': { borderColor: '#E2E8F0' },
              }}
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
              sx={{
                borderRadius: 2.5,
                backgroundColor: '#F8FAFC',
                '& fieldset': { borderColor: '#E2E8F0' },
              }}
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
          {/* Category Chips with Icons */}
          <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ gap: 0.8 }}>
            <Chip
              label="✨ All Categories"
              size="small"
              onClick={() => onSelectCategory('')}
              sx={{
                fontWeight: 700,
                fontSize: '0.8rem',
                py: 1.8,
                px: 0.5,
                borderRadius: 2,
                backgroundColor: selectedCategory === '' ? '#1E7D5C' : '#F1F5F9',
                color: selectedCategory === '' ? '#FFFFFF' : '#475569',
                border: selectedCategory === '' ? 'none' : '1px solid #E2E8F0',
                '&:hover': {
                  backgroundColor: selectedCategory === '' ? '#176449' : '#E2E8F0',
                },
              }}
            />
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.value;
              return (
                <Chip
                  key={cat.value}
                  label={`${cat.emoji} ${cat.label}`}
                  size="small"
                  onClick={() => onSelectCategory(isSelected ? '' : cat.value)}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    py: 1.8,
                    px: 0.5,
                    borderRadius: 2,
                    backgroundColor: isSelected ? '#1E7D5C' : '#F8FAFC',
                    color: isSelected ? '#FFFFFF' : '#334155',
                    border: isSelected ? 'none' : '1px solid #E2E8F0',
                    boxShadow: isSelected ? '0 2px 6px rgba(30, 125, 92, 0.25)' : 'none',
                    '&:hover': {
                      backgroundColor: isSelected ? '#176449' : '#F1F5F9',
                    },
                  }}
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
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#0EA5E9',
                    '& + .MuiSwitch-track': {
                      backgroundColor: '#0EA5E9',
                    },
                  },
                }}
              />
            }
            label={
              <Stack direction="row" alignItems="center" spacing={0.6}>
                <GemIcon sx={{ fontSize: 18, color: '#0EA5E9' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.84rem' }}>
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
