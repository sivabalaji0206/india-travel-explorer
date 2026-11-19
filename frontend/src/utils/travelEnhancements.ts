/**
 * Travel Enhancements Utility: Haversine Inter-Attraction Routing & Regional Weather Insights
 */

export interface DriveEstimate {
  distanceKm: number;
  distanceStr: string;
  timeStr: string;
  transitHint: string;
}

export interface WeatherInsight {
  temperature: string;
  condition: string;
  icon: string;
  seasonLabel: string;
  bestWindow: string;
  advisoryTip: string;
}

export interface LiveWeatherData {
  currentTemp: number;
  conditionText: string;
  icon: string;
  maxTemp?: number;
  minTemp?: number;
  humidity?: number;
  isLive: boolean;
}

export const WMO_WEATHER_CODES: Record<number, { text: string; icon: string }> = {
  0: { text: 'Clear Sky', icon: '☀️' },
  1: { text: 'Mainly Clear', icon: '🌤️' },
  2: { text: 'Partly Cloudy', icon: '⛅' },
  3: { text: 'Overcast', icon: '☁️' },
  45: { text: 'Foggy', icon: '🌫️' },
  48: { text: 'Depositing Rime Fog', icon: '🌫️' },
  51: { text: 'Light Drizzle', icon: '🌦️' },
  53: { text: 'Moderate Drizzle', icon: '🌦️' },
  55: { text: 'Dense Drizzle', icon: '🌧️' },
  61: { text: 'Slight Rain', icon: '🌧️' },
  63: { text: 'Moderate Rain', icon: '🌧️' },
  65: { text: 'Heavy Rain', icon: '🌧️' },
  71: { text: 'Slight Snow', icon: '❄️' },
  73: { text: 'Moderate Snow', icon: '❄️' },
  75: { text: 'Heavy Snow', icon: '❄️' },
  80: { text: 'Light Rain Showers', icon: '🌦️' },
  81: { text: 'Moderate Showers', icon: '🌧️' },
  82: { text: 'Violent Showers', icon: '⛈️' },
  95: { text: 'Thunderstorm', icon: '⛈️' },
  96: { text: 'Thunderstorm with Hail', icon: '⛈️' },
};

/**
 * Fetches real-time live satellite weather data from Open-Meteo for the destination coordinates.
 */
export async function fetchLiveWeather(
  latitude: number | string | null | undefined,
  longitude: number | string | null | undefined
): Promise<LiveWeatherData | null> {
  if (latitude == null || longitude == null) return null;
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (Number.isNaN(lat) || Number.isNaN(lon) || (lat === 0 && lon === 0)) return null;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const data = await res.json();

    const curr = data.current;
    if (!curr) return null;

    const wmo = WMO_WEATHER_CODES[curr.weather_code] || { text: 'Fair Weather', icon: '🌤️' };
    const maxTemp = data.daily?.temperature_2m_max?.[0];
    const minTemp = data.daily?.temperature_2m_min?.[0];

    return {
      currentTemp: Math.round(curr.temperature_2m * 10) / 10,
      conditionText: wmo.text,
      icon: wmo.icon,
      maxTemp: maxTemp != null ? Math.round(maxTemp) : undefined,
      minTemp: minTemp != null ? Math.round(minTemp) : undefined,
      humidity: curr.relative_humidity_2m,
      isLive: true,
    };
  } catch {
    // If network is offline or blocked, gracefully fallback to regional seasonal climate
    return null;
  }
}

/**
 * Calculates straight-line / road-calibrated Haversine distance in kilometers between two GPS coordinates.
 */
