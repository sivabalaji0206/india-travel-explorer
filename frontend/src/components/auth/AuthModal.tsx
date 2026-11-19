import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  EmailOutlined as EmailIcon,
  LockOutlined as LockIcon,
  PersonOutline as PersonIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { TravelerMascot } from './TravelerMascot';
import { designTokens } from '../../theme/tokens';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
  const { login, register } = useAuth();

  // 0: Log in (Mascot on Left, Form on Right)
  // 1: Sign up (Form on Left, Mascot on Right)
  const [tab, setTab] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const isLogin = tab === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onClose();
      // Reset form on success
      setName('');
      setEmail('');
      setPassword('');
      setShowPassword(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchToSignup = () => {
    setTab(1);
    setError(null);
  };

  const switchToLogin = () => {
    setTab(0);
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
          border: '1px solid #E5E7EB',
          maxWidth: { xs: 440, md: 780 },
        },
      }}
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(15, 23, 42, 0.25)', // Gentle, light, non-heavy backdrop
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {/* Subtle Close Button */}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 10,
            color: '#94A3B8',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            '&:hover': {
              backgroundColor: '#F1F5F9',
              color: '#334155',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        {/* Responsive Grid Layout based on the video:
            - Login: Mascot on Left, Form on Right
            - Signup: Form on Left, Mascot on Right */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: {
              xs: 'column',
              md: isLogin ? 'row' : 'row-reverse',
            },
            minHeight: { xs: 'auto', md: 450 },
            transition: 'all 0.3s ease-in-out',
          }}
        >
          {/* Traveler Animated Mascot Column (Inspired by video) */}
          <Box
            sx={{
              width: { xs: '100%', md: '45%' },
              minHeight: { xs: 180, md: 450 },
            }}
          >
            <TravelerMascot mode={isLogin ? 'login' : 'signup'} />
          </Box>

          {/* Clean Form Column */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 3, sm: 4.5 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: '#FFFFFF',
            }}
          >
            {/* Header */}
            <Box sx={{ mb: 2.5 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#1E293B',
                  fontFamily: designTokens.typography.headingFont,
                  mb: 0.75,
                }}
              >
                {isLogin ? 'Log in' : 'Sign up'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#64748B',
                  lineHeight: 1.5,
                  fontSize: '0.9rem',
                }}
              >
                {isLogin
                  ? "Hello, friend! Ready to explore? Let's get in touch!"
                  : 'Hello, friend! Join India Travel Explorer to plan your journey!'}
              </Typography>
            </Box>

            {/* Error Message */}
            {error && (
              <Alert
                severity="error"
                onClose={() => setError(null)}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  fontSize: '0.82rem',
                }}
              >
                {error}
              </Alert>
            )}

            {/* Input Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                {!isLogin && (
                  <TextField
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 2.5,
                        backgroundColor: '#F8FAFC',
                        '& fieldset': { borderColor: '#E2E8F0' },
                        '&:hover fieldset': { borderColor: '#CBD5E1' },
                      },
                    }}
                  />
                )}

                <TextField
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      backgroundColor: '#F8FAFC',
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#CBD5E1' },
                    },
                  }}
                />

                <TextField
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  size="small"
                  helperText={!isLogin ? 'Minimum 8 characters' : undefined}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: '#94A3B8' }}
                        >
                          {showPassword ? (
                            <VisibilityOff fontSize="small" />
                          ) : (
                            <Visibility fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      backgroundColor: '#F8FAFC',
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#CBD5E1' },
                    },
                  }}
                />

                {/* Clean, Simple Solid Green Button (as in video) */}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{
                    py: 1.25,
                    mt: 1,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: '#FFFFFF',
                    backgroundColor: '#1E7D5C', // Plain, clean, simple green
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: '#176449',
                      boxShadow: '0 2px 8px rgba(30, 125, 92, 0.25)',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
                  ) : isLogin ? (
                    "Let's start!"
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </Stack>
            </Box>

            {/* Bottom Toggle Link (matching video) */}
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={0.5}
              sx={{ mt: 3 }}
            >
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem' }}>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={isLogin ? switchToSignup : switchToLogin}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#1E7D5C',
                  p: 0,
                  minWidth: 'auto',
                  textDecoration: 'underline',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#145E44',
                  },
                }}
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
