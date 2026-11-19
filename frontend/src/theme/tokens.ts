/**
 * Centralized Design Tokens with a clean, light, simple color palette.
 * Inspired by fresh travel aesthetics: crisp white, soft sage/emerald green,
 * airy slate neutrals, and gentle warm accents.
 */

export const designTokens = {
  colors: {
    primary: {
      main: '#1E7D5C', // Clean, fresh travel emerald/sage green (from video inspiration)
      light: '#2EA57B',
      dark: '#145E44',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0284C7', // Fresh sky blue
      light: '#38BDF8',
      dark: '#0369A1',
      contrastText: '#FFFFFF',
    },
    teal: {
      main: '#0D9488',
      light: '#14B8A6',
      dark: '#0F766E',
    },
    light: {
      background: '#F9FAFB', // Soft airy light canvas
      paper: '#FFFFFF',      // Crisp clean white cards
      textPrimary: '#1E293B', // Clean slate charcoal
      textSecondary: '#64748B', // Soft muted slate
      border: '#E5E7EB',      // Gentle light border
    },
    dark: {
      background: '#F9FAFB', // Unified light-first plain canvas
      paper: '#FFFFFF',
      textPrimary: '#1E293B',
      textSecondary: '#64748B',
      border: '#E5E7EB',
    },
    categories: {
      beach: '#0284C7',
      hill_station: '#10B981',
      temple: '#D97706',
      wildlife: '#16A34A',
      heritage: '#7C3AED',
      adventure: '#EA580C',
      city: '#475569',
      nature: '#059669',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    headingFont: '"Outfit", "Plus Jakarta Sans", sans-serif',
  },
  shape: {
    borderRadius: 14,
  },
};
