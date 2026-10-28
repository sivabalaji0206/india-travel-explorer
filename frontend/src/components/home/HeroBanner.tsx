import React from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome as PlannerIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { PlaceCategory } from '../../api/types';
import { designTokens } from '../../theme/tokens';

interface HeroBannerProps {
  onSearch: (query: string) => void;
  onSelectCategory: (category: PlaceCategory) => void;
  onOpenPlanner: () => void;
}

const POPULAR_CATEGORIES: { label: string; value: PlaceCategory }[] = [
  { label: 'Temples & Sacred Sites', value: 'temple' },
  { label: 'Beaches & Coastal', value: 'beach' },
  { label: 'Heritage & Forts', value: 'heritage' },
  { label: 'Hill Stations', value: 'hill_station' },
  { label: 'Nature & Waterfalls', value: 'nature' },
  { label: 'Wildlife Sanctuaries', value: 'wildlife' },
  { label: 'Adventure & Treks', value: 'adventure' },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSearch,
  onSelectCategory,
  onOpenPlanner,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 6, md: 9 },
        textAlign: 'center',
        background:
          theme.palette.mode === 'dark'
            ? 'radial-gradient(ellipse at top, #1E293B 0%, #0B0F19 80%)'
            : 'radial-gradient(ellipse at top, #FFF7ED 0%, #F8FAFC 80%)',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="md">
        <Chip
          icon={<PlannerIcon sx={{ fontSize: '16px !important' }} />}
          label="Grounded AI Trip Planner • RAG Grounded with PostgreSQL"
          color="primary"
          variant="outlined"
          sx={{ mb: 2.5, fontWeight: 700, borderRadius: 10, px: 1 }}
        />

        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            letterSpacing: -1,
            mb: 2,
            fontSize: { xs: '2rem', md: '3.25rem' },
            color: theme.palette.text.primary,
          }}
        >
          Explore the Incredible Wonders of{' '}
          <Box component="span" sx={{ color: theme.palette.primary.main }}>
            India
          </Box>
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: { xs: '1rem', md: '1.2rem' },
            mb: 4,
            maxWidth: 680,
            mx: 'auto',
          }}
        >
          Browse verified attractions across all 34 states and union territories. Let our RAG-powered AI
          build you a realistic, day-by-day travel itinerary with verified local dishes and budget transparency.
        </Typography>

        {/* Search input & Planner CTA */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="center"
          sx={{ mb: 3.5, maxWidth: 600, mx: 'auto' }}
        >
          <TextField
            placeholder="Search attractions (e.g. Taj Mahal, Munnar, Hampi)..."
            variant="outlined"
            size="medium"
            fullWidth
            onChange={(e) => onSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                backgroundColor: theme.palette.background.paper,
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onOpenPlanner}
            startIcon={<PlannerIcon />}
            sx={{
              whiteSpace: 'nowrap',
              px: 3,
              borderRadius: 3,
              boxShadow: '0 8px 20px rgba(224, 93, 56, 0.3)',
            }}
          >
            Plan My Trip
          </Button>
        </Stack>

        {/* Quick filter chips */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ gap: 1 }}
        >
          {POPULAR_CATEGORIES.map((cat) => (
            <Chip
              key={cat.value}
              label={cat.label}
              onClick={() => onSelectCategory(cat.value)}
              sx={{
                cursor: 'pointer',
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  borderColor: designTokens.colors.categories[cat.value],
                  color: designTokens.colors.categories[cat.value],
                },
              }}
            />
          ))}
        </Stack>
      </Container>
    </Box>
  );
};
