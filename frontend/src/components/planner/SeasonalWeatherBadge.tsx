import React, { useEffect, useState } from 'react';
import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
import {
  fetchLiveWeather,
  getSeasonalWeather,
  LiveWeatherData,
} from '../../utils/travelEnhancements';

interface SeasonalWeatherBadgeProps {
  destinationName: string;
  stateName?: string;
  variant?: 'compact' | 'detailed';
  latitude?: number | string | null;
  longitude?: number | string | null;
}

export const SeasonalWeatherBadge: React.FC<SeasonalWeatherBadgeProps> = ({
  destinationName,
  stateName,
  variant = 'compact',
  latitude,
  longitude,
}) => {
  const fallback = getSeasonalWeather(destinationName, stateName);
  const [liveWeather, setLiveWeather] = useState<LiveWeatherData | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (latitude != null && longitude != null) {
      fetchLiveWeather(latitude, longitude).then((res) => {
        if (isMounted && res) {
          setLiveWeather(res);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [latitude, longitude]);

  const displayIcon = liveWeather?.icon || fallback.icon;
  const displayTemp = liveWeather ? `${liveWeather.currentTemp}°C` : fallback.temperature;
  const displayCondition = liveWeather ? liveWeather.conditionText : fallback.condition;
  const isLive = Boolean(liveWeather);

  if (variant === 'compact') {
    const tooltipText = isLive
      ? `🟢 Live Satellite Weather: ${displayTemp} (${displayCondition}) • High: ${liveWeather?.maxTemp ?? '--'}°C / Low: ${liveWeather?.minTemp ?? '--'}°C • Humidity: ${liveWeather?.humidity ?? '--'}%`
      : `${fallback.seasonLabel} • ${fallback.advisoryTip}`;

    return (
      <Tooltip title={tooltipText} arrow>
        <Chip
          label={`${isLive ? '🟢 ' : ''}${displayIcon} ${displayTemp} • ${displayCondition}`}
          size="small"
          sx={{
            backgroundColor: isLive ? '#ECFDF5' : '#F0FDF4',
            color: '#166534',
            border: `1px solid ${isLive ? '#6EE7B7' : '#BBF7D0'}`,
            fontWeight: 800,
            fontSize: '0.72rem',
            height: 24,
            cursor: 'help',
          }}
        />
      </Tooltip>
    );
  }

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        backgroundColor: '#F8FAFC',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Typography sx={{ fontSize: '1.5rem', lineHeight: 1 }}>
          {displayIcon}
        </Typography>
        <Box>
          <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#1E293B', fontSize: '0.92rem' }}>
              {displayTemp}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: isLive ? '#065F46' : '#166534',
                backgroundColor: isLive ? '#D1FAE5' : '#DCFCE7',
                px: 0.8,
                py: 0.2,
                borderRadius: 1,
                border: isLive ? '1px solid #A7F3D0' : 'none',
              }}
            >
              {isLive ? `🟢 Live: ${displayCondition}` : displayCondition}
            </Typography>
            {isLive && liveWeather?.maxTemp != null && liveWeather?.minTemp != null && (
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                (H: {liveWeather.maxTemp}° / L: {liveWeather.minTemp}°)
              </Typography>
            )}
          </Stack>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mt: 0.3 }}>
            {isLive
              ? `Live Open-Meteo Satellite Feed • Best Season: ${fallback.bestWindow}`
              : `Seasonal Window: ${fallback.bestWindow}`}
          </Typography>
        </Box>
      </Stack>

      <Typography
        variant="caption"
        sx={{
          color: '#475569',
          fontStyle: 'italic',
          maxWidth: { xs: '100%', sm: '42%' },
          textAlign: { sm: 'right' },
        }}
      >
        💡 {fallback.advisoryTip}
      </Typography>
    </Box>
  );
};
