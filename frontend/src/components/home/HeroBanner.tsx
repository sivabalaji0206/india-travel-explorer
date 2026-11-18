import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  AutoAwesome as PlannerIcon,
  Castle as FortIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  DirectionsWalk as TrekIcon,
  Landscape as HillIcon,
  LocationOn as LocationIcon,
  Pets as WildlifeIcon,
  Place as TempleIcon,
  Search as SearchIcon,
  Waves as BeachIcon,
  WbSunny as SunIcon,
} from '@mui/icons-material';
import type { PlaceCategory } from '../../api/types';
import { catalogueApi } from '../../api/catalogueApi';

interface HeroBannerProps {
  onSearch: (query: string) => void;
  onSelectCategory: (category: PlaceCategory) => void;
  onOpenPlanner: () => void;
}

const HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1920&q=85',
    title: 'The Taj Mahal at Sunrise',
    location: 'Agra, Uttar Pradesh',
  },
  {
    url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1920&q=85',
    title: 'Alleppey Backwaters Houseboat',
    location: 'Alleppey, Kerala',
  },
  {
    url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1920&q=85',
    title: 'Hawa Mahal & Royal Palaces',
    location: 'Jaipur, Rajasthan',
  },
  {
    url: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1920&q=85',
    title: 'Pangong Tso & Himalayan Peaks',
    location: 'Leh, Ladakh',
  },
  {
    url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1920&q=85',
    title: 'Sacred Ghats & Ganga Aarti',
    location: 'Varanasi, Uttar Pradesh',
  },
  {
    url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1920&q=85',
    title: 'Golden Sunset & Coastal Palms',
    location: 'North & South Goa',
  },
];

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
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [counts, setCounts] = useState({
    states: 34,
    destinations: 75,
    places: 250,
    foods: 120,
  });

  // Fetch dynamic catalogue counts
  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      catalogueApi.getStates(),
      catalogueApi.getDestinations({ page_size: 1 }),
      catalogueApi.getPlaces({ page_size: 1 }),
      catalogueApi.getFoods({ page_size: 1 }),
    ]).then(([statesRes, destsRes, placesRes, foodsRes]) => {
      if (!isMounted) return;
      setCounts({
        states:
          statesRes.status === 'fulfilled' && statesRes.value.length ? statesRes.value.length : 34,
        destinations:
          destsRes.status === 'fulfilled' && destsRes.value.meta.total_items
            ? destsRes.value.meta.total_items
            : 75,
        places:
          placesRes.status === 'fulfilled' && placesRes.value.meta.total_items
            ? placesRes.value.meta.total_items
            : 250,
        foods:
          foodsRes.status === 'fulfilled' && foodsRes.value.meta.total_items
            ? foodsRes.value.meta.total_items
            : 120,
      });
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-rotate hero slide every 6 seconds smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const activeSlide = HERO_SLIDES[currentSlide];

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: { xs: 'auto', md: 'calc(100vh - 70px)' },
        boxSizing: 'border-box',
        py: { xs: 4, sm: 4.5, md: 4 },
        textAlign: 'center',
        color: '#fff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background Slides with Lighter, High-Visibility Overlay */}
      {HERO_SLIDES.map((slide, idx) => (
        <Box
          key={slide.url}
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(11, 15, 25, 0.22) 0%, rgba(11, 15, 25, 0.50) 100%), url('${slide.url}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            opacity: idx === currentSlide ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
            zIndex: 0,
            transform: idx === currentSlide ? 'scale(1.02)' : 'scale(1)',
            transitionDuration: '1.2s, 6s',
            transitionProperty: 'opacity, transform',
          }}
        />
      ))}

      {/* Hero Content Container */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Subtle Feature Chip */}
        <Chip
          icon={<PlannerIcon sx={{ fontSize: '14px !important', color: '#FDBA74 !important' }} />}
          label="Intelligent Trip Planner • Tailored Itineraries & Transparent Budgets"
          size="small"
          sx={{
            mb: 1.5,
            fontWeight: 700,
            borderRadius: 10,
            px: 1.2,
            py: 1.6,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            color: '#FDBA74',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}
        />

        {/* Hero Title */}
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            letterSpacing: -0.5,
            mb: 2,
            fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.3rem' },
            color: '#FFFFFF',
            lineHeight: 1.18,
            textShadow: '0 3px 16px rgba(0, 0, 0, 0.8)',
          }}
        >
          Discover the Soul of{' '}
          <Box
            component="span"
            sx={{
              color: '#FF7A45',
              textShadow: '0 3px 18px rgba(0, 0, 0, 0.9), 0 0 28px rgba(255, 122, 69, 0.45)',
              fontWeight: 900,
            }}
          >
            Incredible India
          </Box>
        </Typography>

        {/* Subtitle with Lighter Font Weight */}
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.92)',
            fontWeight: 400,
            fontSize: { xs: '0.9rem', md: '1.05rem' },
            mb: 2.5,
            maxWidth: 740,
            mx: 'auto',
            lineHeight: 1.55,
            textShadow: '0 2px 8px rgba(0,0,0,0.9)',
          }}
        >
          Explore verified attractions across all 34 states and territories. Let our intelligent AI
          craft your personalized, day-by-day travel plan with authentic regional dishes and real entrance costs.
        </Typography>

        {/* Search Input & CTA Button */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.2}
          justifyContent="center"
          sx={{ mb: 2.2, maxWidth: 740, mx: 'auto' }}
        >
          <TextField
            placeholder="Search attractions (e.g. Taj Mahal, Munnar, Hampi, Baga Beach)..."
            variant="outlined"
            size="small"
            fullWidth
            onChange={(e) => onSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.85)' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2.5,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(16px)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.6)',
                },
                '& input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.85)',
                  opacity: 1,
                },
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            size="medium"
            onClick={onOpenPlanner}
            startIcon={<PlannerIcon />}
            sx={{
              whiteSpace: 'nowrap',
              px: 3.5,
              py: 1,
              borderRadius: 2.5,
              fontWeight: 800,
              fontSize: '0.95rem',
              boxShadow: '0 6px 20px rgba(224, 93, 56, 0.55)',
            }}
          >
            Plan My Trip
          </Button>
        </Stack>

        {/* Category Pills */}
        <Stack
          direction="row"
          spacing={0.8}
          justifyContent="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ gap: 0.8, mb: 2.5 }}
        >
          {POPULAR_CATEGORIES.map((cat) => (
            <Chip
              key={cat.value}
              icon={cat.icon}
              label={cat.label}
              size="small"
              onClick={() => onSelectCategory(cat.value)}
              sx={{
                cursor: 'pointer',
                borderRadius: 2,
                px: 0.8,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(8px)',
                fontWeight: 600,
                fontSize: '0.74rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                '& .MuiChip-icon': {
                  color: '#fff !important',
                  fontSize: '15px !important',
                },
                '&:hover': {
                  backgroundColor: 'rgba(224, 93, 56, 0.6)',
                  borderColor: '#E05D38',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </Stack>

        {/* Live Counters (Centered at bottom of card) */}
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={{ xs: 3, sm: 6 }}
          sx={{
            pt: 2.2,
            borderTop: '1px solid rgba(255, 255, 255, 0.22)',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: 740,
            mx: 'auto',
          }}
        >
          <Box textAlign="center">
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FDBA74', lineHeight: 1.1, textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
              {counts.states}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>States & UTs</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FDBA74', lineHeight: 1.1, textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
              {counts.destinations}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Destinations</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FDBA74', lineHeight: 1.1, textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
              {counts.places}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Verified Places</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FDBA74', lineHeight: 1.1, textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
              {counts.foods}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Local Dishes</Typography>
          </Box>
        </Stack>
      </Container>

      {/* Slide Navigation Arrows */}
      <IconButton
        size="small"
        onClick={handlePrevSlide}
        sx={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(0,0,0,0.45)',
          color: '#fff',
          backdropFilter: 'blur(6px)',
          zIndex: 2,
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.75)' },
          display: { xs: 'none', md: 'flex' },
        }}
      >
        <PrevIcon fontSize="small" />
      </IconButton>

      <IconButton
        size="small"
        onClick={handleNextSlide}
        sx={{
          position: 'absolute',
          right: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(0,0,0,0.45)',
          color: '#fff',
          backdropFilter: 'blur(6px)',
          zIndex: 2,
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.75)' },
          display: { xs: 'none', md: 'flex' },
        }}
      >
        <NextIcon fontSize="small" />
      </IconButton>

      {/* Floating Active Slide Caption Pill (Bottom-Right) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 20,
          zIndex: 2,
          display: { xs: 'none', sm: 'block' },
        }}
      >
        <Chip
          icon={<LocationIcon sx={{ fontSize: '14px !important', color: '#FDBA74 !important' }} />}
          label={`${activeSlide.title} • ${activeSlide.location}`}
          sx={{
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            fontWeight: 700,
            fontSize: '0.75rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        />
      </Box>

      {/* Slide Indicator Dots (Bottom-Center) */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: 'absolute',
          bottom: 18,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
        }}
      >
        {HERO_SLIDES.map((_, idx) => (
          <Box
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            sx={{
              width: idx === currentSlide ? 24 : 8,
              height: 5,
              borderRadius: 3,
              backgroundColor: idx === currentSlide ? '#FF8A65' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': { backgroundColor: '#fff' },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};
