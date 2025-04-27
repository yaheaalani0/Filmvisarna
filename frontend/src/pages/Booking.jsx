import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
} from "@mui/material";

function Booking() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableShowings, setAvailableShowings] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatMap, setSeatMap] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);

  // Fetch movies from backend
  useEffect(() => {
    fetch("http://localhost:3000/api/movies")
      .then((response) => response.json())
      .then((data) => setMovies(data))
      .catch((error) => console.error("Error fetching movies:", error));
  }, []);

  const handleMovieChange = (movieId) => {
    setSelectedMovie(movieId);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedSeats([]);

    fetch(`http://localhost:3000/api/showings/${movieId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('No showings found for this movie');
        }
        return response.json();
      })
      .then((data) => {
        if (data.length === 0) {
          // Add default showing if no showings exist
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
    if (!selectedMovie || !selectedDate || !selectedTime || selectedSeats.length === 0) {
      alert("Please select a movie, date, time, and at least one seat.");
      return;
    }
  
    const bookingData = {
      movie_id: selectedMovie,
      date: selectedDate,
      time: selectedTime,
      seats: selectedSeats,
    };
  
    console.log("Sending booking request to:", "http://localhost:3000/api/bookings");
    console.log("Booking data:", bookingData);
  
    fetch("http://localhost:3000/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    })
      .then((response) => {
        if (response.ok) {
          alert("Booking successful!");
          setSelectedSeats([]); // Clear selected seats
          fetchBookedSeats(); // Refetch booked seats to update the seat map
        } else {
          alert("Failed to book. Please try again.");
        }
      })
      .catch((error) => console.error("Error booking:", error));
  };

  const fetchBookedSeats = useCallback(() => {
    if (!selectedMovie || !selectedDate || !selectedTime) {
      console.error('Missing required parameters:', {
        selectedMovie,
        selectedDate,
        selectedTime,
      });
      return;
    }
  
    const url = `http://localhost:3000/api/bookings/booked-seats?movie_id=${selectedMovie}&date=${selectedDate}&time=${selectedTime}`;
    console.log('Fetching booked seats from:', url);
  
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Booked seats:', data);
        setBookedSeats(data);
      })
      .catch((error) => console.error('Error fetching booked seats:', error));
  }, [selectedMovie, selectedDate, selectedTime]);

  // Fetch booked seats whenever movie, date, or time changes
  useEffect(() => {
    fetchBookedSeats();
  }, [fetchBookedSeats]);

  // Example seat map (5 rows x 7 columns)
  useEffect(() => {
    const rows = 5; // Number of rows
    const cols = 7; // Number of seats per row
    const map = [];
    for (let row = 0; row < rows; row++) {
      const rowSeats = [];
      for (let col = 0; col < cols; col++) {
        rowSeats.push(`${String.fromCharCode(65 + row)}${col + 1}`); // A1, A2, etc.
      }
      map.push(rowSeats);
    }
    setSeatMap(map);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url(/booking.jpg)', // Replace with your image path
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

          {/* Seat Map */}
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
