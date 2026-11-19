import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome as PlannerIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Explore as ExploreIcon,
  LocationOn as LocationIcon,
  WbSunnyOutlined as SeasonIcon,
} from '@mui/icons-material';
import type { State } from '../../api/types';
import { getStateGallery } from '../../data/stateImages';

interface StateCardProps {
  state: State;
  onExplore: (stateId: number) => void;
  onPlanTrip: (stateId: number) => void;
}

export const StateCard: React.FC<StateCardProps> = ({ state, onExplore, onPlanTrip }) => {
  const theme = useTheme();
  const gallery = getStateGallery(state.name);
  const [photoIndex, setPhotoIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Subtle auto-advance gallery photo on hover
  useEffect(() => {
    if (!isHovered || gallery.length <= 1) return;
    const timer = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % gallery.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered, gallery.length]);

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % gallery.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const currentPhoto = gallery[photoIndex] || gallery[0];

  // Extract iconic destination hubs from gallery captions for an informative corridor tag
  const landmarkTags = gallery
    .slice(0, 3)
    .map((p) => p.caption.split(',')[0].trim())
    .filter(Boolean);

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3.5,
        backgroundColor: '#FFFFFF',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 16px 32px rgba(30, 125, 92, 0.12)',
          borderColor: theme.palette.primary.main,
          '& .carousel-nav': {
            opacity: 1,
          },
          '& .state-card-media': {
            transform: 'scale(1.05)',
          },
        },
      }}
    >
      {/* High-Impact Visual Header (16:10 aspect ratio) */}
      <Box sx={{ position: 'relative', height: 215, overflow: 'hidden', bgcolor: '#0F172A' }}>
        <CardMedia
          component="img"
          className="state-card-media"
          key={currentPhoto.url}
          height="215"
          image={currentPhoto.url}
          alt={currentPhoto.caption || state.name}
          referrerPolicy="no-referrer"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.onerror = null;
            const nextPhoto = gallery[(photoIndex + 1) % gallery.length]?.url;
            e.currentTarget.src =
              nextPhoto && nextPhoto !== currentPhoto.url
                ? nextPhoto
                : 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=800&q=80';
          }}
          sx={{
            objectFit: 'cover',
            transition: 'transform 0.45s ease',
            animation: 'fadeIn 0.4s ease',
            '@keyframes fadeIn': {
              '0%': { opacity: 0.7 },
              '100%': { opacity: 1 },
            },
          }}
        />

        {/* Clean, Non-Obtrusive Gradient Scrim */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.25) 50%, rgba(0,0,0,0.15) 100%)',
          }}
        />

        {/* Top Frosted Region Badge & Destination Count */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 2 }}
        >
          {state.region && (
            <Chip
              size="small"
              label={state.region}
              sx={{
                fontWeight: 700,
                fontSize: '0.7rem',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            />
          )}

          <Chip
            size="small"
            icon={<LocationIcon sx={{ fontSize: '13px !important', color: '#FFFFFF !important' }} />}
            label={`${state.place_count} Places`}
            sx={{
              fontWeight: 800,
              fontSize: '0.7rem',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(30, 125, 92, 0.85)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            }}
          />
        </Stack>

        {/* Subtle Carousel Arrow Navigation on Hover */}
        {gallery.length > 1 && (
          <Box
            className="carousel-nav"
            sx={{
              opacity: 0,
              transition: 'opacity 0.25s ease',
              position: 'absolute',
              top: '45%',
              left: 8,
              right: 8,
              transform: 'translateY(-50%)',
              display: 'flex',
              justifyContent: 'space-between',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          >
            <IconButton
              size="small"
              onClick={handlePrevPhoto}
              sx={{
                pointerEvents: 'auto',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                color: '#FFFFFF',
                backdropFilter: 'blur(6px)',
                p: 0.5,
                '&:hover': { backgroundColor: 'rgba(15, 23, 42, 0.95)' },
              }}
            >
              <PrevIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleNextPhoto}
              sx={{
                pointerEvents: 'auto',
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                color: '#FFFFFF',
                backdropFilter: 'blur(6px)',
                p: 0.5,
                '&:hover': { backgroundColor: 'rgba(15, 23, 42, 0.95)' },
              }}
            >
              <NextIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        )}

        {/* Bottom Overlay: State Name & Photo Caption */}
        <Box sx={{ position: 'absolute', bottom: 12, left: 14, right: 14, zIndex: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              textShadow: '0 2px 6px rgba(0, 0, 0, 0.7)',
            }}
          >
            {state.name}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.85)',
              fontSize: '0.74rem',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)',
              mt: 0.2,
            }}
          >
            {currentPhoto.caption}
          </Typography>
        </Box>
      </Box>

      {/* Card Body: Highlights & Season */}
      <CardContent sx={{ pb: 1.5, pt: 2, flexGrow: 1 }}>
        {/* Destination Corridor Highlights (Replaces boilerplate text) */}
        {landmarkTags.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: '#64748B',
                fontWeight: 700,
                textTransform: 'uppercase',
                fontSize: '0.66rem',
                letterSpacing: '0.05em',
                display: 'block',
                mb: 0.6,
              }}
            >
              Top Highlights
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#334155',
                fontWeight: 600,
                fontSize: '0.82rem',
                lineHeight: 1.45,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {landmarkTags.join(' • ')}
            </Typography>
          </Box>
        )}

        {/* Season Indicator Pill */}
        {state.best_time_to_visit && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.7}
            sx={{
              mt: 1,
              py: 0.6,
              px: 1,
              borderRadius: 1.5,
              backgroundColor: '#F8FAFC',
              border: '1px solid #F1F5F9',
              width: 'fit-content',
            }}
          >
            <SeasonIcon sx={{ fontSize: 14, color: '#F59E0B' }} />
            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.74rem' }}>
              <strong>Best Season:</strong> {state.best_time_to_visit}
            </Typography>
          </Stack>
        )}
      </CardContent>

      {/* Unified Action Footer */}
      <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          fullWidth
          startIcon={<ExploreIcon sx={{ fontSize: 16 }} />}
          onClick={() => onExplore(state.id)}
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            fontSize: '0.8rem',
            color: '#334155',
            borderColor: '#E2E8F0',
            backgroundColor: '#F8FAFC',
            py: 0.8,
            boxShadow: 'none',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#CBD5E1',
              backgroundColor: '#F1F5F9',
            },
          }}
        >
          Explore Places
        </Button>
        <Button
          size="small"
          variant="contained"
          fullWidth
          startIcon={<PlannerIcon sx={{ fontSize: 16 }} />}
          onClick={() => onPlanTrip(state.id)}
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            fontSize: '0.8rem',
            color: '#FFFFFF',
            backgroundColor: '#1E7D5C',
            py: 0.8,
            boxShadow: '0 2px 6px rgba(30, 125, 92, 0.2)',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#176449',
              boxShadow: '0 4px 12px rgba(30, 125, 92, 0.3)',
            },
          }}
        >
          Plan Trip
        </Button>
      </CardActions>
    </Card>
  );
};
