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
  Button,
  Alert,
  TextField,
  MenuItem,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const fallbackPoster = 'https://via.placeholder.com/300x450?text=Ingen+bild';

// Local MovieCard component defined inline
function MovieCard({ movie, showingTime }) {
  const { isLoggedIn, userRole } = useAuth();
  const navigate = useNavigate();

  const handleBooking = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      navigate('/booking');
    }
  };

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
        <CardActionArea component={Link} to={`/movies/${movie.id || movie.movie_id}`}>
          <CardMedia
            component="img"
            image={movie.poster || fallbackPoster}
            alt={movie.title || movie.movie_title}
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
              {movie.title || movie.movie_title}
            </Typography>
            {showingTime && (
              <Typography variant="body2" sx={{ mt: 1, color: '#aaa' }}>
                Visningstid: {showingTime}
              </Typography>
            )}
            {userRole !== 'admin' && (
              <Button
                variant="contained"
                onClick={handleBooking}
                sx={{
                  mt: 1,
                  background: 'linear-gradient(45deg, #ff6a00, #ee0979)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #ff8533, #ff1a8c)',
                  },
                }}
              >
                {isLoggedIn ? 'Boka Nu' : 'Logga in för att boka'}
              </Button>
            )}
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
}

function Home() {
  const [movies, setMovies] = useState([]);
  const [showings, setShowings] = useState([]);
  const [error, setError] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    // Fetch movies
    fetch('http://localhost:5000/api/movies')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setMovies(data))
      .catch((err) => setError('Error fetching movies: ' + err.message));

    // Fetch all showings to get available dates
    fetch('http://localhost:5000/api/showings')
      .then(response => response.json())
      .then(data => {
        const dates = [...new Set(data.map(showing => showing.date))];
        setAvailableDates(dates.sort());
        setShowings(data);
      })
      .catch(err => console.error('Error fetching showings:', err));
  }, []);

  // Fetch showings for a specific date
  useEffect(() => {
    if (selectedDate) {
      fetch(`http://localhost:5000/api/showings/date/${selectedDate}`)
        .then(response => response.json())
        .then(data => {
          setShowings(data);
        })
        .catch(err => console.error('Error fetching showings for date:', err));
    }
  }, [selectedDate]);

  // Filter movies based on search title and selected date
  const getDisplayItems = () => {
    if (selectedDate) {
      // If date is selected, show movies with showings on that date
      return showings
        .filter(showing => 
          (showing.movie_title || '').toLowerCase().includes(searchTitle.toLowerCase())
        );
    } else {
      // If no date selected, show all movies filtered by title
      return movies.filter(movie => 
        movie.title.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }
  };

  const displayItems = getDisplayItems();

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

        {/* Search and Filter Section */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Sök film"
            variant="outlined"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            sx={{
              flex: 1,
              minWidth: '200px',
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          />
          <TextField
            select
            label="Välj Datum"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            sx={{
              minWidth: '200px',
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }
            }}
          >
            <MenuItem value="">Alla datum</MenuItem>
            {availableDates.map((date) => (
              <MenuItem key={date} value={date}>{date}</MenuItem>
            ))}
          </TextField>
        </Box>

        {!isLoggedIn && (
          <Alert severity="info" sx={{ mb: 4 }}>
            Logga in för att kunna boka biljetter till våra filmer!
          </Alert>
        )}

        {displayItems.length === 0 ? (
          <Typography variant="h6" sx={{ color: '#fff', textAlign: 'center' }}>
            {selectedDate 
              ? 'Inga filmer visas på detta datum' 
              : 'Inga filmer hittades'}
          </Typography>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {displayItems.map((item) => (
              <MovieCard 
                key={item.id || item.movie_id} 
                movie={item} 
                showingTime={selectedDate ? item.time : null}
              />
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

export default Home;