import express from 'express';
import { addShowing, getShowingsByMovie } from '../models/showingModel.js';

const router = express.Router();

// Add a showing
router.post('/add', (req, res) => {
  const { movie_id, date, time } = req.body;
  try {
    addShowing(movie_id, date, time);
    res.status(201).json({ message: 'Showing added!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get showings by movie ID
router.get('/:movie_id', (req, res) => {
  const showings = getShowingsByMovie(req.params.movie_id);
  if (showings.length > 0) res.json(showings);
  else res.status(404).send('No showings found for this movie');
});

export default router;