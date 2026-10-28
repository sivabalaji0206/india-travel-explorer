import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
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
  Typography,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome as PlannerIcon,
  CalendarToday as DateIcon,
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
  LocationOn as LocationIcon,
  LockOpen as AuthIcon,
  VisibilityOutlined as ViewIcon,
} from '@mui/icons-material';
import { plansApi } from '../../api/plansApi';
import { SavedPlanDetail, SavedPlanSummary } from '../../api/types';
import { useAuth } from '../../context/AuthContext';

interface SavedPlansViewProps {
  onOpenAuth: () => void;
  onOpenPlanner: (stateId?: number) => void;
  onViewPlanDetail: (plan: SavedPlanDetail) => void;
}

export const SavedPlansView: React.FC<SavedPlansViewProps> = ({
  onOpenAuth,
  onOpenPlanner,
  onViewPlanDetail,
}) => {
  const theme = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [plans, setPlans] = useState<SavedPlanSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
  }, [isAuthenticated]);

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
      onViewPlanDetail(detail);
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
            p: 5,
            borderRadius: 4,
            border: `1px dashed ${theme.palette.divider}`,
            backgroundColor:
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
          }}
        >
          <AuthIcon sx={{ fontSize: 50, color: theme.palette.primary.main, mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Sign in to Access Your Saved Plans
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, maxWidth: 500, mx: 'auto' }}>
            Store multiple custom AI-generated itineraries, revisit your budgeted trips, and refine them anytime across your devices.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onOpenAuth}
            sx={{ borderRadius: 2.5, px: 4 }}
          >
            Sign In or Register
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              My Saved Itineraries
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Welcome, {user?.name}. Here are your saved customized travel plans.
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<PlannerIcon />}
            onClick={() => onOpenPlanner()}
            sx={{ borderRadius: 2 }}
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
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : plans.length === 0 ? (
          <Box
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              border: `1px dashed ${theme.palette.divider}`,
              backgroundColor:
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
            }}
          >
            <PlannerIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              No Itineraries Saved Yet
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Generate a personalized travel plan with our RAG agent and click "Save Itinerary" to keep it here.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => onOpenPlanner()}
              startIcon={<PlannerIcon />}
            >
              Generate Itinerary Now
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

              return (
                <Grid item xs={12} sm={6} md={4} key={p.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: 3,
                    }}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.25, pr: 1 }}>
                          {p.title}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenRename(p)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary', mb: 1.5 }}>
                        <LocationIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {p.state_name}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={2} sx={{ color: 'text.secondary', pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                        <Box>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            Duration
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {p.total_days} Days
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ display: 'block' }}>
                            Saved On
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <DateIcon sx={{ fontSize: 14 }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formattedDate}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<ViewIcon />}
                        onClick={() => handleLoadAndOpenPlan(p.id)}
                        sx={{ borderRadius: 1.5 }}
                      >
                        View & Chat
                      </Button>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTargetId(p.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      {/* Rename Dialog */}
      <Dialog open={Boolean(renameTarget)} onClose={() => setRenameTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Rename Plan</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Plan Title"
            fullWidth
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRenameTarget(null)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSaveRename}
            variant="contained"
            color="primary"
            disabled={renaming || !newTitle.trim()}
          >
            {renaming ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTargetId)} onClose={() => setDeleteTargetId(null)} maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Plan?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to permanently delete this saved itinerary? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTargetId(null)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeletePlan}
            variant="contained"
            color="error"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

