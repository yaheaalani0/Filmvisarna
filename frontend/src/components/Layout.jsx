import React from 'react';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import NavBar from './Navbar';

function Layout({ children }) {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Filmvisarna
          </Typography>
          <NavBar />
        </Toolbar>
      </AppBar>
      <Container sx={{ marginTop: 4 }}>
        {children}
      </Container>
    </>
  );
}

export default Layout;