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
  ConfirmationNumberOutlined as TicketIcon,
  Diamond as GemIcon,
  InfoOutlined as DetailIcon,
  LocationOn as LocationIcon,
  PaymentsOutlined as CostIcon,
} from '@mui/icons-material';
import type { Place } from '../../api/types';
import { designTokens } from '../../theme/tokens';

interface PlaceCardProps {
  place: Place;
  onViewDetails: (placeId: number) => void;
}

const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
  beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  temple: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
  heritage: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
  wildlife: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80',
  hill_station: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  nature: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80',
  adventure: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  city: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
};

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onViewDetails }) => {
  const theme = useTheme();
  const categoryColor = designTokens.colors.categories[place.category] || theme.palette.primary.main;
  const imageUrl = place.image_url || FALLBACK_CATEGORY_IMAGES[place.category] || FALLBACK_CATEGORY_IMAGES.nature;

  const feeAmount = place.entry_fee !== null && place.entry_fee !== undefined ? Number(place.entry_fee) : 0;
  const hasTicket = !Number.isNaN(feeAmount) && feeAmount > 0;
  const isFree = !hasTicket;
  const feeLabel = hasTicket ? `₹${Math.round(feeAmount)} / person` : 'Free Entry';
  const dailyExpenseLabel = `₹${Math.round(Number(place.avg_daily_cost || 200))}`;

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
          transform: 'translateY(-5px)',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 12px 28px rgba(0,0,0,0.6)'
              : '0 12px 28px rgba(224, 93, 56, 0.16)',
          '& .place-image': {
            transform: 'scale(1.06)',
          },
        },
      }}
    >
      {/* Attraction Image Header */}
      <Box sx={{ position: 'relative', height: 180, overflow: 'hidden' }}>
        <CardMedia
          component="img"
          className="place-image"
          height="180"
          image={imageUrl}
          alt={place.name}
          referrerPolicy="no-referrer"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_CATEGORY_IMAGES[place.category] || FALLBACK_CATEGORY_IMAGES.nature;
          }}
          sx={{
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
        />

        {/* Subtle Dark Gradient Scrim */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
          }}
        />

        {/* Floating Badges */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ position: 'absolute', top: 10, left: 10, right: 10 }}
        >
          <Chip
            size="small"
            label={place.category.replace('_', ' ').toUpperCase()}
            sx={{
              backgroundColor: categoryColor,
              color: '#fff',
              fontWeight: 800,
              fontSize: '0.68rem',
              height: 22,
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          />

          {place.is_hidden_gem && (
            <Chip
              size="small"
              icon={<GemIcon sx={{ fontSize: '13px !important', color: '#fff !important' }} />}
              label="Hidden Gem"
              color="secondary"
              sx={{
                fontSize: '0.68rem',
                height: 22,
                fontWeight: 800,
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            />
          )}
        </Stack>

        {/* Location chip on image bottom */}
        <Box sx={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <LocationIcon sx={{ fontSize: 14, color: '#fff' }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: '#fff',
                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
              }}
            >
              {place.destination_name}, {place.state_name}
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* Place Details Body */}
      <CardContent sx={{ pb: 1, pt: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, lineHeight: 1.25 }}>
          {place.name}
        </Typography>

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
          {place.description || `Verified destination attraction in ${place.state_name}.`}
        </Typography>

        {/* Differentiated Rates Row */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            pt: 1.2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
              {hasTicket ? 'Official Entry Ticket' : 'Entry Access'}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <TicketIcon sx={{ fontSize: 15, color: isFree ? '#10B981' : theme.palette.text.primary }} />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 800,
                  color: isFree ? '#10B981' : theme.palette.text.primary,
                }}
              >
                {feeLabel}
              </Typography>
            </Stack>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
              Est. Visit Expense
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.3} justifyContent="flex-end">
              <CostIcon sx={{ fontSize: 15, color: theme.palette.primary.main }} />
              <Typography variant="body2" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                {dailyExpenseLabel}
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
          sx={{ borderRadius: 2 }}
        >
          View Details & Dishes
        </Button>
      </CardActions>
    </Card>
  );
};
