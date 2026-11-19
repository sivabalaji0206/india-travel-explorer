import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome as PlannerIcon,
  CalendarToday as DateIcon,
  DeleteOutline as DeleteIcon,
  East as ArrowIcon,
  EditOutlined as EditIcon,
  LocationOn as LocationIcon,
  LockOpen as AuthIcon,
  Luggage as TripIcon,
  RouteOutlined as RouteIcon,
  VisibilityOutlined as ViewIcon,
} from '@mui/icons-material';
import { plansApi } from '../../api/plansApi';
import { SavedPlanDetail, SavedPlanSummary } from '../../api/types';
import { useAuth } from '../../context/AuthContext';
import { getStateCoverImage } from '../../data/stateImages';
import { ItineraryDossierView } from './ItineraryDossierView';

interface SavedPlansViewProps {
  onOpenAuth: () => void;
  onOpenPlanner: (stateId?: number) => void;
  onViewPlanDetail?: (plan: SavedPlanDetail) => void;
  refreshTrigger?: number;
}

export const SavedPlansView: React.FC<SavedPlansViewProps> = ({
  onOpenAuth,
  onOpenPlanner,
  onViewPlanDetail,
  refreshTrigger = 0,
}) => {
  const theme = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [plans, setPlans] = useState<SavedPlanSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active full dossier view
  const [openedPlanDetail, setOpenedPlanDetail] = useState<SavedPlanDetail | null>(null);

  // Rename Dialog state
  const [renameTarget, setRenameTarget] = useState<SavedPlanSummary | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');
  const [renaming, setRenaming] = useState<boolean>(false);

  // Delete Dialog state
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchPlans = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await plansApi.listPlans();
      setPlans(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load saved plans.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [isAuthenticated, refreshTrigger]);

  const handleOpenRename = (plan: SavedPlanSummary) => {
    setRenameTarget(plan);
    setNewTitle(plan.title);
  };

  const handleSaveRename = async () => {
    if (!renameTarget || !newTitle.trim()) return;
    setRenaming(true);
    try {
      await plansApi.updatePlan(renameTarget.id, { title: newTitle.trim() });
      setPlans((prev) =>
        prev.map((p) => (p.id === renameTarget.id ? { ...p, title: newTitle.trim() } : p))
      );
      setRenameTarget(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setRenaming(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await plansApi.deletePlan(deleteTargetId);
      setPlans((prev) => prev.filter((p) => p.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleLoadAndOpenPlan = async (planId: number) => {
    setLoading(true);
    try {
      const detail = await plansApi.getPlan(planId);
      setOpenedPlanDetail(detail);
      if (onViewPlanDetail) {
        onViewPlanDetail(detail);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Box
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 4,
            border: `1px dashed #CBD5E1`,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: 'rgba(30, 125, 92, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <AuthIcon sx={{ fontSize: 34, color: '#1E7D5C' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B', mb: 1 }}>
            Sign in to Access Your Saved Plans
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', mb: 3.5, maxWidth: 480, mx: 'auto', lineHeight: 1.6 }}>
            Store multiple custom AI-generated itineraries, revisit your budgeted trips, and refine them anytime across your devices.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={onOpenAuth}
            sx={{
              borderRadius: 2.5,
              px: 4,
              py: 1.2,
              fontWeight: 800,
              backgroundColor: '#1E7D5C',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(30, 125, 92, 0.25)',
              textTransform: 'none',
              '&:hover': { backgroundColor: '#176449' },
            }}
          >
            Sign In or Register
          </Button>
        </Box>
      </Container>
    );
  }

  // If a plan is selected, render the full-screen Dossier view
  if (openedPlanDetail) {
    return (
      <ItineraryDossierView
        plan={openedPlanDetail.plan_json}
        savedPlanId={openedPlanDetail.id}
        customTitle={openedPlanDetail.title}
        onBack={() => setOpenedPlanDetail(null)}
        onPlanUpdated={(updated) => {
          setOpenedPlanDetail({
            ...openedPlanDetail,
            plan_json: updated,
          });
          fetchPlans();
        }}
        onOpenAuth={onOpenAuth}
      />
    );
  }

  return (
    <Box className="topographic-canvas" sx={{ py: 6, minHeight: '80vh' }}>
      <Container maxWidth="xl">
        {/* Header Bar */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1E293B' }}>
              My Saved Itineraries
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748B', mt: 0.5 }}>
              Welcome back, {user?.name}. Here are your customized, AI-optimized travel circuits.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<PlannerIcon />}
            onClick={() => onOpenPlanner()}
            sx={{
              borderRadius: 2.5,
              px: 3,
              py: 1.1,
              fontWeight: 800,
              fontSize: '0.88rem',
              backgroundColor: '#1E7D5C',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(30, 125, 92, 0.25)',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#176449',
                boxShadow: '0 4px 14px rgba(30, 125, 92, 0.35)',
              },
            }}
          >
            Create New Plan
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#1E7D5C' }} />
          </Box>
        ) : plans.length === 0 ? (
          <Box
            sx={{
              p: { xs: 4, sm: 8 },
              textAlign: 'center',
              borderRadius: 4,
              border: `1px dashed #CBD5E1`,
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: 'rgba(30, 125, 92, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <TripIcon sx={{ fontSize: 36, color: '#1E7D5C' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B', mb: 1 }}>
              No Itineraries Saved Yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 3.5, maxWidth: 440, mx: 'auto', lineHeight: 1.6 }}>
              Choose any state or attractions, generate a personalized day-by-day travel plan with our AI companion, and click "Save Itinerary" to track it here.
            </Typography>
            <Button
              variant="contained"
              onClick={() => onOpenPlanner()}
              startIcon={<PlannerIcon />}
              sx={{
                borderRadius: 2.5,
                px: 3.5,
                py: 1,
                fontWeight: 800,
                backgroundColor: '#1E7D5C',
                color: '#FFFFFF',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#176449' },
              }}
            >
              Generate Your First Itinerary
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {plans.map((p) => {
              const formattedDate = new Date(p.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              // Get authentic cover image for this itinerary's destination state
              const coverImg = getStateCoverImage(p.state_name);

              // Extract route corridor stops from title (e.g. "4-Day Kerala Circuit: Varkala - Kovalam - Alleppey")
              const parts = p.title.split(':');
              const displayTitle = parts[0].trim();
              const corridorText = parts.length > 1 ? parts[1].trim() : '';
              const routeStops = corridorText
                ? corridorText
                    .split('–')
                    .join('-')
                    .split('-')
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [];

              return (
                <Grid item xs={12} sm={6} lg={4} key={p.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: 3.5,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 16px 32px rgba(30, 125, 92, 0.12)',
                        borderColor: '#1E7D5C',
                        '& .trip-cover-img': {
                          transform: 'scale(1.05)',
                        },
                      },
                    }}
                  >
                    {/* Visual Destination Cover Header */}
                    <Box sx={{ position: 'relative', height: 180, overflow: 'hidden', bgcolor: '#0F172A' }}>
                      <CardMedia
                        component="img"
                        className="trip-cover-img"
                        height="180"
                        image={coverImg}
                        alt={p.state_name}
                        referrerPolicy="no-referrer"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=800&q=80';
                        }}
                        sx={{
                          objectFit: 'cover',
                          transition: 'transform 0.45s ease',
                        }}
                      />

                      {/* Dark Gradient Scrim */}
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.2) 60%, transparent 100%)',
                        }}
                      />

                      {/* Top Chips (State + Duration) */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 2 }}
                      >
                        <Chip
                          size="small"
                          icon={<LocationIcon sx={{ fontSize: '13px !important', color: '#FFFFFF !important' }} />}
                          label={p.state_name}
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            backdropFilter: 'blur(8px)',
                            backgroundColor: 'rgba(15, 23, 42, 0.65)',
                            color: '#FFFFFF',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                          }}
                        />

                        <Chip
                          size="small"
                          label={`${p.total_days} Days Circuit`}
                          sx={{
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            backdropFilter: 'blur(8px)',
                            backgroundColor: 'rgba(30, 125, 92, 0.85)',
                            color: '#FFFFFF',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                          }}
                        />
                      </Stack>

                      {/* Title on Image Bottom */}
                      <Box sx={{ position: 'absolute', bottom: 12, left: 14, right: 14, zIndex: 2 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 900,
                            color: '#FFFFFF',
                            fontSize: '1.05rem',
                            lineHeight: 1.25,
                            textShadow: '0 2px 6px rgba(0, 0, 0, 0.8)',
                          }}
                        >
                          {displayTitle}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Card Content: Route Corridor & Metadata */}
                    <CardContent sx={{ pb: 1.5, pt: 2, flexGrow: 1 }}>
                      {/* Circuit Stops Trail */}
                      {routeStops.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.8 }}>
                            <RouteIcon sx={{ fontSize: 15, color: '#1E7D5C' }} />
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#64748B',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                fontSize: '0.66rem',
                                letterSpacing: '0.04em',
                              }}
                            >
                              Circuit Corridor
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" flexWrap="wrap" useFlexGap sx={{ gap: 0.6 }}>
                            {routeStops.map((stop, sIdx) => (
                              <React.Fragment key={sIdx}>
                                <Chip
                                  label={stop}
                                  size="small"
                                  sx={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    height: 22,
                                    backgroundColor: '#F1F5F9',
                                    color: '#334155',
                                    border: '1px solid #E2E8F0',
                                  }}
                                />
                                {sIdx < routeStops.length - 1 && (
                                  <ArrowIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
                                )}
                              </React.Fragment>
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {/* Metadata Row */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                          pt: 1.5,
                          borderTop: '1px solid #F1F5F9',
                          color: '#64748B',
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={0.6}>
                          <DateIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.74rem' }}>
                            Saved {formattedDate}
                          </Typography>
                        </Stack>

                        <Tooltip title="Rename Itinerary">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenRename(p)}
                            sx={{
                              color: '#64748B',
                              backgroundColor: '#F8FAFC',
                              '&:hover': { backgroundColor: '#F1F5F9', color: '#1E293B' },
                            }}
                          >
                            <EditIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </CardContent>

                    {/* Card Actions Footer */}
                    <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        fullWidth
                        startIcon={<ViewIcon sx={{ fontSize: 16 }} />}
                        onClick={() => handleLoadAndOpenPlan(p.id)}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          py: 0.8,
                          backgroundColor: '#1E7D5C',
                          color: '#FFFFFF',
                          boxShadow: '0 2px 6px rgba(30, 125, 92, 0.2)',
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: '#176449',
                            boxShadow: '0 4px 12px rgba(30, 125, 92, 0.3)',
                          },
                        }}
                      >
                        Open Itinerary & AI Guide
                      </Button>

                      <Tooltip title="Delete Itinerary">
                        <IconButton
                          size="small"
                          onClick={() => setDeleteTargetId(p.id)}
                          sx={{
                            color: '#EF4444',
                            backgroundColor: '#FEF2F2',
                            border: '1px solid #FEE2E2',
                            p: 0.8,
                            borderRadius: 2,
                            '&:hover': { backgroundColor: '#FEE2E2' },
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      {/* Rename Dialog */}
      <Dialog
        open={Boolean(renameTarget)}
        onClose={() => setRenameTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1E293B' }}>Rename Itinerary</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Plan Title"
            fullWidth
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setRenameTarget(null)} sx={{ color: '#64748B', textTransform: 'none', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveRename}
            variant="contained"
            disabled={renaming || !newTitle.trim()}
            sx={{
              backgroundColor: '#1E7D5C',
              color: '#FFFFFF',
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#176449' },
            }}
          >
            {renaming ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#1E293B' }}>Delete Itinerary?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6 }}>
            Are you sure you want to permanently delete this saved itinerary? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setDeleteTargetId(null)} sx={{ color: '#64748B', textTransform: 'none', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeletePlan}
            variant="contained"
            color="error"
            disabled={deleting}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
