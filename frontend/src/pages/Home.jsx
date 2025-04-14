import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CardActionArea,
  CardMedia,
  Container,
  Box,
} from '@mui/material';
import { Link } from 'react-router-dom';

const fallbackPoster = 'https://via.placeholder.com/300x450?text=Ingen+bild';

function Home() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/movies')
      .then((response) => response.json())
      .then((data) => setMovies(data))
      .catch((error) => console.error('Error fetching movies:', error));
  }, []);

  return (
    <Box sx={{ backgroundColor: '#0d0d0d', py: 6 }}>
      <Container maxWidth="xl">
        <Typography
          variant="h3"
          gutterBottom
          textAlign="center"
          fontWeight="bold"
          sx={{
            color: '#fff',
            mb: 4,
          }}
        >
          🎬 Aktuella Filmer
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {movies.map((movie) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              xl={2} // Lägger till xl för ännu större skärmar
              key={movie.id}
            >
              <Card
                sx={{
                  maxWidth: 300, // Begränsar kortets bredd för konsekvens
                  height: '100%',
                  backgroundColor: '#1c1c1c',
                  color: '#fff',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                  transition: 'transform 0.3s ease',
                  overflow: 'hidden',
                  margin: '0 auto', // Centrerar kortet i sitt Grid-item
                  '&:hover': {
                    transform: 'scale(1.04)',
                  },
                }}
              >
                <CardActionArea
                  component={Link}
                  to={`/movies/${movie.id}`}
                  sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  <Box sx={{ position: 'relative', width: '100%', aspectRatio: '2/3' }}>
                    <CardMedia
                      component="img"
                      image={movie.poster || fallbackPoster}
                      alt={movie.title}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }}
                    />
                  </Box>
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      p: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ mb: 1 }}
                      noWrap
                    >
                      {movie.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#ccc',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                        overflow: 'hidden',
                        minHeight: 60,
                      }}
                    >
                      {movie.plot || 'Ingen beskrivning tillgänglig.'}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Home;