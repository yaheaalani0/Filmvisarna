import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../components/AuthContext';

function BookingPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!isLoggedIn || !token) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [isLoggedIn, token, navigate]);

  const fetchBookings = async () => {
    try {
      // Use different endpoint based on user role
      const endpoint = userRole === 'admin' 
        ? "http://localhost:5000/api/bookings/all"
        : "http://localhost:5000/api/bookings/my-bookings";

      console.log("Fetching bookings with token:", token);
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      console.log("Received bookings:", data);
      setBookings(data);
    } catch (err) {
      console.error("Error in fetchBookings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setNewDate(booking.date);
    setNewTime(booking.time);
    setEditDialogOpen(true);
  };

  const handleUpdateBooking = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/${selectedBooking.booking_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: newDate,
            time: newTime,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      setMessage("Bokning uppdaterad!");
      setEditDialogOpen(false);
      fetchBookings(); // Refresh bookings list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm("Är du säker på att du vill ta bort denna bokning?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete booking");
      }

      setMessage("Bokning borttagen!");
      fetchBookings(); // Refresh bookings list
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#0d0d0d", // svart bakgrund över hela sidan
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          color: "white",
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          {userRole === "admin" ? "Alla Bokningar" : "Mina Bokningar"}
        </Typography>

        {message && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setMessage("")}
          >
            {message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {bookings.length === 0 ? (
          <Typography>Inga bokningar hittades.</Typography>
        ) : (
          <Grid container spacing={3}>
            {bookings.map((booking) => (
              <Grid item xs={12} md={6} key={booking.booking_id}>
                <Card
                  sx={{
                    backgroundColor: "#1c1c1c",
                    color: "white",
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <img
                          src={booking.poster}
                          alt={booking.movie_title}
                          style={{
                            width: "100%",
                            height: "auto",
                            borderRadius: "4px",
                          }}
                        />
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="h6">
                          {booking.movie_title}
                        </Typography>
                        {userRole === "admin" && (
                          <Typography>
                            <strong>Användare:</strong> {booking.user_name}
                          </Typography>
                        )}
                        <Typography>
                          <strong>Datum:</strong> {booking.date}
                        </Typography>
                        <Typography>
                          <strong>Tid:</strong> {booking.time}
                        </Typography>
                        <Typography>
                          <strong>Pris:</strong> {booking.totalPrice} kr
                        </Typography>
                        <Typography>
                          <strong>Platser:</strong> {booking.seats.join(", ")}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="outlined"
                            onClick={() => handleEdit(booking)}
                            sx={{
                              mr: 1,
                              borderColor: "white",
                              color: "white",
                            }}
                          >
                            Ändra tid
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(booking.booking_id)}
                            sx={{ borderColor: "white", color: "white" }}
                          >
                            Ta bort
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogTitle>Ändra bokningstid</DialogTitle>
          <DialogContent>
            <TextField
              label="Nytt datum"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Ny tid"
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Avbryt</Button>
            <Button onClick={handleUpdateBooking} variant="contained">
              Uppdatera
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default BookingPage;