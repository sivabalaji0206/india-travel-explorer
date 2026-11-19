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
  East as ArrowIcon,
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

const CATEGORY_EMOJIS: Record<string, string> = {
  beach: '🏖️',
  temple: '🛕',
  heritage: '🏛️',
  wildlife: '🐅',
  hill_station: '⛰️',
  nature: '🌿',
  adventure: '🧭',
  city: '🏙️',
};

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, onViewDetails }) => {
  const theme = useTheme();
  const categoryColor = designTokens.colors.categories[place.category] || theme.palette.primary.main;
  const imageUrl = place.image_url || FALLBACK_CATEGORY_IMAGES[place.category] || FALLBACK_CATEGORY_IMAGES.nature;

  const feeAmount = place.entry_fee !== null && place.entry_fee !== undefined ? Number(place.entry_fee) : 0;
  const hasTicket = !Number.isNaN(feeAmount) && feeAmount > 0;
  const isFree = !hasTicket;
  const feeLabel = hasTicket ? `₹${Math.round(feeAmount)}` : 'Free Entry';
  const dailyExpenseLabel = `₹${Math.round(Number(place.avg_daily_cost || 200))}`;
  const categoryEmoji = CATEGORY_EMOJIS[place.category] || '📍';

  return (
    <Card
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
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        transition: 'transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 14px 30px rgba(30, 125, 92, 0.12)',
          borderColor: theme.palette.primary.main,
          '& .place-image': {
            transform: 'scale(1.06)',
          },
          '& .view-details-btn': {
            backgroundColor: '#1E7D5C',
            color: '#FFFFFF',
            borderColor: '#1E7D5C',
            '& .arrow-icon': {
              transform: 'translateX(3px)',
            },
          },
        },
      }}
    >
      {/* Attraction Image Header */}
      <Box sx={{ position: 'relative', height: 195, overflow: 'hidden', bgcolor: '#0F172A' }}>
        <CardMedia
          component="img"
          className="place-image"
          height="195"
          image={imageUrl}
          alt={place.name}
          referrerPolicy="no-referrer"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_CATEGORY_IMAGES[place.category] || FALLBACK_CATEGORY_IMAGES.nature;
          }}
          sx={{
            objectFit: 'cover',
            transition: 'transform 0.45s ease',
          }}
        />

        {/* Clean Gradient Scrim */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(15, 23, 42, 0.82) 0%, rgba(15, 23, 42, 0.15) 50%, rgba(0,0,0,0.2) 100%)',
          }}
        />

        {/* Floating Category & Gem Badges */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 2 }}
        >
          <Chip
            size="small"
            label={`${categoryEmoji} ${place.category.replace('_', ' ').toUpperCase()}`}
            sx={{
              backgroundColor: 'rgba(15, 23, 42, 0.72)',
              backdropFilter: 'blur(8px)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.68rem',
              height: 24,
              border: `1px solid rgba(255, 255, 255, 0.25)`,
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          />

          {place.is_hidden_gem && (
            <Chip
              size="small"
              icon={<GemIcon sx={{ fontSize: '13px !important', color: '#0EA5E9 !important' }} />}
              label="Hidden Gem"
              sx={{
                fontSize: '0.68rem',
                height: 24,
                fontWeight: 800,
                backgroundColor: 'rgba(14, 165, 233, 0.18)',
                backdropFilter: 'blur(8px)',
                color: '#E0F2FE',
                border: '1px solid rgba(14, 165, 233, 0.4)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              }}
            />
          )}
        </Stack>

        {/* Location Pin on Image Bottom */}
        <Box sx={{ position: 'absolute', bottom: 10, left: 12, right: 12, zIndex: 2 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <LocationIcon sx={{ fontSize: 14, color: '#FCD34D' }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: '#FFFFFF',
                fontSize: '0.74rem',
                textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {place.destination_name}, {place.state_name}
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* Place Details Body */}
      <CardContent sx={{ pb: 1.5, pt: 2, flexGrow: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontSize: '1.05rem',
            mb: 0.8,
            lineHeight: 1.3,
            color: '#1E293B',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {place.name}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: '#64748B',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5,
            minHeight: '3em',
            fontSize: '0.84rem',
            mb: 1.5,
          }}
        >
          {place.description || `Verified destination attraction in ${place.state_name}.`}
        </Typography>

        {/* Clean Streamlined Value Bar (Replaces clunky 2-column table) */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            p: 1.2,
            borderRadius: 2,
            backgroundColor: '#F8FAFC',
            border: '1px solid #F1F5F9',
          }}
        >
          {/* Ticket Rate */}
          <Stack direction="row" alignItems="center" spacing={0.6}>
            <TicketIcon sx={{ fontSize: 15, color: isFree ? '#10B981' : '#64748B' }} />
            <Box>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.66rem', display: 'block', lineHeight: 1 }}>
                Ticket
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  color: isFree ? '#059669' : '#1E293B',
                }}
              >
                {feeLabel}
              </Typography>
            </Box>
          </Stack>

          {/* Visit Cost */}
          <Stack direction="row" alignItems="center" spacing={0.6}>
            <CostIcon sx={{ fontSize: 15, color: '#1E7D5C' }} />
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.66rem', display: 'block', lineHeight: 1 }}>
                Est. Daily
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#1E7D5C' }}>
                ~{dailyExpenseLabel}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          size="small"
          variant="outlined"
          fullWidth
          className="view-details-btn"
          endIcon={<ArrowIcon className="arrow-icon" sx={{ fontSize: 16, transition: 'transform 0.2s ease' }} />}
          onClick={() => onViewDetails(place.id)}
          sx={{
            borderRadius: 2,
            fontWeight: 700,
            fontSize: '0.82rem',
            py: 0.8,
            color: '#1E7D5C',
            borderColor: '#CBD5E1',
            backgroundColor: '#F8FAFC',
            textTransform: 'none',
            transition: 'all 0.25s ease',
          }}
        >
          View Details & Dishes
        </Button>
      </CardActions>
    </Card>
  );
};
