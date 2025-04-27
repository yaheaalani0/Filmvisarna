import React, { useEffect, useState } from 'react';
import {
  Grid,
  Container,
  Box,
  Typography,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
} from '@mui/material';
import { Link } from 'react-router-dom';

const fallbackPoster = 'https://via.placeholder.com/300x450?text=Ingen+bild';

// Local MovieCard component defined inline
function MovieCard({ movie }) {
  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card
        sx={{
          maxWidth: 300,
          backgroundColor: '#1c1c1c',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'scale(1.05)' },
          mx: 'auto',
        }}
      >
        <CardActionArea component={Link} to={`/movies/${movie.id}`}>
          <CardMedia
            component="img"
            image={movie.poster || fallbackPoster}
            alt={movie.title}
            sx={{
              height: 450,
              objectFit: 'cover',
            }}
          />
          <CardContent
            sx={{
              backgroundColor: '#1c1c1c',
              color: '#fff',
              p: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" noWrap>
              {movie.title}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
}

function Home() {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/movies')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setMovies(data))
      .catch((err) => setError('Error fetching movies: ' + err.message));
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Box sx={{ backgroundColor: '#0d0d0d', py: 6 }}>
      <Container maxWidth="xl">
        <Typography
          variant="h3"
          gutterBottom
          textAlign="center"
          fontWeight="bold"
          sx={{ color: '#fff', mb: 4 }}
        >
          🎬 Aktuella Filmer
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Home;