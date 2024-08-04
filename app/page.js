'use client';

import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Box
      sx={{
        padding: 3,
        backgroundColor: '#f9f9f9',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h2" gutterBottom sx={{ textAlign: 'center', marginBottom: 4 }}>
        Welcome to Inventory Manager
      </Typography>
      <Typography variant="h6" sx={{ textAlign: 'center', marginBottom: 4 }}>
        Manage your inventory with ease. Sign up or sign in to start.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Link href="/sign-up" passHref>
          <Button variant="contained" color="primary" sx={{ marginRight: 2 }}>
            Sign Up
          </Button>
        </Link>
        <Link href="/sign-in" passHref>
          <Button variant="contained" color="secondary">
            Sign In
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
