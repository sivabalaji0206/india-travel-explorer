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
      icon: <HotelIcon sx={{ fontSize: 18, color: '#0284C7' }} />,
      color: '#0284C7',
    },
    {
      label: 'Food & Dining',
      amount: breakdown.food_estimate,
      icon: <FoodIcon sx={{ fontSize: 18, color: '#1E7D5C' }} />,
      color: '#1E7D5C',
    },
    {
      label: 'Sightseeing & Tickets',
      amount: breakdown.activities_and_entry,
      icon: <ActivityIcon sx={{ fontSize: 18, color: '#F59E0B' }} />,
      color: '#F59E0B',
    },
    {
      label: 'Local Transit',
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
        borderRadius: 3.5,
        border: '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
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
          <SavingsIcon sx={{ color: '#1E7D5C', fontSize: 22 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E293B', fontSize: '1.02rem' }}>
            Trip Budget Breakdown
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
            Target: <strong>₹{targetBudget.toLocaleString()}</strong> ({totalDays} days)
          </Typography>
          <Typography
            variant="caption"
            sx={{
              px: 1.2,
              py: 0.4,
              borderRadius: 1.5,
              fontWeight: 800,
              fontSize: '0.74rem',
              backgroundColor: isUnder ? '#DCFCE7' : '#FEE2E2',
              color: isUnder ? '#15803D' : '#DC2626',
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
                  p: 1.8,
                  borderRadius: 2.5,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  {cat.icon}
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B' }}>
                    {cat.label}
                  </Typography>
                </Stack>
                <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5, color: '#1E293B' }}>
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
                        backgroundColor: '#E2E8F0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: cat.color,
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', minWidth: 28 }}>
                    {pct}%
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      <Divider sx={{ my: 2, borderColor: '#E2E8F0' }} />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
      >
        <Typography variant="caption" sx={{ color: '#64748B' }}>
          * Itemized estimates based on verified travel costs and attractions in this state.
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E293B' }}>
          Estimated Total:{' '}
          <Box component="span" sx={{ color: '#1E7D5C', fontWeight: 900 }}>
            ₹{total.toLocaleString()}
          </Box>
        </Typography>
      </Stack>
    </Paper>
  );
};
