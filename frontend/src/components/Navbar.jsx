import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import { Link } from 'react-router-dom';

function Navbar() {
  // Check if a token exists in localStorage to determine if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    window.location.href = '/'; // Redirect to home after logout
  };

  return (
    <AppBar
      position="sticky"
      elevation={4}
      sx={{
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h5"
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
              color: 'transparent',
              backgroundImage: 'linear-gradient(45deg, #ff6a00, #ee0979)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            Filmvisarna
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component={Link}
              to="/"
              sx={{
                color: '#fff',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  color: '#ff6a00',
                },
              }}
            >
              Hem
            </Button>

            {/* If logged in, display logout and conditionally the Admin button */}
            {isLoggedIn ? (
              <>
                {localStorage.getItem('role') === 'admin' && (
                  <Button
                    component={Link}
                    to="/admin"
                    sx={{
                      color: '#fff',
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        color: '#00e5ff',
                      },
                    }}
                  >
                    Admin
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  sx={{
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      color: '#00e5ff',
                    },
                  }}
                >
                  Logga ut
                </Button>
              </>
            ) : (
              // If not logged in, show the Log in button
              <Button
                component={Link}
                to="/login"
                sx={{
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    color: '#00e5ff',
                  },
                }}
              >
                Log in
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
