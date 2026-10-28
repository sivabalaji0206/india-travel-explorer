import { createTheme, PaletteMode, Theme } from '@mui/material';
import { designTokens } from './tokens';

export const createAppTheme = (mode: PaletteMode): Theme => {
  const isDark = mode === 'dark';
  const colors = designTokens.colors;
  const currentModeColors = isDark ? colors.dark : colors.light;

  return createTheme({
    palette: {
      mode,
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
      h1: { fontFamily: designTokens.typography.headingFont, fontWeight: 800 },
      h2: { fontFamily: designTokens.typography.headingFont, fontWeight: 700 },
      h3: { fontFamily: designTokens.typography.headingFont, fontWeight: 700 },
      h4: { fontFamily: designTokens.typography.headingFont, fontWeight: 600 },
      h5: { fontFamily: designTokens.typography.headingFont, fontWeight: 600 },
      h6: { fontFamily: designTokens.typography.headingFont, fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: designTokens.shape.borderRadius,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '8px 18px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(224, 93, 56, 0.2)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: designTokens.shape.borderRadius,
            border: `1px solid ${currentModeColors.border}`,
            boxShadow: isDark
              ? '0 4px 20px rgba(0, 0, 0, 0.4)'
              : '0 4px 20px rgba(0, 0, 0, 0.04)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: isDark
                ? '0 12px 30px rgba(0, 0, 0, 0.6)'
                : '0 12px 30px rgba(0, 0, 0, 0.08)',
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
            borderRadius: 16,
            backgroundImage: 'none',
          },
        },
      },
    },
  });
};
