import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Card, CardMedia, CardContent, Container, Box } from '@mui/material';

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  // Fetch movie details from the backend
  useEffect(() => {
    fetch(`http://localhost:3000/api/movies/${id}`)
      .then((response) => response.json())
      .then((data) => setMovie(data))
      .catch((error) => console.error('Error fetching movie details:', error));
  }, [id]);

  if (!movie) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ marginTop: 4 }}>
      <Card>
        <CardMedia
          component="img"
          height="400"
          image={movie.poster}
          alt={movie.title}
        />
        <CardContent>
          <Box textAlign="center" mb={2}>
            <Typography variant="h4" gutterBottom>
              {movie.title}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {movie.year}
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            {movie.plot}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

export default MovieDetails;