import React from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome as PlannerIcon,
  Explore as ExploreIcon,
  LocationOn as LocationIcon,
  WbSunnyOutlined as SeasonIcon,
} from '@mui/icons-material';
import type { State } from '../../api/types';
import { getStateImage } from '../../data/stateImages';

interface StateCardProps {
  state: State;
  onExplore: (stateId: number) => void;
  onPlanTrip: (stateId: number) => void;
}

export const StateCard: React.FC<StateCardProps> = ({ state, onExplore, onPlanTrip }) => {
  const theme = useTheme();
  const imageUrl = getStateImage(state.name);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 12px 28px rgba(0,0,0,0.6)'
              : '0 12px 28px rgba(224, 93, 56, 0.18)',
          '& .state-media': {
            transform: 'scale(1.06)',
          },
        },
      }}
    >
      {/* State Image Banner with Glass Badges */}
      <Box sx={{ position: 'relative', overflow: 'hidden', height: 180 }}>
        <CardMedia
          component="img"
          className="state-media"
          height="180"
          image={imageUrl}
          alt={state.name}
          sx={{
            transition: 'transform 0.4s ease',
            objectFit: 'cover',
          }}
        />

        {/* Gradient Scrim for contrast */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%)',
          }}
        />

        {/* Badges on Image */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ position: 'absolute', top: 12, left: 12, right: 12 }}
        >
          {state.region && (
            <Chip
              size="small"
              label={state.region}
              sx={{
                fontWeight: 700,
                fontSize: '0.7rem',
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            />
          )}

          <Chip
            size="small"
            icon={<LocationIcon sx={{ fontSize: '13px !important', color: '#fff !important' }} />}
            label={`${state.place_count} Places`}
            sx={{
              fontWeight: 800,
              fontSize: '0.72rem',
              backdropFilter: 'blur(8px)',
              backgroundColor: theme.palette.primary.main,
              color: '#fff',
            }}
          />
        </Stack>

        {/* State Name overlay at bottom of image */}
        <Box sx={{ position: 'absolute', bottom: 12, left: 16, right: 16 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: '#fff',
              textShadow: '0 2px 6px rgba(0,0,0,0.8)',
              lineHeight: 1.2,
            }}
          >
            {state.name}
          </Typography>
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
          {state.description || `Discover iconic historical and scenic travel destinations in ${state.name}.`}
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
          sx={{ borderRadius: 2 }}
        >
          Browse ({state.place_count})
        </Button>
        <Button
          size="small"
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<PlannerIcon fontSize="small" />}
          onClick={() => onPlanTrip(state.id)}
          sx={{ borderRadius: 2 }}
        >
          Plan Trip
        </Button>
      </CardActions>
    </Card>
  );
};
