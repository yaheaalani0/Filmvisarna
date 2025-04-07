import express from 'express';
import { addShowing, getShowingsByMovie } from '../models/showingModel.js';

const router = express.Router();

// Lägg till en visning
router.post('/add', (req, res) => {
  const { movie_id, date, time } = req.body;
  try {
    addShowing(movie_id, date, time);
    res.status(201).json({ message: 'Visning tillagd!' });
  } catch (err) {
    res.status(500).json({ error: 'Kunde inte lägga till visning' });
  }
});

// Hämta alla visningar för en film
router.get('/:movie_id', (req, res) => {
  try {
    const showings = getShowingsByMovie(req.params.movie_id);
    res.json(showings);
  } catch (err) {
    res.status(500).json({ error: 'Kunde inte hämta visningar' });
  }
});

export default router;