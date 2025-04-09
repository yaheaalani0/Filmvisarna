import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Card, CardMedia, CardContent, Container, Box } from '@mui/material';

function MovieDetails() {
  const { id } = useParams(); // Hämta filmens ID från URL:en
  const [movie, setMovie] = useState(null);

  // Hämta filmdata från backend
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

  // Extrahera YouTube-video-ID från trailer-URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeVideoId(movie.trailer);

  return (
    <Container maxWidth="md" sx={{ marginTop: 4 }}>
      <Card>
        <CardMedia
          component="img"
          height="400"
          image={movie.poster}
          alt={movie.title}
          sx={{ objectFit: 'contain' }}
        />
        <CardContent>
          <Box textAlign="center" mb={2}>
            <Typography variant="h4" gutterBottom>
              {movie.title}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              År: {movie.year || 'N/A'}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Genre: {movie.genre || 'N/A'}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Längd: {movie.runtime || 'N/A'}
            </Typography>
          </Box>
          <Typography variant="body1" paragraph>
            {movie.plot || 'Ingen beskrivning tillgänglig.'}
          </Typography>
          {videoId && (
            <Box mt={4} textAlign="center">
              <Typography variant="h6" gutterBottom>
                Trailer
              </Typography>
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default MovieDetails;