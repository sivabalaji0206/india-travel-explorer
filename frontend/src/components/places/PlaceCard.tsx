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
  Diamond as GemIcon,
  InfoOutlined as DetailIcon,
  LocationOn as LocationIcon,
  PaymentsOutlined as CostIcon,
} from '@mui/icons-material';
import { Place } from '../../api/types';
import { designTokens } from '../../theme/tokens';

interface PlaceCardProps {
  place: Place;
  onViewDetails: (placeId: number) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onViewDetails }) => {
  const theme = useTheme();
  const categoryColor = designTokens.colors.categories[place.category] || theme.palette.primary.main;

  const feeText =
    place.entry_fee === null
      ? 'Fee Info N/A'
      : place.entry_fee === 0
      ? 'Free Entry'
      : `₹${place.entry_fee}`;

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
        {/* Top Badges */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }} flexWrap="wrap">
          <Chip
            size="small"
            label={place.category.replace('_', ' ').toUpperCase()}
            sx={{
              backgroundColor: `${categoryColor}18`,
              color: categoryColor,
              fontWeight: 700,
              fontSize: '0.7rem',
              height: 22,
            }}
          />
          <Chip
            size="small"
            label={`${place.budget_level.toUpperCase()} BUDGET`}
            sx={{
              fontSize: '0.68rem',
              height: 22,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
            }}
          />
          {place.is_hidden_gem && (
            <Chip
              size="small"
              icon={<GemIcon sx={{ fontSize: '13px !important' }} />}
              label="Hidden Gem"
              color="secondary"
              sx={{ fontSize: '0.68rem', height: 22, fontWeight: 700 }}
            />
          )}
        </Stack>

        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, lineHeight: 1.25 }}>
          {place.name}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1.5, color: theme.palette.text.secondary }}>
          <LocationIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {place.destination_name}, {place.state_name}
          </Typography>
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
            mb: 1.5,
          }}
        >
          {place.description || 'Verified attraction in our curated India tourism database.'}
        </Typography>

        {/* Pricing info */}
        <Stack direction="row" spacing={2} sx={{ pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Box>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
              Entry Ticket
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              {feeText}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
              Avg Daily Cost
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.3}>
              <CostIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                ₹{place.avg_daily_cost}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          size="small"
          variant="outlined"
          color="primary"
          fullWidth
          startIcon={<DetailIcon fontSize="small" />}
          onClick={() => onViewDetails(place.id)}
        >
          View Details & Local Dishes
        </Button>
      </CardActions>
    </Card>
  );
};

