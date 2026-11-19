import React, { useEffect, useRef } from 'react';
import { Box, Chip, Stack, Typography, useTheme } from '@mui/material';
import L from 'leaflet';
import { designTokens } from '../../theme/tokens';
import { DayPlan, ItineraryPlaceItem } from '../../api/types';

export interface MapAttractionPin {
  id: number;
  name: string;
  category: string;
  description: string;
  entryFee: number;
  time: string;
  isHiddenGem: boolean;
  lat: number;
  lng: number;
  dayNumber: number;
  stepNumber: number;
}

interface ItineraryMapProps {
  days: DayPlan[];
  activeDayNumber?: number | null; // null or 0 for all days, 1..N for specific day
  height?: number | string;
  onSelectPlace?: (placeId: number) => void;
}

const DAY_COLORS = [
  '#1E7D5C', // Day 1: Emerald Primary
  '#0284C7', // Day 2: Sky Blue
  '#D97706', // Day 3: Warm Amber Gold
  '#8B5CF6', // Day 4: Royal Violet
  '#0D9488', // Day 5: Deep Teal
  '#EA580C', // Day 6: Rich Sunset Orange
  '#4F46E5', // Day 7+: Indigo
];

export const ItineraryMap: React.FC<ItineraryMapProps> = ({
  days,
  activeDayNumber = null,
  height = 420,
  onSelectPlace,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const linesLayerRef = useRef<L.LayerGroup | null>(null);

  const theme = useTheme();

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [15.9129, 79.7400], // South-Central India default focus
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      linesLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      const t1 = setTimeout(() => map.invalidateSize(), 150);
      const t2 = setTimeout(() => map.invalidateSize(), 400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Plot Pins and Routes: Always display full circuit, highlight active day
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    const linesGroup = linesLayerRef.current;

    if (!map || !markersGroup || !linesGroup) return;

    markersGroup.clearLayers();
    linesGroup.clearLayers();

    const isSpecificDay = Boolean(activeDayNumber && activeDayNumber > 0);
    const allValidCoords: L.LatLngExpression[] = [];
    const activeDayCoords: L.LatLngExpression[] = [];

    days.forEach((day) => {
      const isCurrentDay = day.day_number === activeDayNumber;

      // When a specific day is selected, hide all other days for a clean, focused view
      if (isSpecificDay && !isCurrentDay) {
        return;
      }

      const dayColor = DAY_COLORS[(day.day_number - 1) % DAY_COLORS.length];
      const dayRouteCoords: L.LatLngExpression[] = [];

      day.places.forEach((p: ItineraryPlaceItem, idx: number) => {
        if (p.latitude != null && p.longitude != null) {
          const lat = Number(p.latitude);
          const lng = Number(p.longitude);

          if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0) {
            const latLng: [number, number] = [lat, lng];
            dayRouteCoords.push(latLng);
            allValidCoords.push(latLng);

            if (isCurrentDay) {
              activeDayCoords.push(latLng);
            }

            // Clean, high-contrast prominent pin
            const size = 36;
            const ringShadow = `0 0 0 4px ${dayColor}40, 0 4px 12px rgba(0,0,0,0.35)`;

            const markerHtml = `
              <div style="
                background: ${dayColor};
                color: #FFFFFF;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: ${designTokens.typography.headingFont};
                font-weight: 900;
                font-size: 14px;
                border: 3px solid #FFFFFF;
                box-shadow: ${ringShadow};
                cursor: pointer;
                transition: transform 0.2s ease;
              " onmouseover="this.style.transform='scale(1.18)'" onmouseout="this.style.transform='scale(1)'">
                ${isSpecificDay ? idx + 1 : `D${day.day_number}`}
              </div>
            `;

            const customIcon = L.divIcon({
              className: 'custom-travel-pin',
              html: markerHtml,
              iconSize: [size, size],
              iconAnchor: [size / 2, size / 2],
              popupAnchor: [0, -size / 2],
            });

            const feeLabel =
              p.entry_fee && Number(p.entry_fee) > 0 ? `₹${p.entry_fee}` : 'Free Entry';

            const popupContent = `
              <div style="font-family: inherit; min-width: 190px; padding: 4px;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
                  <span style="
                    background: ${dayColor}20;
                    color: ${dayColor};
                    font-size: 10px;
                    font-weight: 800;
                    padding: 2px 8px;
                    border-radius: 6px;
                    text-transform: uppercase;
                  ">Day ${day.day_number} • Stop #${idx + 1}</span>
                  <span style="font-size: 11px; font-weight: 800; color: #16A34A;">${feeLabel}</span>
                </div>
                <div style="font-size: 14px; font-weight: 800; color: #0F172A; margin-bottom: 4px; line-height: 1.25;">
                  ${p.place_name}
                </div>
                <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">
                  ⏰ ${p.recommended_time || 'Daytime'} • <span style="text-transform: capitalize;">${p.category.replace('_', ' ')}</span>
                </div>
                ${
                  p.description
                    ? `<div style="font-size: 11px; color: #475569; line-height: 1.4; border-top: 1px solid #E2E8F0; padding-top: 6px;">
                        ${p.description.slice(0, 110)}${p.description.length > 110 ? '…' : ''}
                      </div>`
                    : ''
                }
              </div>
            `;

            const marker = L.marker(latLng, { icon: customIcon }).bindPopup(popupContent);

            if (onSelectPlace) {
              marker.on('click', () => onSelectPlace(p.place_id));
            }

            markersGroup.addLayer(marker);
          }
        }
      });

      // Connected day polyline trail
      if (dayRouteCoords.length > 1) {
        const polyline = L.polyline(dayRouteCoords, {
          color: dayColor,
          weight: 4.5,
          opacity: 0.95,
          lineCap: 'round',
        });
        linesGroup.addLayer(polyline);
      }
    });

    // Auto-fit: If viewing a specific day with coordinates, zoom in to that day; otherwise fit all days
    const targetCoords =
      isSpecificDay && activeDayCoords.length > 0 ? activeDayCoords : allValidCoords;

    if (targetCoords.length > 0) {
      if (targetCoords.length === 1) {
        map.setView(targetCoords[0] as [number, number], 12, { animate: true });
      } else {
        const bounds = L.latLngBounds(targetCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true });
      }
    }

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
  }, [days, activeDayNumber, onSelectPlace]);

  return (
    <Box
      sx={{
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: 3.5,
        overflow: 'hidden',
        border: `1.5px solid #E2E8F0`,
        position: 'relative',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
        backgroundColor: '#F8FAFC',
      }}
    >
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Day Indicator Legend */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: 2,
          px: 1.5,
          py: 0.8,
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E293B' }}>
          🗺️ Route Corridor
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
          {activeDayNumber && activeDayNumber > 0
            ? `Viewing Day ${activeDayNumber} route only`
            : `Viewing all ${days.length} days circuit`}
        </Typography>
      </Box>
    </Box>
  );
};
