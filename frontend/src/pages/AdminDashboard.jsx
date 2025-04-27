import React, { useState } from 'react';
import { Container, Box, TextField, Button, Typography } from '@mui/material';

function AdminDashboard() {
  const [movieTitle, setMovieTitle] = useState('');
  const [trailer, setTrailer] = useState('');
  const [message, setMessage] = useState('');

  // Get the token from localStorage
  const token = localStorage.getItem('token');
  console.log('Admin token:', token); // Should output a valid JWT

  const addMovie = async () => {
    if (!movieTitle.trim()) {
      setMessage('Please enter a movie title.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/movies/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Must be exactly "Bearer <token>"
        },
        // Send both the title and the trailer (if provided)
        body: JSON.stringify({ title: movieTitle, trailer: trailer })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Error adding movie.');
      } else {
        setMessage(`Movie added: ${data.movie.title}`);
        setMovieTitle('');
        setTrailer('');
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  // Function to add a showing (admin only)
  const [showingMovieId, setShowingMovieId] = useState('');
  const [showingDate, setShowingDate] = useState('');
  const [showingTime, setShowingTime] = useState('');

  const addShowing = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/showings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movie_id: showingMovieId,
          date: showingDate,
          time: showingTime
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Error adding showing');
      } else {
        setMessage('Showing added successfully!');
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="h5">Add Movie with Trailer</Typography>
        <TextField
          label="Movie Title"
          fullWidth
          value={movieTitle}
          onChange={(e) => setMovieTitle(e.target.value)}
          sx={{ my: 2 }}
        />
        <TextField
          label="Trailer URL (YouTube)"
          fullWidth
          value={trailer}
          onChange={(e) => setTrailer(e.target.value)}
          sx={{ my: 2 }}
        />
        <Button variant="contained" onClick={addMovie}>
          Add Movie
        </Button>
      </Box>

      <Box sx={{ mt: 5 }}>
        <Typography variant="h5">Add Showing</Typography>
        <TextField
          label="Movie ID"
          fullWidth
          value={showingMovieId}
          onChange={(e) => setShowingMovieId(e.target.value)}
          sx={{ my: 2 }}
        />
        <TextField
          label="Date (YYYY-MM-DD)"
          fullWidth
          value={showingDate}
          onChange={(e) => setShowingDate(e.target.value)}
          sx={{ my: 2 }}
        />
        <TextField
          label="Time (HH:MM)"
          fullWidth
          value={showingTime}
          onChange={(e) => setShowingTime(e.target.value)}
          sx={{ my: 2 }}
        />
        <Button variant="contained" onClick={addShowing}>
          Add Showing
        </Button>
      </Box>

      {message && (
        <Typography variant="body1" sx={{ mt: 3 }}>
          {message}
        </Typography>
      )}
    </Container>
  );
}

export default AdminDashboard;