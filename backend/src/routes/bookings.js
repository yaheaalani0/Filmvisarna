import express from "express";
import db from "../../db.js";

const router = express.Router();

// Get booked seats for a specific movie, date, and time
router.get("/booked-seats", (req, res) => {
  console.log('Received query parameters:', req.query);

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
    console.log('Query result:', rows);

    // Combine all booked seats into a single array
    const bookedSeats = rows.flatMap((row) => JSON.parse(row.seats));
    res.json(bookedSeats);
  } catch (err) {
    console.error("Error fetching booked seats:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Add a new booking
router.post("/", (req, res) => {
  const { movie_id, date, time, seats } = req.body;

  if (!movie_id || !date || !time || !seats || seats.length === 0) {
    return res.status(400).json({
      error: "Missing required fields: movie_id, date, time, or seats",
    });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO bookings (movie_id, date, time, seats)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(movie_id, date, time, JSON.stringify(seats)); // Store seats as a JSON string
    res.status(201).json({ message: "Booking successful!" });
  } catch (err) {
    console.error("Error adding booking:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
