import React from 'react';
import {
  Box,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  DirectionsCar as TransportIcon,
  Hotel as HotelIcon,
  LocalActivity as ActivityIcon,
  Restaurant as FoodIcon,
  SavingsOutlined as SavingsIcon,
} from '@mui/icons-material';
import { BudgetBreakdown } from '../../api/types';

interface BudgetCardProps {
  breakdown: BudgetBreakdown;
  targetBudget: number;
  totalDays: number;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  breakdown,
  targetBudget,
  totalDays,
}) => {
  const theme = useTheme();

  const total = breakdown.total_estimated_cost;
  const isUnder = total <= targetBudget;
  const diff = Math.abs(targetBudget - total);

  const categories = [
    {
      label: 'Accommodation',
      amount: breakdown.accommodation_estimate,
      icon: <HotelIcon sx={{ fontSize: 18, color: '#3B82F6' }} />,
      color: '#3B82F6',
    },
    {
      label: 'Food & Dining',
      amount: breakdown.food_estimate,
      icon: <FoodIcon sx={{ fontSize: 18, color: '#10B981' }} />,
      color: '#10B981',
    },
    {
      label: 'Activities & Tickets',
      amount: breakdown.activities_and_entry,
      icon: <ActivityIcon sx={{ fontSize: 18, color: '#F59E0B' }} />,
      color: '#F59E0B',
    },
    {
      label: 'Local Transport',
      amount: breakdown.local_transport_estimate,
      icon: <TransportIcon sx={{ fontSize: 18, color: '#8B5CF6' }} />,
      color: '#8B5CF6',
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#FAFAFA',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <SavingsIcon sx={{ color: theme.palette.primary.main }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Itemized Trip Budget Breakdown
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Target: <strong>₹{targetBudget.toLocaleString()}</strong> ({totalDays} days)
          </Typography>
          <Typography
            variant="caption"
            sx={{
              px: 1,
              py: 0.3,
              borderRadius: 1,
              fontWeight: 700,
              backgroundColor: isUnder ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: isUnder ? '#10B981' : '#EF4444',
            }}
          >
            {isUnder
              ? `₹${diff.toLocaleString()} Under Target`
              : `₹${diff.toLocaleString()} Over Target`}
          </Typography>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {categories.map((cat) => {
          const pct = total > 0 ? Math.round((cat.amount / total) * 100) : 0;
          return (
            <Grid item xs={12} sm={6} md={3} key={cat.label}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  {cat.icon}
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    {cat.label}
                  </Typography>
                </Stack>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                  ₹{cat.amount.toLocaleString()}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: cat.color,
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 28 }}>
                    {pct}%
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          * Estimates based on verified local cost tiers and attraction entrance fees.
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          Estimated Total:{' '}
          <Box component="span" sx={{ color: theme.palette.primary.main }}>
            ₹{total.toLocaleString()}
          </Box>
        </Typography>
      </Stack>
    </Paper>
  );
};

