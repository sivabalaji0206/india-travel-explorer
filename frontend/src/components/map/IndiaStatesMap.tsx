import React, { useEffect, useRef } from 'react';
import { Box, Button, Chip, Stack, Typography, useTheme } from '@mui/material';
import { AutoAwesome as PlannerIcon, Explore as ExploreIcon } from '@mui/icons-material';
import L from 'leaflet';
import { State } from '../../api/types';
import { getStateGallery } from '../../data/stateImages';
import { designTokens } from '../../theme/tokens';

interface IndiaStatesMapProps {
  states: State[];
  onExploreState: (stateId: number) => void;
  onPlanTripForState: (stateId: number) => void;
  height?: number | string;
}

const STATE_COORDINATES: Record<string, [number, number]> = {
  'Andaman and Nicobar Islands': [11.6234, 92.7265],
  'Andhra Pradesh': [15.9129, 79.740],
  'Arunachal Pradesh': [27.0844, 93.6053],
  Assam: [26.2006, 92.9376],
  Bihar: [25.0961, 85.3131],
  Chandigarh: [30.7333, 76.7794],
  Chhattisgarh: [21.2787, 81.8661],
  'Dadra and Nagar Haveli and Daman and Diu': [20.4283, 72.8397],
  Delhi: [28.6139, 77.209],
  Goa: [15.2993, 74.124],
  Gujarat: [22.2587, 71.1924],
  Haryana: [29.0588, 76.0856],
  'Himachal Pradesh': [31.1048, 77.1734],
  'Jammu and Kashmir': [34.0837, 74.7973],
  Jharkhand: [23.6102, 85.2799],
  Karnataka: [15.3173, 75.7139],
  Kerala: [10.8505, 76.2711],
  Ladakh: [34.1526, 77.5771],
  Lakshadweep: [10.5667, 72.6417],
  'Madhya Pradesh': [22.9734, 78.6569],
  Maharashtra: [19.7515, 75.7139],
  Manipur: [24.6637, 93.9063],
  Meghalaya: [25.467, 91.3662],
  Mizoram: [23.1645, 92.9376],
  Nagaland: [26.1584, 94.5624],
  Odisha: [20.9517, 85.0985],
  Puducherry: [11.9416, 79.8083],
  Punjab: [31.1471, 75.3412],
  Rajasthan: [27.0238, 74.2179],
  Sikkim: [27.533, 88.5122],
  'Tamil Nadu': [11.1271, 78.6569],
  Telangana: [18.1124, 79.0193],
  Tripura: [23.9408, 91.9882],
  'Uttar Pradesh': [26.8467, 80.9462],
  Uttarakhand: [30.0668, 79.0193],
  'West Bengal': [22.9868, 87.855],
};

export const IndiaStatesMap: React.FC<IndiaStatesMapProps> = ({
  states,
  onExploreState,
  onPlanTripForState,
  height = 560,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const theme = useTheme();

  // Initialize Map of India
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [22.9734, 78.6569], // Central India
        zoom: 5,
        minZoom: 4,
        maxZoom: 12,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update State Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;

    if (!map || !markersGroup) return;
    markersGroup.clearLayers();

    states.forEach((st) => {
      const coords = STATE_COORDINATES[st.name];
      if (!coords) return;

      const gallery = getStateGallery(st.name);
      const coverUrl =
        gallery[0]?.url ||
        'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=400&q=80';

      // Compact, elegant circular pin to prevent collisions in dense regions
      const iconHtml = `
        <div style="
          background-color: #1E7D5C;
          color: #FFFFFF;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: ${designTokens.typography.headingFont};
          font-weight: 800;
          font-size: 11px;
          border: 2px solid #FFFFFF;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.15s ease, background-color 0.15s ease;
        " onmouseover="this.style.transform='scale(1.25)'; this.style.backgroundColor='#16654A';" onmouseout="this.style.transform='scale(1)'; this.style.backgroundColor='#1E7D5C';">
          ${st.place_count}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'state-map-pin',
        html: iconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
      });

      const popupContent = document.createElement('div');
      popupContent.style.minWidth = '220px';
      popupContent.style.fontFamily = designTokens.typography.fontFamily;

      popupContent.innerHTML = `
        <div style="border-radius: 10px; overflow: hidden; margin-bottom: 8px;">
          <img src="${coverUrl}" style="width: 100%; height: 110px; object-fit: cover;" alt="${st.name}" />
        </div>
        <div style="padding: 2px;">
          <div style="font-size: 10px; font-weight: 700; color: #1E7D5C; text-transform: uppercase;">
            ${st.region || 'Indian Territory'}
          </div>
          <div style="font-size: 15px; font-weight: 800; color: #1E293B; margin-bottom: 2px;">
            ${st.name}
          </div>
          <div style="font-size: 12px; color: #64748B; margin-bottom: 10px;">
            ${st.place_count} verified attractions
          </div>
          <div style="display: flex; gap: 6px;">
            <button id="btn-explore-${st.id}" style="
              flex: 1;
              padding: 6px 10px;
              background: #F8FAFC;
              border: 1px solid #CBD5E1;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 700;
              color: #334155;
              cursor: pointer;
            ">Explore (${st.place_count})</button>
            <button id="btn-plan-${st.id}" style="
              flex: 1;
              padding: 6px 10px;
              background: #1E7D5C;
              border: none;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 700;
              color: #FFFFFF;
              cursor: pointer;
            ">Plan Trip</button>
          </div>
        </div>
      `;

      const marker = L.marker(coords, { icon: customIcon })
        .bindTooltip(`<b>${st.name}</b> (${st.place_count} spots)`, {
          direction: 'top',
          offset: [0, -14],
        })
        .bindPopup(popupContent);

      marker.on('popupopen', () => {
        const exploreBtn = document.getElementById(`btn-explore-${st.id}`);
        const planBtn = document.getElementById(`btn-plan-${st.id}`);
        if (exploreBtn) {
          exploreBtn.onclick = () => onExploreState(st.id);
        }
        if (planBtn) {
          planBtn.onclick = () => onPlanTripForState(st.id);
        }
      });

      markersGroup.addLayer(marker);
    });
  }, [states, onExploreState, onPlanTripForState]);

  return (
    <Box
      sx={{
        width: '100%',
        height,
        borderRadius: 3.5,
        overflow: 'hidden',
        border: `1.5px solid ${theme.palette.divider}`,
        position: 'relative',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
      }}
    >
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
};
