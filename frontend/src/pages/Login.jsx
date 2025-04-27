import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        // Redirect accordingly
        navigate(data.role === 'admin' ? '/admin' : '/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: 2, backgroundColor: 'white' }}>
        <Typography variant="h5" align="center" gutterBottom>
          Login
        </Typography>
        {error && (
          <Typography variant="body1" color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" type="submit" fullWidth sx={{ mb: 2 }}>
            Log In
          </Button>
        </form>
        <Typography variant="body2" align="center">
          Don't have an account?{' '}
          <Link component="button" variant="body2" onClick={() => navigate('/register')}>
            Register here
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Login;