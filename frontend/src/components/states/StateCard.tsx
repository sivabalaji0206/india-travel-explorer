import React from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome as PlannerIcon,
  Explore as ExploreIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { State } from '../../api/types';

interface StateCardProps {
  state: State;
  onExplore: (stateId: number) => void;
  onPlanTrip: (stateId: number) => void;
}

export const StateCard: React.FC<StateCardProps> = ({ state, onExplore, onPlanTrip }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
              {state.name}
            </Typography>
            {state.region && (
              <Chip
                size="small"
                label={state.region}
                sx={{
                  mt: 0.5,
                  fontSize: '0.72rem',
                  height: 22,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                }}
              />
            )}
          </Box>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <LocationIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              {state.place_count} places
            </Typography>
          </Stack>
        </Stack>

        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.secondary,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5,
            minHeight: '4.5em',
          }}
        >
          {state.description || `Discover magnificent historical and natural wonders in ${state.name}.`}
        </Typography>

        {state.best_time_to_visit && (
          <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: theme.palette.text.secondary }}>
            <strong>Best Season:</strong> {state.best_time_to_visit}
          </Typography>
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
        >
          Plan Trip
        </Button>
      </CardActions>
    </Card>
  );
};

