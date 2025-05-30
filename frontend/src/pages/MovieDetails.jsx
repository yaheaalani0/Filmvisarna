import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  CardContent,
  Container,
  Box,
  CircularProgress,
  Fade,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import { useAuth } from '../components/AuthContext';

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { userRole } = useAuth();

  useEffect(() => {
    console.log("Fetching details for movie id:", id);
    fetch(`http://localhost:5000/api/movies/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setMovie(data);
        setTimeout(() => setLoaded(true), 200);
      })
      .catch((err) => setError('Error fetching movie details: ' + err.message));
  }, [id]);

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    // Försök matcha fullständig YouTube URL
    let match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/);
    if (match && match[1]) {
      return match[1];
    }
    // Försök matcha korta youtu.be länken
    match = url.match(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?&]+)/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeVideoId(movie?.trailer);

  const formatMovieMeta = () => {
    if (!movie) return '';
    const parts = [];
    if (movie.year) parts.push(movie.year);
    if (movie.genre) parts.push(movie.genre);
    if (movie.runtime) parts.push(`${movie.runtime} min`);
    return parts.join(' • ');
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!movie || !loaded) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0d0d0d',
        }}
      >
        <CircularProgress sx={{ color: '#666' }} />
        <Typography mt={2} sx={{ color: '#999' }}>
          Laddar film...
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in={loaded} timeout={600}>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#0d0d0d',
          py: { xs: 3, md: 6 },
          color: '#fff',
        }}
      >
        <Container maxWidth="md">
          <Button variant="contained" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
            Tillbaka
          </Button>
          <Card
            elevation={10}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#111',
                p: { xs: 2, sm: 4 },
              }}
            >
              {/* Poster Image */}
              <Box
                component="img"
                src={movie.poster}
                alt={movie.title}
                sx={{
                  width: '100%',
                  maxWidth: 300,
                  aspectRatio: '2 / 3',
                  objectFit: 'cover',
                  borderRadius: 2,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  mb: 4,
                }}
              />

              {/* Title & Meta */}
              <Typography
                variant={isMobile ? 'h4' : 'h3'}
                gutterBottom
                sx={{ fontWeight: 700, color: '#fff', textAlign: 'center' }}
              >
                {movie.title}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ color: '#fff', opacity: 0.8, mb: 3, textAlign: 'center' }}
              >
                {formatMovieMeta() || 'Ingen information tillgänglig'}
              </Typography>

              {/* Plot */}
              <Typography
                variant="body1"
                paragraph
                sx={{
                  textAlign: 'center',
                  color: '#ccc',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  padding: 2,
                  borderRadius: 2,
                  lineHeight: 1.6,
                }}
              >
                {movie.plot || 'Ingen beskrivning tillgänglig.'}
              </Typography>

              {/* Trailer */}
              {videoId && (
                <Box mt={5} width="100%">
                  <Typography
                    variant="h5"
                    align="center"
                    gutterBottom
                    sx={{ color: '#fff', fontWeight: 600, mb: 2 }}
                  >
                    Trailer
                  </Typography>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '56.25%', // 16:9 ratio
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
                    }}
                  >
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                      }}
                    />
                  </Box>
                </Box>
              )}

              {/* Booking Button */}
              {userRole !== 'admin' && (
                <Box mt={4}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/booking')}
                    sx={{
                      background: 'linear-gradient(45deg, #ff6a00, #ee0979)',
                      color: '#fff',
                      padding: '10px 30px',
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #ff8533, #ff1a8c)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Boka Biljett
                  </Button>
                </Box>
              )}
            </Box>
          </Card>
        </Container>
      </Box>
    </Fade>
  );
}

export default MovieDetails;