export function calculateDistanceKm(
  lat1: number | string | null | undefined,
  lon1: number | string | null | undefined,
  lat2: number | string | null | undefined,
  lon2: number | string | null | undefined
): number | null {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);

  if (
    Number.isNaN(nLat1) ||
    Number.isNaN(nLon1) ||
    Number.isNaN(nLat2) ||
    Number.isNaN(nLon2) ||
    (nLat1 === 0 && nLon1 === 0) ||
    (nLat2 === 0 && nLon2 === 0)
  ) {
    return null;
  }

  const R = 6371; // Earth's radius in km
  const dLat = ((nLat2 - nLat1) * Math.PI) / 180;
  const dLon = ((nLon2 - nLon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((nLat1 * Math.PI) / 180) *
      Math.cos((nLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const rawDist = R * c;

  // Road circuit winding multiplier for Indian highways & city roads (~1.22x direct haversine)
  const roadKm = Math.round(rawDist * 1.22 * 10) / 10;
  return Math.max(0.8, roadKm);
}

/**
 * Derives realistic driving and commute time estimates calibrated for Indian traffic & transit.
 */
export function getDriveEstimate(distanceKm: number | null): DriveEstimate {
  if (!distanceKm || distanceKm <= 0) {
    return {
      distanceKm: 4.5,
      distanceStr: '~4–5 km',
      timeStr: '~15 mins auto/cab',
      transitHint: 'Short commute via local auto-rickshaw or taxi',
    };
  }

  const distFormatted = distanceKm < 10 ? distanceKm.toFixed(1) : Math.round(distanceKm).toString();

  if (distanceKm <= 2.5) {
    return {
      distanceKm,
      distanceStr: `${distFormatted} km`,
      timeStr: '~8–12 mins auto ride',
      transitHint: 'Short ride via shared auto or walking distance',
    };
  }

  if (distanceKm <= 12) {
    const mins = Math.max(12, Math.round((distanceKm / 28) * 60));
    return {
      distanceKm,
      distanceStr: `${distFormatted} km`,
      timeStr: `~${mins} mins commute`,
      transitHint: 'City auto-rickshaw, app cab, or local bus',
    };
  }

  if (distanceKm <= 40) {
    const mins = Math.max(25, Math.round((distanceKm / 42) * 60));
    return {
      distanceKm,
      distanceStr: `${distFormatted} km`,
      timeStr: `~${mins} mins drive`,
      transitHint: 'Comfortable commute via private taxi or express bus',
    };
  }

  // Inter-district transfer
  const mins = Math.round((distanceKm / 52) * 60);
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  const timeStr = `~${hrs} hr ${remMins > 0 ? `${remMins} min` : ''} scenic drive`;

  return {
    distanceKm,
    distanceStr: `${distFormatted} km`,
    timeStr,
    transitHint: 'Inter-city highway route via state express bus or chauffeur cab',
  };
}

/**
 * Returns authentic regional climate conditions, temperature, and best travel season for Indian destinations.
 */
export function getSeasonalWeather(destinationName: string, stateName?: string): WeatherInsight {
  const dest = (destinationName || '').toLowerCase();
  const state = (stateName || '').toLowerCase();

  // 1. Himalayan, High Altitude & Cool Hill Stations
  if (
    dest.includes('leh') ||
    dest.includes('ladakh') ||
    dest.includes('shimla') ||
    dest.includes('manali') ||
    dest.includes('dharamshala') ||
    dest.includes('spiti') ||
    dest.includes('kashmir') ||
    dest.includes('gulmarg') ||
    dest.includes('pahalgam') ||
    dest.includes('srinagar') ||
    dest.includes('gangtok') ||
    dest.includes('darjeeling') ||
    dest.includes('mussoorie') ||
    dest.includes('nainital') ||
    state.includes('himachal') ||
    state.includes('uttarakhand') ||
    state.includes('ladakh') ||
    state.includes('jammu')
  ) {
    return {
      temperature: '4°C – 16°C',
      condition: 'Crisp Mountain Breeze',
      icon: '❄️',
      seasonLabel: 'Cool Alpine Window',
      bestWindow: 'March – June & Oct – Feb',
      advisoryTip: 'Warm woolens & thermal layers recommended for evening strolls.',
    };
  }

  // 2. Western Ghats & Southern Hill Stations (Munnar, Ooty, Coorg, Wayanad, Kodaikanal, Araku)
  if (
    dest.includes('munnar') ||
    dest.includes('ooty') ||
    dest.includes('coorg') ||
    dest.includes('wayanad') ||
    dest.includes('kodaikanal') ||
    dest.includes('araku') ||
    dest.includes('chikmagalur') ||
    dest.includes('horsley') ||
    dest.includes('yercaud')
  ) {
    return {
      temperature: '15°C – 23°C',
      condition: 'Misty & Pleasant',
      icon: '⛰️',
      seasonLabel: 'Mild Highland Climate',
      bestWindow: 'September – March',
      advisoryTip: 'Refreshing morning mist; light jacket or sweater recommended.',
    };
  }

  // 3. Coastal & Island Destinations (Goa, Andaman, Vizag, Gokarna, Alappuzha, Kovalam, Pondicherry)
  if (
    dest.includes('goa') ||
    dest.includes('havelock') ||
    dest.includes('port blair') ||
    dest.includes('neil island') ||
    dest.includes('andaman') ||
    dest.includes('visakhapatnam') ||
    dest.includes('vizag') ||
    dest.includes('gokarna') ||
    dest.includes('pondicherry') ||
    dest.includes('puducherry') ||
    dest.includes('puri') ||
    dest.includes('kovalam') ||
    dest.includes('alappuzha') ||
    dest.includes('varkala')
  ) {
    return {
      temperature: '24°C – 31°C',
      condition: 'Pleasant Coastal Breeze',
      icon: '🏖️',
      seasonLabel: 'Prime Beach Window',
      bestWindow: 'October – March',
      advisoryTip: 'Great water visibility; late afternoons best for sunsets & coastal walks.',
    };
  }

  // 4. Arid & Desert Heritage (Rajasthan, Kutch, Hampi, Lepakshi, Gandikota)
  if (
    dest.includes('jaipur') ||
    dest.includes('udaipur') ||
    dest.includes('jaisalmer') ||
    dest.includes('jodhpur') ||
    dest.includes('bikaner') ||
    dest.includes('pushkar') ||
    dest.includes('kutch') ||
    dest.includes('gandikota') ||
    dest.includes('hampi') ||
    dest.includes('badami') ||
    state.includes('rajasthan')
  ) {
    return {
      temperature: '18°C – 28°C',
      condition: 'Bright & Clear Skies',
      icon: '☀️',
      seasonLabel: 'Comfortable Heritage Season',
      bestWindow: 'October – March',
      advisoryTip: 'Sunny afternoons; cool evenings. Sun protection & hydration advised.',
    };
  }

  // 5. Deccan & Spiritual Heritage (Tirupati, Madurai, Varanasi, Mysore, Aurangabad, Bhubaneswar)
  if (
    dest.includes('tirupati') ||
    dest.includes('tirumala') ||
    dest.includes('madurai') ||
    dest.includes('thanjavur') ||
    dest.includes('mysore') ||
    dest.includes('varanasi') ||
    dest.includes('ayodhya') ||
    dest.includes('bhubaneswar') ||
    dest.includes('aurangabad') ||
    state.includes('andhra') ||
    state.includes('tamil nadu') ||
    state.includes('karnataka')
  ) {
    return {
      temperature: '21°C – 29°C',
      condition: 'Pleasant & Sunny',
      icon: '🌤️',
      seasonLabel: 'Ideal Pilgrimage & Tour Season',
      bestWindow: 'October – March',
      advisoryTip: 'Early morning visits (7–9 AM) provide the calmest temple darshans.',
    };
  }

  // 6. Northeast India & Forest Sanctuaries (Kaziranga, Shillong, Cherrapunji, Tawang, Jim Corbett)
  if (
    dest.includes('shillong') ||
    dest.includes('cherrapunji') ||
    dest.includes('kaziranga') ||
    dest.includes('tawang') ||
    dest.includes('corbett') ||
    dest.includes('kanha') ||
    state.includes('meghalaya') ||
    state.includes('assam') ||
    state.includes('arunachal')
  ) {
    return {
      temperature: '14°C – 22°C',
      condition: 'Lush & Crisp Atmosphere',
      icon: '🌿',
      seasonLabel: 'Post-Monsoon Greenery',
      bestWindow: 'October – April',
      advisoryTip: 'Crystal-clear waterfall flows and high wildlife sighting chances.',
    };
  }

  // General Pan-India Standard Season
  return {
    temperature: '22°C – 29°C',
    condition: 'Pleasant Sightseeing Weather',
    icon: '☀️',
    seasonLabel: 'Prime Travel Season',
    bestWindow: 'October – March',
    advisoryTip: 'Evenings are cool and pleasant; plan major walking tours before noon.',
  };
}
