import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { DirectionsCar as CarIcon } from '@mui/icons-material';
import { calculateDistanceKm, getDriveEstimate } from '../../utils/travelEnhancements';

interface TransitConnectorProps {
  fromCoords?: { lat: number | string | null; lng: number | string | null };
  toCoords?: { lat: number | string | null; lng: number | string | null };
  fromName?: string;
  toName?: string;
}

export const TransitConnector: React.FC<TransitConnectorProps> = ({
  fromCoords,
  toCoords,
  fromName,
  toName,
}) => {
  const dist = calculateDistanceKm(
    fromCoords?.lat,
    fromCoords?.lng,
    toCoords?.lat,
    toCoords?.lng
  );
  const estimate = getDriveEstimate(dist);

  return (
    <Box sx={{ position: 'relative', py: 1.2, pl: 3.5, pr: 1 }}>
      {/* Dashed Vertical Track */}
      <Box
        sx={{
          position: 'absolute',
          left: 20,
          top: 0,
          bottom: 0,
          width: '2px',
          borderLeft: '2px dashed #CBD5E1',
        }}
      />

      <Stack direction="row" alignItems="center" spacing={1.2}>
        <Chip
          icon={<CarIcon sx={{ fontSize: '14px !important', color: '#1E7D5C !important' }} />}
          label={`${estimate.distanceStr} • ${estimate.timeStr}`}
          size="small"
          sx={{
            backgroundColor: '#F8FAFC',
            color: '#334155',
            border: '1px solid #E2E8F0',
            fontWeight: 800,
            fontSize: '0.73rem',
            height: 26,
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: '#94A3B8',
            fontSize: '0.72rem',
            fontWeight: 600,
            display: { xs: 'none', sm: 'inline' },
          }}
        >
          {estimate.transitHint}
        </Typography>
      </Stack>
    </Box>
  );
};
