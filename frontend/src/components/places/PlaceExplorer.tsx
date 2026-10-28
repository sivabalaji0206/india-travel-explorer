import React from 'react';
import {
  Box,
  CircularProgress,
  Container,
  Grid,
  Pagination,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Explore as ExploreIcon } from '@mui/icons-material';
import { Place, PlaceCategory, Season, State } from '../../api/types';
import { PlaceCard } from './PlaceCard';
import { PlaceFilter } from './PlaceFilter';

interface PlaceExplorerProps {
  states: State[];
  places: Place[];
  loading: boolean;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
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
  onResetFilters: () => void;
  onViewDetails: (placeId: number) => void;
}

export const PlaceExplorer: React.FC<PlaceExplorerProps> = ({
  states,
  places,
  loading,
  totalItems,
  totalPages,
  currentPage,
  onPageChange,
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
  onResetFilters,
  onViewDetails,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ py: 5 }}>
      <Container maxWidth="xl">
        {/* Section Heading */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Curated Indian Attractions
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Discover temples, hill stations, forts, wildlife reserves, and offbeat hidden gems with verified entry fees.
          </Typography>
        </Box>

        {/* Filter Bar */}
        <PlaceFilter
          states={states}
          selectedStateId={selectedStateId}
          onSelectState={onSelectState}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          selectedBudget={selectedBudget}
          onSelectBudget={onSelectBudget}
          selectedSeason={selectedSeason}
          onSelectSeason={onSelectSeason}
          search={search}
          onSearchChange={onSearchChange}
          hiddenGemOnly={hiddenGemOnly}
          onToggleHiddenGem={onToggleHiddenGem}
          onReset={onResetFilters}
        />

        {/* Results Counter */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            Showing {places.length} of {totalItems} verified attractions
          </Typography>
        </Stack>

        {/* Main Content Area */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : places.length === 0 ? (
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
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              No Attractions Match Your Criteria
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Try broadening your category, budget tier, or state filters to discover places.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {places.map((place) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={place.id}>
                <PlaceCard place={place} onViewDetails={onViewDetails} />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, page) => {
                onPageChange(page);
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              color="primary"
              size="large"
              shape="rounded"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};
