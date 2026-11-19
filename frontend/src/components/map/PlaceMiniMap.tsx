import React, { useEffect, useRef } from 'react';
import { Box, Button, Stack, Typography, useTheme } from '@mui/material';
import { OpenInNew as DirectionsIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import L from 'leaflet';

interface PlaceMiniMapProps {
  lat: number;
  lng: number;
  placeName: string;
  category?: string;
  destinationName?: string;
  height?: number | string;
}

export const PlaceMiniMap: React.FC<PlaceMiniMapProps> = ({
  lat,
  lng,
  placeName,
  category = 'heritage',
  destinationName,
  height = 320,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const theme = useTheme();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Custom Emerald Pin Marker
      const customIcon = L.divIcon({
        className: 'custom-single-pin',
        html: `
          <div style="
            background: linear-gradient(135deg, #1E7D5C 0%, #059669 100%);
            color: #FFFFFF;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            border: 2.5px solid #FFFFFF;
            box-shadow: 0 4px 14px rgba(0,0,0,0.35);
          ">
            📍
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });

      const popupHtml = `
        <div style="font-family: inherit; min-width: 170px;">
          <div style="font-size: 13px; font-weight: 800; color: #0F172A; margin-bottom: 2px;">
            ${placeName}
          </div>
          <div style="font-size: 11px; color: #64748B; text-transform: capitalize;">
            ${destinationName ? `${destinationName} • ` : ''}${category.replace('_', ' ')}
          </div>
        </div>
      `;

      L.marker([lat, lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupHtml)
        .openPopup();

      mapInstanceRef.current = map;

      // Invalidate map size after mount so Leaflet calculates viewport correctly inside MUI Dialogs
      const timer1 = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      const timer2 = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 450);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    } catch (e) {
      console.error('Error initializing Leaflet map in PlaceMiniMap:', e);
    }
  }, [lat, lng, placeName, category, destinationName]);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <Box
      sx={{
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        minHeight: 280,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        backgroundColor: '#F8FAFC',
      }}
    >
      {/* Live Leaflet Map Container */}
      <Box sx={{ flex: 1, minHeight: 220, position: 'relative', width: '100%' }}>
        <div
          ref={mapContainerRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}
        />
      </Box>

      {/* Clean Coordinates & Directions Footer Bar */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
        sx={{
          p: 1.2,
          px: 1.8,
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          zIndex: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.6}>
          <LocationIcon sx={{ color: '#1E7D5C', fontSize: 16 }} />
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', fontSize: '0.74rem' }}>
            GPS: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
          </Typography>
        </Stack>

        <Button
          component="a"
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
          endIcon={<DirectionsIcon sx={{ fontSize: '13px !important' }} />}
          sx={{
            py: 0.3,
            px: 1,
            borderRadius: 1.5,
            fontWeight: 700,
            fontSize: '0.72rem',
            color: '#1E7D5C',
            backgroundColor: '#F0FDF4',
            border: '1px solid #DCFCE7',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#DCFCE7',
              borderColor: '#BBF7D0',
            },
          }}
        >
          Open in Maps
        </Button>
      </Stack>
    </Box>
  );
};
