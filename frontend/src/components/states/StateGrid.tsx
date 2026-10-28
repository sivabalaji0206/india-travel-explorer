import React, { useMemo, useState } from 'react';
import {
  Box,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
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
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');

  const filteredStates = useMemo(() => {
    if (selectedRegion === 'All Regions') {
      return states;
    }
    return states.filter((s) => s.region?.toLowerCase().includes(selectedRegion.toLowerCase()));
  }, [states, selectedRegion]);

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="xl">
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              Indian States & Union Territories
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Choose any of India's 34 states and territories to explore verified attractions or generate an AI itinerary.
            </Typography>
          </Box>
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
              <Tab key={tab} label={tab} value={tab} sx={{ fontWeight: 700 }} />
            ))}
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredStates.map((state) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={state.id}>
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
