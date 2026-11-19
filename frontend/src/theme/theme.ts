import { createTheme, PaletteMode, Theme } from '@mui/material';
import { designTokens } from './tokens';

export const createAppTheme = (mode: PaletteMode = 'light'): Theme => {
  const colors = designTokens.colors;
  const currentModeColors = colors.light; // Clean, simple, light-first palette

  return createTheme({
    palette: {
      mode: 'light',
      primary: colors.primary,
      secondary: colors.secondary,
      background: {
        default: currentModeColors.background,
        paper: currentModeColors.paper,
      },
      text: {
        primary: currentModeColors.textPrimary,
        secondary: currentModeColors.textSecondary,
      },
      divider: currentModeColors.border,
    },
    typography: {
      fontFamily: designTokens.typography.fontFamily,
      h1: { fontFamily: designTokens.typography.headingFont, fontWeight: 800, color: currentModeColors.textPrimary },
      h2: { fontFamily: designTokens.typography.headingFont, fontWeight: 700, color: currentModeColors.textPrimary },
      h3: { fontFamily: designTokens.typography.headingFont, fontWeight: 700, color: currentModeColors.textPrimary },
      h4: { fontFamily: designTokens.typography.headingFont, fontWeight: 600, color: currentModeColors.textPrimary },
      h5: { fontFamily: designTokens.typography.headingFont, fontWeight: 600, color: currentModeColors.textPrimary },
      h6: { fontFamily: designTokens.typography.headingFont, fontWeight: 600, color: currentModeColors.textPrimary },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: designTokens.shape.borderRadius,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 18px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(30, 125, 92, 0.18)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: designTokens.shape.borderRadius,
            border: `1px solid ${currentModeColors.border}`,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.06)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 8,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 18,
            backgroundImage: 'none',
          },
        },
      },
    },
  });
};
