import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function Booking() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableShowings, setAvailableShowings] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatMap, setSeatMap] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [students, setStudents] = useState(0);
  const priceAdult = 100;
  const priceChild = 50;
  const priceStudent = 75;
  const totalPrice = adults * priceAdult + children * priceChild + students * priceStudent;
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetch("http://localhost:5000/api/movies")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setMovies(data))
      .catch((err) => setError('Error fetching movies: ' + err.message));
  }, [navigate, token]);

  const handleMovieChange = (movieId) => {
    setSelectedMovie(movieId);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedSeats([]);
    setError('');

    fetch(`http://localhost:5000/api/showings/${movieId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('No showings found for this movie');
        }
        return response.json();
      })
      .then((data) => {
        if (data.length === 0) {
          const defaultShowing = { date: '2025-04-20', time: '18:00' };
          setAvailableShowings([defaultShowing]);
        } else {
          setAvailableShowings(data);
        }
      })
      .catch((error) => {
        console.error('Error fetching showings:', error);
        setAvailableShowings([]);
      });
  };

  const handleSeatClick = (seat) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleBooking = () => {
    // Räkna totala antalet biljetter
    const totalTickets = adults + children + students;
    
    // Kontrollera att film, datum, tid är valt samt att antal valda platser > 0
    if (!selectedMovie || !selectedDate || !selectedTime || selectedSeats.length === 0) {
      setError("Vänligen välj film, datum, tid och minst en plats.");
      return;
    }
    
    // Ny validering: Antalet valda platser måste stämma överens med totala biljetter
    if (selectedSeats.length !== totalTickets) {
      setError(`Antalet valda platser (${selectedSeats.length}) stämmer inte överens med antalet biljetter (${totalTickets}).`);
      return;
    }
    
    const bookingData = {
      movie_id: selectedMovie,
      date: selectedDate,
      time: selectedTime,
      seats: selectedSeats,
    };
    
    fetch("http://localhost:5000/api/bookings", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(bookingData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.error || "Bokningen misslyckades");
          });
        }
        return response.json();
      })
      .then((data) => {
        setMessage("Bokningen lyckades!");
        setSelectedSeats([]); // Rensa de valda platserna
        fetchBookedSeats(); // Uppdatera UI med bokade platser
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const fetchBookedSeats = useCallback(() => {
    if (!selectedMovie || !selectedDate || !selectedTime) {
      return; // Don't fetch if we don't have all required parameters
    }
  
    const url = `http://localhost:5000/api/bookings/booked-seats?movie_id=${selectedMovie}&date=${selectedDate}&time=${selectedTime}`;
    
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setBookedSeats(data);
      })
      .catch((error) => {
        console.error('Error fetching booked seats:', error);
        setError('Det gick inte att hämta bokade platser');
      });
  }, [selectedMovie, selectedDate, selectedTime]);

  useEffect(() => {
    fetchBookedSeats();
  }, [fetchBookedSeats]);

  useEffect(() => {
    const rows = 5;
    const cols = 7;
    const map = [];
    for (let row = 0; row < rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < cols; col++) {
        rowSeats.push(`${String.fromCharCode(65 + row)}${col + 1}`);
      }
      map.push(rowSeats);
    }
    setSeatMap(map);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url(/booking.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="sm" sx={{ mt: 4, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 2, p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Boka Biljett
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {message && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>
            {message}
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          {/* Movie Dropdown */}
          <TextField
            select
            fullWidth
            label="Välj Film"
            value={selectedMovie}
            onChange={(e) => handleMovieChange(e.target.value)}
            sx={{ mb: 3 }}
          >
            {movies.map((movie) => (
              <MenuItem key={movie.id} value={movie.id}>
                {movie.title}
              </MenuItem>
            ))}
          </TextField>

          {/* Date Dropdown */}
          <TextField
            select
            fullWidth
            label="Välj Datum"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            sx={{ mb: 3 }}
            disabled={!availableShowings.length}
          >
            {Array.from(
              new Set(availableShowings.map((showing) => showing.date))
            ).map((date) => (
              <MenuItem key={date} value={date}>
                {date}
              </MenuItem>
            ))}
          </TextField>

          {/* Time Dropdown */}
          <TextField
            select
            fullWidth
            label="Välj Tid"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            sx={{ mb: 3 }}
            disabled={!selectedDate}
          >
            {availableShowings
              .filter((showing) => showing.date === selectedDate)
              .map((showing) => (
                <MenuItem key={showing.time} value={showing.time}>
                  {showing.time}
                </MenuItem>
              ))}
          </TextField>
          
          {/* Integrerade biljettpriser flyttade över salongsvyn */}
          <Box sx={{ mt: 4, p: 3, backgroundColor: "#f5f5f5", borderRadius: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Välj antal biljetter
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <TextField
                label="Vuxna"
                type="number"
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value) || 0)}
                sx={{ mr: 2, width: 100 }}
                inputProps={{ min: 0 }}
              />
              <Typography variant="body1">
                {priceAdult} kr per vuxen (Totalt: {adults * priceAdult} kr)
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <TextField
                label="Barn"
                type="number"
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                sx={{ mr: 2, width: 100 }}
                inputProps={{ min: 0 }}
              />
              <Typography variant="body1">
                {priceChild} kr per barn (Totalt: {children * priceChild} kr)
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <TextField
                label="Studenter"
                type="number"
                value={students}
                onChange={(e) => setStudents(parseInt(e.target.value) || 0)}
                sx={{ mr: 2, width: 100 }}
                inputProps={{ min: 0 }}
              />
              <Typography variant="body1">
                {priceStudent} kr per student (Totalt: {students * priceStudent} kr)
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ mt: 3 }}>
              Totalt: {totalPrice} kr
            </Typography>
          </Box>

          {/* Salongsvyn (seat map) */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Välj Platser
            </Typography>
            <Grid container spacing={2} justifyContent="center">
              {seatMap.map((row, rowIndex) => (
                <Grid
                  container
                  item
                  key={`row-${rowIndex}`}
                  spacing={1}
                  justifyContent="center"
                  sx={{ mb: 1 }} // Add margin between rows
                >
                  {row.map((seat, seatIndex) => {
                    const isBooked = bookedSeats.includes(seat); // Check if the seat is booked
                    const isSelected = selectedSeats.includes(seat);

                    return (
                      <Grid item key={`seat-${rowIndex}-${seatIndex}`}>
                        <Button
                          variant={isSelected ? 'contained' : 'outlined'}
                          color={isBooked ? 'error' : isSelected ? 'primary' : 'success'}
                          onClick={() => !isBooked && handleSeatClick(seat)}
                          sx={{
                            width: 50, // Width of the seat
                            height: 50, // Height of the seat
                            borderRadius: '50%', // Make the button circular like a seat
                            cursor: isBooked ? 'not-allowed' : 'pointer',
                            backgroundColor: isBooked
                              ? 'rgba(255, 0, 0, 0.5)' // Booked seats in red
                              : isSelected
                              ? 'rgba(0, 0, 255, 0.7)' // Selected seats in blue
                              : 'rgba(0, 255, 0, 0.5)', // Available seats in green
                            color: 'white', // Text color
                            '&:hover': {
                              backgroundColor: isBooked
                                ? 'rgba(255, 0, 0, 0.5)' // Prevent hover effect on booked seats
                                : 'rgba(0, 0, 255, 0.9)', // Darker blue on hover for selected seats
                            },
                          }}
                          disabled={isBooked} // Disable button if seat is booked
                        >
                          {seat}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Booking Button */}
          <Grid container justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              onClick={handleBooking}
              sx={{ mt: 4 }}
            >
              Boka
            </Button>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default Booking;
