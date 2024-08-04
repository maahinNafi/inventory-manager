'use client';

import { useState } from "react";
import { auth } from '@/firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Box, Typography, Button, TextField, Snackbar } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password) {
      setSnackbarMessage('Email and password are required.');
      setOpenSnackbar(true);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSnackbarMessage('Account created successfully!');
      setOpenSnackbar(true);
      setTimeout(() => router.push('/home'), 1500); // Redirect to home after signup
    } catch (error) {
      console.error("Error signing up:", error);
      setSnackbarMessage(error.message);
      setOpenSnackbar(true);
    }
  };

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
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', marginBottom: 4 }}>
        Sign Up
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <TextField
          label="Email"
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ marginBottom: 2, width: '300px' }}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ marginBottom: 2, width: '300px' }}
        />
        <Button variant="contained" color="primary" onClick={handleSignUp}>
          Sign Up
        </Button>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
