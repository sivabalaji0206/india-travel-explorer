import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardMedia,
  Chip,
  Container,
  Fade,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
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

interface WonderLetter {
  char: string;
  wonder: string;
  state: string;
  image: string;
  description: string;
}

// 15 Wonders from 15 distinct Indian States representing "INCREDIBLE INDIA"
const INCREDIBLE_LETTERS: WonderLetter[] = [
  {
    char: 'I',
    wonder: 'India Gate',
    state: 'Delhi',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
    description: 'Iconic sandstone memorial arch in New Delhi',
  },
  {
    char: 'n',
    wonder: 'Nalanda Mahavihara',
    state: 'Bihar',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
    description: 'Ancient UNESCO World Heritage university ruins',
  },
  {
    char: 'c',
    wonder: 'Charminar',
    state: 'Telangana',
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80',
    description: '16th-century four-minaret monument in Hyderabad',
  },
  {
    char: 'r',
    wonder: 'Ranthambore Fort',
    state: 'Rajasthan',
    image: 'https://images.unsplash.com/photo-1615800098779-1be32e60cca3?auto=format&fit=crop&w=600&q=80',
    description: 'Royal fort nestled in Royal Bengal tiger wilderness',
  },
  {
    char: 'e',
    wonder: 'Ellora Rock-Cut Caves',
    state: 'Maharashtra',
    image: 'https://images.unsplash.com/photo-1600100397608-f010e42e4785?auto=format&fit=crop&w=600&q=80',
    description: 'Monolithic rock-carved Kailash Temple',
  },
  {
    char: 'd',
    wonder: 'Dudhsagar Falls',
    state: 'Goa',
    image: 'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=600&q=80',
    description: 'Four-tiered sea of milk cascade in Western Ghats',
  },
  {
    char: 'i',
    wonder: 'Idyllic Backwaters',
    state: 'Kerala',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80',
    description: 'Serene palm-fringed canals & traditional houseboats',
  },
  {
    char: 'b',
    wonder: 'Brihadisvara Temple',
    state: 'Tamil Nadu',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
    description: 'Great Living Chola architectural marvel in Thanjavur',
  },
  {
    char: 'l',
    wonder: 'Living Root Bridges',
    state: 'Meghalaya',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    description: 'Bio-engineered rainforest suspension bridges in Cherrapunji',
  },
  {
    char: 'e',
    wonder: 'Elephanta Caves',
    state: 'Maharashtra',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80',
    description: 'Ancient rock-carved Shiva sanctuaries in Mumbai harbour',
  },
];

