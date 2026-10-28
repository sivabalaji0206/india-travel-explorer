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
  Typography,
  useTheme,
} from '@mui/material';
import {
  Explore as ExploreIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import type { State } from '../../api/types';
import { StateCard } from './StateCard';

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
    <Box sx={{ py: 6 }}>
      <Container maxWidth="xl">
        {/* Header with Title and Search Input */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              Explore Indian States & Territories
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Choose any of India's 34 states and territories to explore verified attractions or generate an AI itinerary.
            </Typography>
          </Box>

          <TextField
            size="small"
            placeholder="Search state name..."
            value={stateSearch}
            onChange={(e) => setStateSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 2.5, minWidth: { xs: '100%', sm: 260 } },
            }}
          />
        </Stack>

        {/* Region filter tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs
            value={selectedRegion}
            onChange={(_, val) => setSelectedRegion(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {REGION_TABS.map((tab) => (
              <Tab
                key={tab}
                label={tab}
                value={tab}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : filteredStates.length === 0 ? (
          <Box
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              border: `1px dashed ${theme.palette.divider}`,
              backgroundColor:
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
            }}
          >
            <ExploreIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              No States Match Your Search
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
      </Container>
    </Box>
  );
};
