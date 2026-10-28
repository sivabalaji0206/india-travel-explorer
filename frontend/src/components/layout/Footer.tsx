import React from 'react';
import { Box, Container, Link, Stack, Typography, useTheme } from '@mui/material';

export const Footer: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 4,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              India Travel Explorer with AI Trip Planner (RAG)
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Enterprise Full-Stack Architecture: FastAPI, PostgreSQL, SQLAlchemy 2.0, Alembic, React, TypeScript, Material UI & Gemini API.
            </Typography>
          </Box>
          <Stack direction="row" spacing={3}>
            <Link
              href="https://github.com/sivabalaji0206/india-travel-explorer"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              underline="hover"
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              GitHub Repository
            </Link>
            <Link
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              underline="hover"
              variant="body2"
              sx={{ color: theme.palette.text.secondary }}
            >
              FastAPI Swagger Docs
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};
