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
} from '@mui/material';
import {
  AutoAwesome as PlannerIcon,
  Castle as FortIcon,
  DirectionsWalk as TrekIcon,
  Landscape as HillIcon,
  Pets as WildlifeIcon,
  Place as TempleIcon,
  Search as SearchIcon,
  Waves as BeachIcon,
  WbSunny as SunIcon,
} from '@mui/icons-material';
import type { PlaceCategory } from '../../api/types';

interface HeroBannerProps {
  onSearch: (query: string) => void;
  onSelectCategory: (category: PlaceCategory) => void;
  onOpenPlanner: () => void;
}

const POPULAR_CATEGORIES: { label: string; value: PlaceCategory; icon: React.ReactElement }[] = [
  { label: 'Temples & Sacred Sites', value: 'temple', icon: <TempleIcon fontSize="small" /> },
  { label: 'Beaches & Coastal', value: 'beach', icon: <BeachIcon fontSize="small" /> },
  { label: 'Heritage & Forts', value: 'heritage', icon: <FortIcon fontSize="small" /> },
  { label: 'Hill Stations', value: 'hill_station', icon: <HillIcon fontSize="small" /> },
  { label: 'Nature & Waterfalls', value: 'nature', icon: <SunIcon fontSize="small" /> },
  { label: 'Wildlife Sanctuaries', value: 'wildlife', icon: <WildlifeIcon fontSize="small" /> },
  { label: 'Adventure & Treks', value: 'adventure', icon: <TrekIcon fontSize="small" /> },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSearch,
  onSelectCategory,
  onOpenPlanner,
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        py: { xs: 8, md: 12 },
        textAlign: 'center',
        color: '#fff',
        backgroundImage: `linear-gradient(to bottom, rgba(11, 15, 25, 0.72) 0%, rgba(11, 15, 25, 0.88) 100%), url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1920&q=85')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 35%',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: 'inset 0 -40px 60px -20px rgba(0,0,0,0.8)',
      }}
    >
      <Container maxWidth="md">
        {/* Floating AI Chip */}
        <Chip
          icon={<PlannerIcon sx={{ fontSize: '16px !important', color: '#FDBA74 !important' }} />}
          label="Grounded AI Trip Planner • 100% Real Tourism Dataset"
          sx={{
            mb: 3,
            fontWeight: 800,
            borderRadius: 10,
            px: 1.5,
            py: 2.2,
            backgroundColor: 'rgba(224, 93, 56, 0.22)',
            color: '#FDBA74',
            border: '1px solid rgba(224, 93, 56, 0.5)',
            backdropFilter: 'blur(8px)',
          }}
        />

        {/* Hero Title */}
        <Typography
          variant="h2"
          sx={{
            fontWeight: 900,
            letterSpacing: -1.2,
            mb: 2,
            fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem' },
            textShadow: '0 3px 12px rgba(0,0,0,0.7)',
            lineHeight: 1.15,
          }}
        >
          Discover the Soul of{' '}
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(45deg, #FF8A65 30%, #F59E0B 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Incredible India
          </Box>
        </Typography>

        {/* Subtitle */}
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: { xs: '1rem', md: '1.25rem' },
            mb: 4,
            maxWidth: 680,
            mx: 'auto',
            lineHeight: 1.6,
            textShadow: '0 2px 6px rgba(0,0,0,0.6)',
          }}
        >
          Explore verified attractions across all 34 states and union territories. Let our RAG-grounded AI
          build you a realistic, day-by-day travel itinerary with verified local dishes and budget transparency.
        </Typography>

        {/* Search Input & CTA Button */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="center"
          sx={{ mb: 4, maxWidth: 640, mx: 'auto' }}
        >
          <TextField
            placeholder="Search attractions (e.g. Taj Mahal, Munnar, Hampi, Baga)..."
            variant="outlined"
            size="medium"
            fullWidth
            onChange={(e) => onSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(12px)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                },
                '& input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.75)',
                  opacity: 1,
                },
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
              px: 3.5,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: '0 8px 24px rgba(224, 93, 56, 0.5)',
            }}
          >
            Plan My Trip
          </Button>
        </Stack>

        {/* Category Pills */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ gap: 1, mb: 4 }}
        >
          {POPULAR_CATEGORIES.map((cat) => (
            <Chip
              key={cat.value}
              icon={cat.icon}
              label={cat.label}
              onClick={() => onSelectCategory(cat.value)}
              sx={{
                cursor: 'pointer',
                borderRadius: 2,
                px: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                '& .MuiChip-icon': {
                  color: '#fff !important',
                },
                '&:hover': {
                  backgroundColor: 'rgba(224, 93, 56, 0.4)',
                  borderColor: '#E05D38',
                },
              }}
            />
          ))}
        </Stack>

        {/* Quick Stats Strip */}
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={{ xs: 2, sm: 4 }}
          sx={{
            pt: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            color: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FDBA74' }}>
              34
            </Typography>
            <Typography variant="caption">States & UTs</Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FDBA74' }}>
              155
            </Typography>
            <Typography variant="caption">Destinations</Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FDBA74' }}>
              575
            </Typography>
            <Typography variant="caption">Verified Places</Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#FDBA74' }}>
              245
            </Typography>
            <Typography variant="caption">Local Dishes</Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
