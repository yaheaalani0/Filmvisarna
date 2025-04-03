import React from 'react';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <>
      <Button color="inherit" component={Link} to="/" sx={{ marginRight: 2 }}>
        Hem
      </Button>
      <Button color="inherit" component={Link} to="/movies">
        Filmer
      </Button>
    </>
  );
}

export default NavBar;