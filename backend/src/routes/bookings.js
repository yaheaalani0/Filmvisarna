import express from "express";
import db from "../../db.js";
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user's bookings
router.get("/my-bookings", authenticateToken, async (req, res) => {
  console.log("Received request for my-bookings with user:", req.user);
  
  try {
    const userId = req.user.id; // Get user ID directly from the token

    const stmt = db.prepare(`
      SELECT 
        b.id as booking_id,
        b.movie_id,
        b.date,
        b.time,
        b.seats,
        m.title as movie_title,
        m.poster
      FROM bookings b
      JOIN movies m ON b.movie_id = m.id
      WHERE b.user_id = ?
      ORDER BY b.date, b.time
    `);
    
    const bookings = stmt.all(userId);
    console.log("Found bookings:", bookings);
    
    res.json(bookings.map(booking => ({
      ...booking,
      seats: JSON.parse(booking.seats || '[]')
    })));
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get booked seats for a specific movie, date, and time
router.get("/booked-seats", (req, res) => {
  const { movie_id, date, time } = req.query;

  if (!movie_id || !date || !time) {
    return res.status(400).json({
      error: "Missing required query parameters: movie_id, date, or time",
    });
  }

  try {
    const stmt = db.prepare(`
      SELECT seats FROM bookings
      WHERE movie_id = ? AND date = ? AND time = ?
    `);
    const rows = stmt.all(movie_id, date, time);

    // Combine all booked seats into a single array
    const bookedSeats = rows.flatMap((row) => JSON.parse(row.seats));
    res.json(bookedSeats);
  } catch (err) {
    console.error("Error fetching booked seats:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Add a new booking
router.post("/", authenticateToken, async (req, res) => {
  const { movie_id, date, time, seats } = req.body;
  const userId = req.user.id; // Get user ID directly from the token

  if (!movie_id || !date || !time || !seats || seats.length === 0) {
    return res.status(400).json({
      error: "Missing required fields: movie_id, date, time, or seats",
    });
  }

  try {
    // Check if seats are already booked
    const bookedSeats = db.prepare(`
      SELECT seats FROM bookings
      WHERE movie_id = ? AND date = ? AND time = ?
    `).all(movie_id, date, time);

    const allBookedSeats = bookedSeats.flatMap(row => JSON.parse(row.seats));
    const hasConflict = seats.some(seat => allBookedSeats.includes(seat));

    if (hasConflict) {
      return res.status(400).json({ error: "Some seats are already booked" });
    }

    const stmt = db.prepare(`
      INSERT INTO bookings (user_id, movie_id, date, time, seats)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(userId, movie_id, date, time, JSON.stringify(seats));
    res.status(201).json({ message: "Booking successful!" });
  } catch (err) {
    console.error("Error adding booking:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update booking
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { date, time } = req.body;
  const userId = req.user.id; // Get user ID directly from the token

  if (!date || !time) {
    return res.status(400).json({ error: "New date and time are required" });
  }

  try {
    // First check if the booking belongs to the user
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(id, userId);
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found or unauthorized" });
    }

    // Check if the new time slot is available
    const bookedSeats = db.prepare(`
      SELECT seats FROM bookings
      WHERE movie_id = ? AND date = ? AND time = ? AND id != ?
    `).all(booking.movie_id, date, time, id);

    const allBookedSeats = bookedSeats.flatMap(row => JSON.parse(row.seats));
    const bookingSeats = JSON.parse(booking.seats);
    const hasConflict = bookingSeats.some(seat => allBookedSeats.includes(seat));

    if (hasConflict) {
      return res.status(400).json({ error: "Selected seats are not available at the new time" });
    }

    // Update the booking
    const updateStmt = db.prepare('UPDATE bookings SET date = ?, time = ? WHERE id = ?');
    updateStmt.run(date, time, id);

    res.json({ message: "Booking updated successfully" });
  } catch (err) {
    console.error("Error updating booking:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete booking
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  try {
    // First check if the booking exists and if the user is authorized
    const booking = isAdmin 
      ? db.prepare('SELECT * FROM bookings WHERE id = ?').get(id)
      : db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(id, userId);
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found or unauthorized" });
    }

    // Delete the booking
    const deleteStmt = db.prepare('DELETE FROM bookings WHERE id = ?');
    deleteStmt.run(id);

    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all bookings (admin only)
router.get("/all", authenticateToken, requireAdmin, (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        b.id as booking_id,
        b.movie_id,
        b.date,
        b.time,
        b.seats,
        m.title as movie_title,
        m.poster,
        u.username as user_name,
        u.email as user_email
      FROM bookings b
      JOIN movies m ON b.movie_id = m.id
      JOIN users u ON b.user_id = u.id
      ORDER BY b.date, b.time
    `);
    
    const bookings = stmt.all();
    res.json(bookings.map(booking => ({
      ...booking,
      seats: JSON.parse(booking.seats || '[]')
    })));
  } catch (err) {
    console.error("Error fetching all bookings:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