const INDIA_LETTERS: WonderLetter[] = [
  {
    char: 'I',
    wonder: 'Iconic Taj Mahal',
    state: 'Uttar Pradesh',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
    description: 'Crown of Palaces and UNESCO Wonder of the World in Agra',
  },
  {
    char: 'n',
    wonder: 'Nainital Emerald Lake',
    state: 'Uttarakhand',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    description: 'Crescent-shaped high-altitude lake in Kumaon Himalayas',
  },
  {
    char: 'd',
    wonder: 'Dal Lake & Shikaras',
    state: 'Jammu and Kashmir',
    image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=600&q=80',
    description: 'Jewel of Srinagar with floating gardens and houseboats',
  },
  {
    char: 'i',
    wonder: 'Islands of Bangaram',
    state: 'Lakshadweep',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    description: 'Turquoise coral atolls and pristine marine lagoons',
  },
  {
    char: 'a',
    wonder: 'Amritsar Golden Temple',
    state: 'Punjab',
    image: 'https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=600&q=80',
    description: 'Harmandir Sahib spiritual gold sanctuary and holy nectar pool',
  },
];

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
  const [hoveredWonder, setHoveredWonder] = useState<WonderLetter | null>(null);

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

  // Helper to render an interactive letter with rich wonder tooltip
  const renderInteractiveLetter = (item: WonderLetter, idx: number) => {
    const isHovered = hoveredWonder?.wonder === item.wonder;

    const tooltipContent = (
      <Card
        sx={{
          maxWidth: 240,
          p: 1.2,
          borderRadius: 2.5,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
          color: '#fff',
        }}
      >
        <CardMedia
          component="img"
          height="100"
          image={item.image}
          alt={item.wonder}
          sx={{ borderRadius: 1.5, mb: 1, objectFit: 'cover' }}
        />
        <Typography variant="caption" sx={{ color: '#FDBA74', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Letter {item.char.toUpperCase()} • {item.state}
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#fff', lineHeight: 1.25, mt: 0.2 }}>
          {item.wonder}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem', display: 'block', mt: 0.5 }}>
          {item.description}
        </Typography>
      </Card>
    );

    return (
      <Tooltip
        key={`${item.char}-${idx}`}
        title={tooltipContent}
        arrow
        placement="top"
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: 'transparent',
              p: 0,
              boxShadow: 'none',
            },
          },
        }}
      >
        <Box
          component="span"
          onMouseEnter={() => setHoveredWonder(item)}
          onMouseLeave={() => setHoveredWonder(null)}
          sx={{
            display: 'inline-block',
            cursor: 'pointer',
            fontWeight: 700,
            transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isHovered ? 'translateY(-6px) scale(1.18)' : 'scale(1)',
            background: isHovered
              ? 'linear-gradient(45deg, #FFFFFF 10%, #FBBF24 90%)'
              : 'linear-gradient(45deg, #FF8A65 15%, #FBBF24 85%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: isHovered
              ? '0 0 20px rgba(251, 191, 36, 0.9)'
              : '0 2px 10px rgba(0,0,0,0.7)',
            '&:hover': {
              filter: 'drop-shadow(0 4px 12px rgba(224, 93, 56, 0.7))',
            },
          }}
        >
          {item.char}
        </Box>
      </Tooltip>
    );
  };

  return (
    <Box
      sx={{
        position: 'relative',
        py: { xs: 8, md: 12 },
        textAlign: 'center',
        color: '#fff',
        overflow: 'hidden',
        minHeight: { xs: 580, md: 660 },
        display: 'flex',
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
            backgroundImage: `linear-gradient(to bottom, rgba(11, 15, 25, 0.25) 0%, rgba(11, 15, 25, 0.52) 100%), url('${slide.url}')`,
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
          icon={<PlannerIcon sx={{ fontSize: '15px !important', color: '#FDBA74 !important' }} />}
          label="Intelligent Trip Planner • Tailored Itineraries & Transparent Budgets"
          sx={{
            mb: 2.5,
            fontWeight: 700,
            borderRadius: 10,
            px: 1.5,
            py: 2,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            color: '#FDBA74',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        />

        {/* Hero Title: Lighter, Editorial Typography with Interactive Wonders */}
        <Typography
          variant="h2"
          sx={{
            fontWeight: 500, // Decreased font weight for elegance
            letterSpacing: 0.5,
            mb: 1.5,
            fontSize: { xs: '2.25rem', sm: '3.25rem', md: '3.85rem' },
            textShadow: '0 3px 14px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.8)',
            lineHeight: 1.2,
          }}
        >
          Discover the Soul of{' '}
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: { xs: 0.5, sm: 1 },
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {/* Word 1: INCREDIBLE (10 letters -> 10 state wonders) */}
            <Box component="span" sx={{ display: 'inline-flex', letterSpacing: { xs: '1px', sm: '2px' } }}>
              {INCREDIBLE_LETTERS.map((item, idx) => renderInteractiveLetter(item, idx))}
            </Box>

            {/* Word 2: INDIA (5 letters -> 5 state wonders) */}
            <Box component="span" sx={{ display: 'inline-flex', letterSpacing: { xs: '1px', sm: '2px' }, ml: 0.5 }}>
              {INDIA_LETTERS.map((item, idx) => renderInteractiveLetter(item, idx + 10))}
            </Box>
          </Box>
        </Typography>

        {/* Interactive Wonder Hover Callout Pill */}
        <Box sx={{ mb: 3 }}>
          {hoveredWonder ? (
            <Fade in={Boolean(hoveredWonder)}>
              <Chip
                avatar={<Avatar src={hoveredWonder.image} alt={hoveredWonder.wonder} />}
                label={
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#fff' }}>
                    <strong>{hoveredWonder.char.toUpperCase()}</strong> is for{' '}
                    <span style={{ color: '#FDBA74' }}>{hoveredWonder.wonder}</span> • {hoveredWonder.state}
                  </Typography>
                }
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  border: '1px solid rgba(251, 191, 36, 0.5)',
                  backdropFilter: 'blur(10px)',
                  py: 2,
                  px: 1,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                }}
              />
            </Fade>
          ) : (
            <Chip
              size="small"
              icon={<LocationIcon sx={{ fontSize: '13px !important', color: '#FDBA74 !important' }} />}
              label="Hover over any letter of Incredible India to discover 15 wonders across 15 states!"
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                color: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(8px)',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          )}
        </Box>

        {/* Subtitle with Lighter Font Weight */}
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.92)',
            fontWeight: 400, // Lighter, readable font weight
            fontSize: { xs: '1rem', md: '1.2rem' },
            mb: 4,
            maxWidth: 700,
            mx: 'auto',
            lineHeight: 1.65,
            textShadow: '0 2px 8px rgba(0,0,0,0.9)',
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
                  <SearchIcon sx={{ color: 'rgba(255,255,255,0.85)' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(16px)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
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
            size="large"
            onClick={onOpenPlanner}
            startIcon={<PlannerIcon />}
            sx={{
              whiteSpace: 'nowrap',
              px: 4,
              py: 1.6,
              borderRadius: 3,
              fontWeight: 800,
              fontSize: '1.02rem',
              boxShadow: '0 8px 24px rgba(224, 93, 56, 0.6)',
            }}
          >
            Plan My Trip
          </Button>
        </Stack>

        {/* Category Pills with High Contrast */}
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
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                backdropFilter: 'blur(10px)',
                fontWeight: 700,
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                '& .MuiChip-icon': {
                  color: '#fff !important',
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

        {/* Live Counters */}
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={{ xs: 3, sm: 6 }}
          sx={{
            pt: 2.5,
            borderTop: '1px solid rgba(255, 255, 255, 0.22)',
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FDBA74', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
              34
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>States & UTs</Typography>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FDBA74', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
              155
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>Destinations</Typography>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FDBA74', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
              575
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>Verified Places</Typography>
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#FDBA74', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
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
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: '#fff',
          backdropFilter: 'blur(8px)',
          zIndex: 2,
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
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
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: '#fff',
          backdropFilter: 'blur(8px)',
          zIndex: 2,
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
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
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.25)',
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
