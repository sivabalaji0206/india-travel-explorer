import React, { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAppTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { designTokens } from '../../theme/tokens';

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
  const isDark = theme.palette.mode === 'dark';
  const { mode, toggleTheme } = useAppTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

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

  const handleMobileNav = (section: 'states' | 'places' | 'plans') => {
    onNavigate(section);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: '#FFFFFF',
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          zIndex: 1200,
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: 72 }}>
            {/* Left: Brand Identity */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => onNavigate('states')}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.5,
                  backgroundColor: '#1E7D5C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(30, 125, 92, 0.25)',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <LogoIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontFamily: designTokens.typography.headingFont,
                    letterSpacing: -0.3,
                    color: '#1E293B',
                    lineHeight: 1.1,
                  }}
                >
                  India Travel Explorer
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#1E7D5C',
                    fontWeight: 600,
                    letterSpacing: 0.3,
                    display: 'block',
                  }}
                >
                  Smart Travel Companion
                </Typography>
              </Box>
            </Stack>

            {/* Center: Desktop Navigation links */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              <Button
                startIcon={<StatesIcon fontSize="small" />}
                onClick={() => onNavigate('states')}
                variant={activeSection === 'states' ? 'contained' : 'text'}
                color={activeSection === 'states' ? 'primary' : 'inherit'}
                sx={{
                  borderRadius: 2.5,
                  px: 2,
                  py: 0.9,
                  fontWeight: activeSection === 'states' ? 700 : 600,
                  color: activeSection === 'states' ? '#FFFFFF' : theme.palette.text.secondary,
                  '&:hover': {
                    color: activeSection === 'states' ? '#FFFFFF' : theme.palette.text.primary,
                  },
                }}
              >
                States & UTs
              </Button>

              <Button
                startIcon={<ExploreIcon fontSize="small" />}
                onClick={() => onNavigate('places')}
                variant={activeSection === 'places' ? 'contained' : 'text'}
                color={activeSection === 'places' ? 'primary' : 'inherit'}
                sx={{
                  borderRadius: 2.5,
                  px: 2,
                  py: 0.9,
                  fontWeight: activeSection === 'places' ? 700 : 600,
                  color: activeSection === 'places' ? '#FFFFFF' : theme.palette.text.secondary,
                  '&:hover': {
                    color: activeSection === 'places' ? '#FFFFFF' : theme.palette.text.primary,
                  },
                }}
              >
                Attractions
              </Button>

              <Button
                startIcon={<SavedIcon fontSize="small" />}
                onClick={() => {
                  if (isAuthenticated) {
                    onNavigate('plans');
                  } else {
                    onOpenAuth();
                  }
                }}
                variant={activeSection === 'plans' ? 'contained' : 'text'}
                color={activeSection === 'plans' ? 'primary' : 'inherit'}
                sx={{
                  borderRadius: 2.5,
                  px: 2,
                  py: 0.9,
                  fontWeight: activeSection === 'plans' ? 700 : 600,
                  color: activeSection === 'plans' ? '#FFFFFF' : theme.palette.text.secondary,
                  '&:hover': {
                    color: activeSection === 'plans' ? '#FFFFFF' : theme.palette.text.primary,
                  },
                }}
              >
                My Saved Trips
              </Button>

              {/* Clean AI Trip Planner CTA */}
              <Button
                startIcon={<PlannerIcon sx={{ color: '#FFFFFF' }} />}
                onClick={() => onOpenPlanner()}
                sx={{
                  borderRadius: 2.5,
                  px: 2.2,
                  py: 0.85,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  backgroundColor: '#1E7D5C',
                  boxShadow: 'none',
                  transition: 'background-color 0.15s ease',
                  '&:hover': {
                    backgroundColor: '#176449',
                    boxShadow: '0 2px 8px rgba(30, 125, 92, 0.25)',
                  },
                }}
              >
                Plan AI Trip
              </Button>
            </Stack>

            {/* Right: Theme Toggle, User Profile & Mobile Toggle */}
            <Stack direction="row" alignItems="center" spacing={1.2}>
              <Tooltip title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}>
                <IconButton
                  onClick={toggleTheme}
                  sx={{
                    color: theme.palette.text.secondary,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                    },
                  }}
                >
                  {mode === 'light' ? <DarkIcon fontSize="small" /> : <LightIcon fontSize="small" />}
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
                          boxShadow: '0 2px 8px rgba(224, 93, 56, 0.3)',
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    }
                    sx={{
                      color: theme.palette.text.primary,
                      fontWeight: 600,
                      borderRadius: 2.5,
                      px: 1.5,
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                    }}
                  >
                    {user.name.split(' ')[0]}
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{
                      sx: {
                        borderRadius: 3,
                        mt: 1,
                        minWidth: 200,
                        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                      },
                    }}
                  >
                    <MenuItem disabled sx={{ opacity: '1 !important' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                          {user.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {user.email}
                        </Typography>
                      </Box>
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={() => {
                        onNavigate('plans');
                        handleMenuClose();
                      }}
                    >
                      <ListItemIcon>
                        <SavedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Saved Itineraries" />
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
                  sx={{
                    borderRadius: 2.5,
                    px: 2.2,
                    py: 0.8,
                    fontWeight: 700,
                    borderWidth: '1.5px',
                    '&:hover': {
                      borderWidth: '1.5px',
                    },
                  }}
                >
                  Sign In
                </Button>
              )}

              {/* Mobile Menu Hamburger */}
              <IconButton
                onClick={() => setMobileDrawerOpen(true)}
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  color: theme.palette.text.primary,
                }}
              >
                <MenuIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            p: 2.5,
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Explorer Menu
          </Typography>
          <IconButton onClick={() => setMobileDrawerOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        <List sx={{ pt: 0 }}>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={activeSection === 'states'}
              onClick={() => handleMobileNav('states')}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon>
                <StatesIcon color={activeSection === 'states' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText
                primary="States & UTs"
                primaryTypographyProps={{ fontWeight: activeSection === 'states' ? 700 : 500 }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={activeSection === 'places'}
              onClick={() => handleMobileNav('places')}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon>
                <ExploreIcon color={activeSection === 'places' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText
                primary="Attractions"
                primaryTypographyProps={{ fontWeight: activeSection === 'places' ? 700 : 500 }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 2 }}>
            <ListItemButton
              selected={activeSection === 'plans'}
              onClick={() => {
                if (isAuthenticated) {
                  handleMobileNav('plans');
                } else {
                  setMobileDrawerOpen(false);
                  onOpenAuth();
                }
              }}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon>
                <SavedIcon color={activeSection === 'plans' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText
                primary="My Saved Trips"
                primaryTypographyProps={{ fontWeight: activeSection === 'plans' ? 700 : 500 }}
              />
            </ListItemButton>
          </ListItem>
        </List>

        <Divider sx={{ mb: 2.5 }} />

        <Button
          fullWidth
          variant="contained"
          startIcon={<PlannerIcon />}
          onClick={() => {
            setMobileDrawerOpen(false);
            onOpenPlanner();
          }}
          sx={{
            py: 1.2,
            borderRadius: 2.5,
            fontWeight: 700,
            backgroundColor: '#1E7D5C',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#176449',
            },
          }}
        >
          Plan AI Trip
        </Button>
      </Drawer>
    </>
  );
};
