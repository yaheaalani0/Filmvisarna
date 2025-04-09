import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, CardActionArea, CardMedia, Container } from '@mui/material';
import { Link } from 'react-router-dom';

function Home() {
  const [movies, setMovies] = useState([]);

  // Fetch movies from the backend
  useEffect(() => {
    fetch('http://localhost:3000/api/movies')
      .then((response) => response.json())
      .then((data) => setMovies(data))
      .catch((error) => console.error('Error fetching movies:', error));
  }, []);

  return (
    <Container sx={{ marginTop: 4 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        Aktuella Filmer
      </Typography>
      <Grid container spacing={3} justifyContent="flex-start">
        {movies.map((movie) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
            <Card sx={{ maxWidth: 300 }}>
              <CardActionArea component={Link} to={`/movies/${movie.id}`}>
                <CardMedia
                  component="img"
                  height="200"
                  image={movie.poster}
                  alt={movie.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" noWrap>
                    {movie.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" noWrap>
                    {movie.plot}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Home;