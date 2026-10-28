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

  // Auto-rotate hero slide every 5.5 seconds smoothly
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
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
        py: { xs: 9, md: 14 },
        textAlign: 'center',
        color: '#fff',
        overflow: 'hidden',
        minHeight: { xs: 580, md: 660 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background Slides with Cross-Fade */}
      {HERO_SLIDES.map((slide, idx) => (
        <Box
          key={slide.url}
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(to bottom, rgba(11, 15, 25, 0.65) 0%, rgba(11, 15, 25, 0.85) 100%), url('${slide.url}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            opacity: idx === currentSlide ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
            zIndex: 0,
            transform: idx === currentSlide ? 'scale(1.03)' : 'scale(1)',
            transitionDuration: '1.2s, 6s',
            transitionProperty: 'opacity, transform',
          }}
        />
      ))}

      {/* Hero Content Container */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Modern Feature Chip (Clean traveler terminology, NO RAG / LLM) */}
        <Chip
          icon={<PlannerIcon sx={{ fontSize: '16px !important', color: '#FDBA74 !important' }} />}
          label="Intelligent Trip Planner • Tailored Itineraries & Transparent Budgets"
          sx={{
            mb: 3,
            fontWeight: 800,
            borderRadius: 10,
            px: 1.5,
            py: 2.2,
            backgroundColor: 'rgba(224, 93, 56, 0.25)',
            color: '#FDBA74',
            border: '1px solid rgba(224, 93, 56, 0.55)',
            backdropFilter: 'blur(10px)',
          }}
        />

        {/* Hero Title */}
        <Typography
          variant="h2"
          sx={{
            fontWeight: 900,
            letterSpacing: -1.2,
            mb: 2,
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.25rem' },
            textShadow: '0 4px 16px rgba(0,0,0,0.8)',
            lineHeight: 1.15,
          }}
        >
          Discover the Soul of{' '}
          <Box
            component="span"
            sx={{
              background: 'linear-gradient(45deg, #FF8A65 20%, #FBBF24 80%)',
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
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: { xs: '1.05rem', md: '1.3rem' },
            mb: 4.5,
            maxWidth: 720,
            mx: 'auto',
            lineHeight: 1.6,
            textShadow: '0 2px 8px rgba(0,0,0,0.7)',
          }}
        >
          Explore verified attractions across all 34 states and territories. Let our intelligent AI
          craft your personalized, day-by-day travel plan with authentic regional dishes and real entrance costs.
        </Typography>

        {/* Search Input & CTA Button */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          justifyContent="center"
          sx={{ mb: 4, maxWidth: 660, mx: 'auto' }}
        >
          <TextField
            placeholder="Search attractions (e.g. Taj Mahal, Munnar, Hampi, Baga Beach)..."
            variant="outlined"
            size="medium"
            fullWidth
            onChange={(e) => onSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255,255,255,0.75)' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                backdropFilter: 'blur(12px)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'transparent',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '& input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.8)',
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
              px: 4,
              py: 1.6,
              borderRadius: 3,
              fontWeight: 900,
              fontSize: '1.05rem',
              boxShadow: '0 8px 24px rgba(224, 93, 56, 0.55)',
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
                borderRadius: 2.5,
                px: 1.2,
                py: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.14)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(8px)',
                fontWeight: 700,
                '& .MuiChip-icon': {
                  color: '#fff !important',
                },
                '&:hover': {
                  backgroundColor: 'rgba(224, 93, 56, 0.5)',
                  borderColor: '#E05D38',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </Stack>

        {/* Live Counters */}
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={{ xs: 3, sm: 6 }}
          sx={{
            pt: 2.5,
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'rgba(255, 255, 255, 0.85)',
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#FDBA74' }}>
              34
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>States & UTs</Typography>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#FDBA74' }}>
              155
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>Destinations</Typography>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#FDBA74' }}>
              575
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>Verified Places</Typography>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#FDBA74' }}>
              245
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>Local Dishes</Typography>
          </Box>
        </Stack>
      </Container>

      {/* Slide Navigation Arrows */}
      <IconButton
        onClick={handlePrevSlide}
        sx={{
          position: 'absolute',
          left: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(0,0,0,0.4)',
          color: '#fff',
          backdropFilter: 'blur(6px)',
          zIndex: 2,
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
          display: { xs: 'none', md: 'flex' },
        }}
      >
        <PrevIcon fontSize="medium" />
      </IconButton>

      <IconButton
        onClick={handleNextSlide}
        sx={{
          position: 'absolute',
          right: 16,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(0,0,0,0.4)',
          color: '#fff',
          backdropFilter: 'blur(6px)',
          zIndex: 2,
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
          display: { xs: 'none', md: 'flex' },
        }}
      >
        <NextIcon fontSize="medium" />
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
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontWeight: 700,
            fontSize: '0.75rem',
          }}
        />
      </Box>

      {/* Slide Indicator Dots (Bottom-Center) */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: 'absolute',
          bottom: 20,
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
              height: 6,
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
