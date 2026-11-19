import React, { useMemo, useState } from 'react';
import {
  Box,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Explore as ExploreIcon,
  GridView as GridViewIcon,
  Map as MapIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import type { State } from '../../api/types';
import { StateCard } from './StateCard';
import { IndiaStatesMap } from '../map/IndiaStatesMap';

interface StateGridProps {
  states: State[];
  loading: boolean;
  onExploreState: (stateId: number) => void;
  onPlanTripForState: (stateId: number) => void;
}

const REGION_TABS = [
  'All Regions',
  'North India',
  'South India',
  'West India',
  'East India',
  'Central India',
  'Northeast India',
  'Island Territory',
];

export const StateGrid: React.FC<StateGridProps> = ({
  states,
  loading,
  onExploreState,
  onPlanTripForState,
}) => {
  const theme = useTheme();
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');
  const [stateSearch, setStateSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const filteredStates = useMemo(() => {
    return states.filter((s) => {
      const matchRegion =
        selectedRegion === 'All Regions' ||
        (s.region && s.region.toLowerCase().includes(selectedRegion.toLowerCase()));
      const matchSearch =
        !stateSearch.trim() ||
        s.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
        (s.region && s.region.toLowerCase().includes(stateSearch.toLowerCase()));
      return matchRegion && matchSearch;
    });
  }, [states, selectedRegion, stateSearch]);

  return (
    <Box className="topographic-canvas" sx={{ py: 6, position: 'relative' }}>
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header with Title and Controls */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
              Explore Indian States & Territories
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748B' }}>
              Choose any of India's 36 states and territories to explore verified attractions or generate an AI itinerary.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
            {/* View Mode Toggle (Cards vs Interactive Map) */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              size="small"
              sx={{
                backgroundColor: '#FFFFFF',
                borderRadius: 2.5,
                border: '1px solid #E2E8F0',
                p: 0.3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                '& .MuiToggleButton-root': {
                  px: 1.8,
                  py: 0.65,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  border: 'none',
                  color: '#64748B',
                  '&.Mui-selected': {
                    backgroundColor: '#1E7D5C',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 6px rgba(30, 125, 92, 0.25)',
                    '&:hover': {
                      backgroundColor: '#176449',
                    },
                  },
                },
              }}
            >
              <ToggleButton value="grid">
                <GridViewIcon fontSize="small" sx={{ mr: 0.7 }} />
                Cards View
              </ToggleButton>
              <ToggleButton value="map">
                <MapIcon fontSize="small" sx={{ mr: 0.7 }} />
                Map Explorer
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Search state name..."
              value={stateSearch}
              onChange={(e) => setStateSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2.5,
                  backgroundColor: '#FFFFFF',
                  minWidth: { xs: '100%', sm: 220 },
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#CBD5E1' },
                },
              }}
            />
          </Stack>
        </Stack>

        {/* View Mode: Map Explorer */}
        {viewMode === 'map' ? (
          <Box sx={{ mb: 2 }}>
            <IndiaStatesMap
              states={filteredStates}
              onExploreState={onExploreState}
              onPlanTripForState={onPlanTripForState}
              height={580}
            />
          </Box>
        ) : (
          /* View Mode: Cards Grid */
          <>
            {/* Region filter tabs */}
            <Box
              sx={{
                borderBottom: '1px solid #E2E8F0',
                mb: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(8px)',
                borderRadius: 2,
                px: 1,
              }}
            >
              <Tabs
                value={selectedRegion}
                onChange={(_, val) => setSelectedRegion(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 44,
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#1E7D5C',
                    height: 2.5,
                    borderRadius: 2,
                  },
                  '& .MuiTab-root': {
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textTransform: 'none',
                    minHeight: 44,
                    color: '#64748B',
                    '&.Mui-selected': {
                      color: '#1E7D5C',
                    },
                  },
                }}
              >
                {REGION_TABS.map((tab) => (
                  <Tab key={tab} label={tab} value={tab} />
                ))}
              </Tabs>
            </Box>

            {/* Content Cards */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress sx={{ color: '#1E7D5C' }} />
              </Box>
            ) : filteredStates.length === 0 ? (
              <Box
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: 3.5,
                  border: '1px dashed #CBD5E1',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <ExploreIcon sx={{ fontSize: 44, color: '#94A3B8', mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', mb: 1 }}>
                  No States Match Your Search
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B' }}>
                  Try searching for a different state name or selecting "All Regions".
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3.5}>
                {filteredStates.map((state) => (
                  <Grid item xs={12} sm={6} md={6} lg={4} xl={3} key={state.id}>
                    <StateCard
                      state={state}
                      onExplore={onExploreState}
                      onPlanTrip={onPlanTripForState}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};
