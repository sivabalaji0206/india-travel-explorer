import React, { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  ConnectingAirports as LogoIcon,
  BookmarkBorder as SavedIcon,
  AutoAwesome as PlannerIcon,
  Explore as ExploreIcon,
  LocationCity as StatesIcon,
} from '@mui/icons-material';
import { useAppTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenPlanner: (stateId?: number) => void;
  onNavigate: (section: 'states' | 'places' | 'plans') => void;
  activeSection: 'states' | 'places' | 'plans';
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenPlanner,
  onNavigate,
  activeSection,
}) => {
  const theme = useTheme();
  const { mode, toggleTheme } = useAppTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 70 }}>
          {/* Logo */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ cursor: 'pointer' }}
            onClick={() => onNavigate('states')}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                backgroundColor: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(224, 93, 56, 0.35)',
              }}
            >
              <LogoIcon fontSize="medium" />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  letterSpacing: -0.5,
                  color: theme.palette.text.primary,
                  lineHeight: 1.1,
                }}
              >
                India Travel Explorer
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                Smart Travel Companion
              </Typography>
            </Box>
          </Stack>

          {/* Navigation links */}
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button
              startIcon={<StatesIcon />}
              onClick={() => onNavigate('states')}
              variant={activeSection === 'states' ? 'contained' : 'text'}
              color={activeSection === 'states' ? 'primary' : 'inherit'}
              sx={{ color: activeSection === 'states' ? '#fff' : theme.palette.text.secondary }}
            >
              States
            </Button>
            <Button
              startIcon={<ExploreIcon />}
              onClick={() => onNavigate('places')}
              variant={activeSection === 'places' ? 'contained' : 'text'}
              color={activeSection === 'places' ? 'primary' : 'inherit'}
              sx={{ color: activeSection === 'places' ? '#fff' : theme.palette.text.secondary }}
            >
              Attractions
            </Button>
            <Button
              startIcon={<PlannerIcon />}
              onClick={() => onOpenPlanner()}
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 700,
                backgroundColor: mode === 'dark' ? 'rgba(224, 93, 56, 0.15)' : 'rgba(224, 93, 56, 0.08)',
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(224, 93, 56, 0.25)' : 'rgba(224, 93, 56, 0.15)',
                },
              }}
            >
              AI Trip Planner
            </Button>
            <Button
              startIcon={<SavedIcon />}
              onClick={() => {
                if (isAuthenticated) {
                  onNavigate('plans');
                } else {
                  onOpenAuth();
                }
              }}
              variant={activeSection === 'plans' ? 'contained' : 'text'}
              color={activeSection === 'plans' ? 'primary' : 'inherit'}
              sx={{ color: activeSection === 'plans' ? '#fff' : theme.palette.text.secondary }}
            >
              My Plans
            </Button>
          </Stack>

          {/* Right actions (Theme Toggle & Auth) */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Tooltip title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}>
              <IconButton onClick={toggleTheme} color="inherit" sx={{ color: theme.palette.text.secondary }}>
                {mode === 'light' ? <DarkIcon /> : <LightIcon />}
              </IconButton>
            </Tooltip>

            {isAuthenticated && user ? (
              <>
                <Button
                  onClick={handleMenuOpen}
                  startIcon={
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: theme.palette.primary.main,
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  sx={{ color: theme.palette.text.primary, fontWeight: 600 }}
                >
                  {user.name.split(' ')[0]}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem disabled>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      {user.email}
                    </Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      onNavigate('plans');
                      handleMenuClose();
                    }}
                  >
                    My Saved Itineraries
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                onClick={onOpenAuth}
                sx={{ borderRadius: 10, px: 2.5 }}
              >
                Sign In
              </Button>
            )}
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

