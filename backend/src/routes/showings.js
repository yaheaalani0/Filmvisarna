import express from 'express';
import db from '../../db.js';

const router = express.Router();

// Add a new showing
router.post('/', (req, res) => {
  const { movie_id, date, time } = req.body;

  if (!movie_id || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields: movie_id, date, or time' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO showings (movie_id, date, time)
      VALUES (?, ?, ?)
    `);
    stmt.run(movie_id, date, time);
    res.status(201).json({ message: 'Showing added successfully!' });
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

export default router;