import express from 'express';
import db from '../../db.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all showings with movie details
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        s.*,
        m.id as movie_id,
        m.title as movie_title,
        m.poster,
        m.year,
        m.genre,
        m.runtime,
        m.plot
      FROM showings s
      JOIN movies m ON s.movie_id = m.id
      ORDER BY s.date, s.time
    `);
    const showings = stmt.all();
    res.json(showings);
  } catch (err) {
    console.error('Error fetching showings:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Add a new showing (admin only)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const { movie_id, date, time } = req.body;

  if (!movie_id || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields: movie_id, date, or time' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO showings (movie_id, date, time)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(movie_id, date, time);
    res.status(201).json({ message: 'Showing added successfully', id: result.lastInsertRowid });
  } catch (err) {
    console.error('Error adding showing:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get showings by movie ID
router.get('/:movie_id', (req, res) => {
  const { movie_id } = req.params;

  try {
    const stmt = db.prepare(`
      SELECT * FROM showings
      WHERE movie_id = ?
    `);
    const showings = stmt.all(movie_id);

    if (showings.length === 0) {
      // Add a default showing with time 18:00 if no showings exist
      const defaultShowing = { movie_id, date: '2025-04-20', time: '18:00' };
      return res.json([defaultShowing]);
    }

    res.json(showings);
  } catch (err) {
    console.error('Error fetching showings:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/time/:time', (req, res) => {
  const time = req.params.time; // expect "18:00" for example
  try {
    const stmt = db.prepare("SELECT * FROM showings WHERE time = ?");
    const showings = stmt.all(time);
    res.json(showings);
  } catch (err) {
    console.error("Error in GET /api/showings/time/:time:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/add-default-18', authenticateToken, requireAdmin, (req, res) => {
  try {
    // Get all movie IDs from the movies table
    const moviesStmt = db.prepare("SELECT id FROM movies");
    const movies = moviesStmt.all();
    let count = 0;
    
    movies.forEach(movie => {
      // Check if a showing with time '18:00' exists for this movie
      const existingShowing = db.prepare("SELECT * FROM showings WHERE movie_id = ? AND time = '18:00'").get(movie.id);
      if (!existingShowing) {
        // Use a default date or allow override via req.body.date
        const defaultDate = req.body.date || '2025-04-20';
        const insertStmt = db.prepare("INSERT INTO showings (movie_id, date, time) VALUES (?, ?, '18:00')");
        insertStmt.run(movie.id, defaultDate);
        count++;
      }
    });

    res.json({ message: `Default 18:00 showing added for ${count} movies.` });
  } catch (err) {
    console.error("Error in POST /api/showings/add-default-18:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get showings by date
router.get('/date/:date', (req, res) => {
  const { date } = req.params;
  try {
    const stmt = db.prepare(`
      SELECT 
        s.*,
        m.id as movie_id,
        m.title as movie_title,
        m.poster,
        m.year,
        m.genre,
        m.runtime,
        m.plot
      FROM showings s
      JOIN movies m ON s.movie_id = m.id
      WHERE s.date = ?
      ORDER BY s.time
    `);
    const showings = stmt.all(date);
    res.json(showings);
  } catch (err) {
    console.error('Error fetching showings by date:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Similarly, add endpoints for deleting or updating showings restricted to admin

export default router;