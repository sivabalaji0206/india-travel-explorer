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
  Typography,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome as PlannerIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Collections as PhotoIcon,
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

  // Auto-slide to next photo every 4.5 seconds if hovered or idle
  useEffect(() => {
    if (!isHovered) return;
    const timer = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % gallery.length);
    }, 3500);
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
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 16px 36px rgba(0,0,0,0.65)'
              : '0 16px 36px rgba(224, 93, 56, 0.16)',
          borderColor: theme.palette.primary.main,
          '& .carousel-controls': {
            opacity: 1,
          },
        },
      }}
    >
      {/* Interactive Photo Carousel Header (Height 210px for rich visibility) */}
      <Box sx={{ position: 'relative', height: 210, overflow: 'hidden', bgcolor: '#000' }}>
        <CardMedia
          component="img"
          key={currentPhoto.url}
          height="210"
          image={currentPhoto.url}
          alt={currentPhoto.caption || state.name}
          sx={{
            objectFit: 'cover',
            animation: 'fadeIn 0.5s ease',
            '@keyframes fadeIn': {
              '0%': { opacity: 0.6 },
              '100%': { opacity: 1 },
            },
          }}
        />

        {/* Subtle Bottom Gradient Scrim for crisp readability */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 90,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
          }}
        />

        {/* Top Badges (Region + Photo Count) */}
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
                fontSize: '0.68rem',
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            />
          )}

          {/* Photo Counter Pill: e.g. 1 / 6 photos */}
          <Chip
            size="small"
            icon={<PhotoIcon sx={{ fontSize: '12px !important', color: '#fff !important' }} />}
            label={`${photoIndex + 1} / ${gallery.length}`}
            sx={{
              fontWeight: 800,
              fontSize: '0.68rem',
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          />
        </Stack>

        {/* Previous & Next Arrow Controls (visible on hover) */}
        <Box
          className="carousel-controls"
          sx={{
            opacity: 0,
            transition: 'opacity 0.25s ease',
            position: 'absolute',
            top: '50%',
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
              backgroundColor: 'rgba(0,0,0,0.65)',
              color: '#fff',
              backdropFilter: 'blur(4px)',
              p: 0.5,
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.85)' },
            }}
          >
            <PrevIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleNextPhoto}
            sx={{
              pointerEvents: 'auto',
              backgroundColor: 'rgba(0,0,0,0.65)',
              color: '#fff',
              backdropFilter: 'blur(4px)',
              p: 0.5,
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.85)' },
            }}
          >
            <NextIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Bottom overlay: State Name & Photo Caption */}
        <Box sx={{ position: 'absolute', bottom: 10, left: 14, right: 14, zIndex: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 900,
                  color: '#fff',
                  lineHeight: 1.15,
                  textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                }}
              >
                {state.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '0.72rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                }}
              >
                {currentPhoto.caption}
              </Typography>
            </Box>

            <Chip
              size="small"
              icon={<LocationIcon sx={{ fontSize: '13px !important', color: '#fff !important' }} />}
              label={`${state.place_count}`}
              sx={{
                fontWeight: 800,
                fontSize: '0.7rem',
                backgroundColor: theme.palette.primary.main,
                color: '#fff',
                height: 22,
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
              }}
            />
          </Stack>

          {/* Dots Indicator */}
          <Stack direction="row" spacing={0.6} justifyContent="center" sx={{ mt: 1 }}>
            {gallery.map((_, idx) => (
              <Box
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoIndex(idx);
                }}
                sx={{
                  width: idx === photoIndex ? 16 : 5,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: idx === photoIndex ? '#fff' : 'rgba(255,255,255,0.45)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  '&:hover': { backgroundColor: '#fff' },
                }}
              />
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Card Content */}
      <CardContent sx={{ pb: 1, pt: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5,
            minHeight: '3em',
            mb: 1.5,
          }}
        >
          {state.description || `Discover iconic heritage, nature, and cultural wonders in ${state.name}.`}
        </Typography>

        {state.best_time_to_visit && (
          <Stack direction="row" alignItems="center" spacing={0.6}>
            <SeasonIcon sx={{ fontSize: 15, color: theme.palette.primary.main }} />
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
              <strong>Best Season:</strong> {state.best_time_to_visit}
            </Typography>
          </Stack>
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          fullWidth
          startIcon={<ExploreIcon fontSize="small" />}
          onClick={() => onExplore(state.id)}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Explore Places ({state.place_count})
        </Button>
        <Button
          size="small"
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<PlannerIcon fontSize="small" />}
          onClick={() => onPlanTrip(state.id)}
          sx={{ borderRadius: 2, fontWeight: 800 }}
        >
          Plan Trip
        </Button>
      </CardActions>
    </Card>
  );
};
