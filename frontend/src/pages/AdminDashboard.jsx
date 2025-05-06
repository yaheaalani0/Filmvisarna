import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Card,
  CardContent,
  Grid,
  Divider,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';

function AdminDashboard() {
  const [movieTitle, setMovieTitle] = useState('');
  const [trailer, setTrailer] = useState('');
  const [message, setMessage] = useState('');
  const [allBookings, setAllBookings] = useState([]);
  const [bookingsError, setBookingsError] = useState('');
  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showingDate, setShowingDate] = useState('');
  const [showingTime, setShowingTime] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [newTrailer, setNewTrailer] = useState('');

  const token = localStorage.getItem('token');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch all movies, bookings, and users when component mounts
  useEffect(() => {
    fetchAllBookings();
    fetchMovies();
    fetchUsers();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/movies');
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data = await response.json();
      setMovies(data);
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  const fetchAllBookings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setAllBookings(data);
    } catch (err) {
      setBookingsError(err.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setMessage('Error fetching users: ' + err.message);
    }
  };

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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: movieTitle, trailer: trailer })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Error adding movie.');
      } else {
        setMessage(`Movie added: ${data.movie.title}`);
        setMovieTitle('');
        setTrailer('');
        fetchMovies(); // Refresh movies list
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  const addShowing = async () => {
    if (!selectedMovie) {
      setMessage('Please select a movie');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/showings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          movie_id: selectedMovie.id,
          date: showingDate,
          time: showingTime
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Error adding showing');
      } else {
        setMessage('Showing added successfully!');
        setSelectedMovie(null);
        setShowingDate('');
        setShowingTime('');
      }
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Är du säker på att du vill ta bort denna bokning?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }
      
      setMessage('Bokning borttagen!');
      fetchAllBookings();
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Är du säker på att du vill ta bort denna film?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/movies/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete movie');
      }
      
      setMessage('Film borttagen!');
      fetchMovies(); // Refresh movies list
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  const handleEditTrailer = (movie) => {
    setEditingMovie(movie);
    setNewTrailer(movie.trailer || '');
    setEditDialogOpen(true);
  };

  const handleUpdateTrailer = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/movies/${editingMovie.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trailer: newTrailer })
      });

      if (!response.ok) {
        throw new Error('Failed to update trailer');
      }

      setMessage('Trailer uppdaterad!');
      setEditDialogOpen(false);
      fetchMovies(); // Refresh movies list
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#0d0d0d', minHeight: '100vh', py: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          align="center" 
          gutterBottom 
          sx={{ 
            color: '#fff', 
            mb: { xs: 2, md: 4 },
            fontSize: { xs: '1.75rem', md: '3rem' }
          }}
        >
          Admin Dashboard
        </Typography>

        {/* Movies Management Section */}
        <Paper sx={{ 
          p: { xs: 2, md: 3 }, 
          mb: { xs: 2, md: 4 }, 
          backgroundColor: '#1c1c1c', 
          borderRadius: 2, 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            gutterBottom 
            sx={{ color: '#fff' }}
          >
            Hantera Filmer
          </Typography>

          {/* Movies List */}
          <TableContainer>
            <Table sx={{ 
              '& .MuiTableCell-root': { 
                color: '#fff',
                padding: { xs: 1, md: 2 },
                fontSize: { xs: '0.8rem', md: '1rem' }
              }
            }}>
              <TableHead>
                <TableRow sx={{ '& th': { color: '#ff6a00' } }}>
                  <TableCell><strong>Titel</strong></TableCell>
                  <TableCell><strong>År</strong></TableCell>
                  <TableCell><strong>Trailer</strong></TableCell>
                  <TableCell><strong>Åtgärder</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movies.map((movie) => (
                  <TableRow key={movie.id}>
                    <TableCell>{movie.title}</TableCell>
                    <TableCell>{movie.year}</TableCell>
                    <TableCell>
                      {movie.trailer ? 'Ja' : 'Nej'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        onClick={() => handleEditTrailer(movie)}
                        sx={{ 
                          mr: 1,
                          color: '#00e5ff',
                          borderColor: '#00e5ff',
                          '&:hover': {
                            borderColor: '#00e5ff',
                            backgroundColor: 'rgba(0, 229, 255, 0.1)'
                          }
                        }}
                      >
                        Redigera Trailer
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteMovie(movie.id)}
                        sx={{
                          color: '#ff1744',
                          borderColor: '#ff1744',
                          '&:hover': {
                            borderColor: '#ff1744',
                            backgroundColor: 'rgba(255, 23, 68, 0.1)'
                          }
                        }}
                      >
                        Ta Bort
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Add New Movie Section */}
          <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={12}>
              <TextField
                label="Filmtitel"
                fullWidth
                value={movieTitle}
                onChange={(e) => setMovieTitle(e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Trailer URL"
                fullWidth
                value={trailer}
                onChange={(e) => setTrailer(e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                onClick={addMovie}
                sx={{
                  background: 'linear-gradient(45deg, #ff6a00, #ee0979)',
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Lägg till Film
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Showing Management Section */}
        <Paper sx={{ 
          p: { xs: 2, md: 3 }, 
          mb: { xs: 2, md: 4 }, 
          backgroundColor: '#1c1c1c', 
          borderRadius: 2, 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            gutterBottom 
            sx={{ color: '#fff' }}
          >
            Lägg till Visning
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                options={movies}
                getOptionLabel={(option) => option.title || ''}
                value={selectedMovie}
                onChange={(_, newValue) => setSelectedMovie(newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Välj Film"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        color: '#fff',
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                        '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }
                    }}
                  />
                )}
                sx={{
                  mb: { xs: 1, md: 2 },
                  '& .MuiAutocomplete-input': { color: '#fff' },
                  '& .MuiAutocomplete-paper': { backgroundColor: '#2d2d2d', color: '#fff' }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Datum (ÅÅÅÅ-MM-DD)"
                type="date"
                fullWidth
                value={showingDate}
                onChange={(e) => setShowingDate(e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tid (HH:MM)"
                type="time"
                fullWidth
                value={showingTime}
                onChange={(e) => setShowingTime(e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Button 
            variant="contained" 
            onClick={addShowing}
            fullWidth={isMobile}
            sx={{
              background: 'linear-gradient(45deg, #ff6a00, #ee0979)',
              textTransform: 'none',
              fontWeight: 500,
              mt: { xs: 1, md: 2 }
            }}
          >
            Lägg till Visning
          </Button>
        </Paper>

        {/* Users Section */}
        <Paper sx={{ 
          p: { xs: 2, md: 3 }, 
          mb: { xs: 2, md: 4 }, 
          backgroundColor: '#1c1c1c', 
          borderRadius: 2, 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            gutterBottom 
            sx={{ color: '#fff' }}
          >
            Användare
          </Typography>
          
          {users.length > 0 ? (
            <TableContainer>
              <Table sx={{ 
                '& .MuiTableCell-root': { 
                  color: '#fff',
                  padding: { xs: 1, md: 2 },
                  fontSize: { xs: '0.8rem', md: '1rem' }
                }
              }}>
                <TableHead>
                  <TableRow sx={{ '& th': { color: '#ff6a00' } }}>
                    <TableCell><strong>Användarnamn</strong></TableCell>
                    <TableCell><strong>E-post</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                      }
                    }}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography align="center" sx={{ py: 3, color: '#fff' }}>
              Inga användare hittade
            </Typography>
          )}
        </Paper>

        {/* All Bookings Section */}
        <Paper sx={{ 
          p: { xs: 2, md: 3 }, 
          backgroundColor: '#1c1c1c', 
          borderRadius: 2, 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
        }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            gutterBottom 
            sx={{ color: '#fff' }}
          >
            Alla Bokningar
          </Typography>
          
          {bookingsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {bookingsError}
            </Alert>
          )}

          {allBookings.length > 0 ? (
            <Box sx={{ overflowX: 'auto' }}>
              <TableContainer>
                <Table sx={{ 
                  '& .MuiTableCell-root': { 
                    color: '#fff',
                    padding: { xs: 1, md: 2 },
                    fontSize: { xs: '0.8rem', md: '1rem' }
                  }
                }}>
                  <TableHead>
                    <TableRow sx={{ '& th': { color: '#ff6a00' } }}>
                      <TableCell><strong>Användare</strong></TableCell>
                      <TableCell><strong>E-post</strong></TableCell>
                      <TableCell><strong>Film</strong></TableCell>
                      <TableCell><strong>Datum</strong></TableCell>
                      <TableCell><strong>Tid</strong></TableCell>
                      <TableCell><strong>Platser</strong></TableCell>
                      <TableCell><strong>Åtgärder</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allBookings.map((booking) => (
                      <TableRow key={booking.booking_id} sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)'
                        }
                      }}>
                        <TableCell>{booking.user_name}</TableCell>
                        <TableCell>{booking.user_email}</TableCell>
                        <TableCell>{booking.movie_title}</TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>{booking.time}</TableCell>
                        <TableCell sx={{ 
                          maxWidth: { xs: '100px', md: '200px' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {booking.seats.join(', ')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="error"
                            size={isMobile ? "small" : "medium"}
                            onClick={() => handleDeleteBooking(booking.booking_id)}
                            sx={{
                              minWidth: { xs: '60px', md: 'auto' },
                              padding: { xs: '4px 8px', md: '6px 16px' }
                            }}
                          >
                            Ta bort
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Typography align="center" sx={{ py: 3, color: '#fff' }}>
              Inga bokningar hittades
            </Typography>
          )}
        </Paper>

        {/* Edit Trailer Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)}
          PaperProps={{
            sx: {
              backgroundColor: '#1c1c1c',
              color: '#fff'
            }
          }}
        >
          <DialogTitle>Redigera Trailer</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Trailer URL"
              type="text"
              fullWidth
              value={newTrailer}
              onChange={(e) => setNewTrailer(e.target.value)}
              sx={{ 
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                  '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)} sx={{ color: '#fff' }}>
              Avbryt
            </Button>
            <Button onClick={handleUpdateTrailer} variant="contained">
              Uppdatera
            </Button>
          </DialogActions>
        </Dialog>

        {message && (
          <Alert 
            severity={message.startsWith('Error') ? 'error' : 'success'}
            sx={{ mt: 3 }}
            onClose={() => setMessage('')}
          >
            {message}
          </Alert>
        )}
      </Container>
    </Box>
  );
}

export default AdminDashboard;