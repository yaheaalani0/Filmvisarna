import express from 'express';
import { fetchMovie } from '../omdb.js';
import { addMovie, getAllMovies, getMovieById } from '../models/movieModel.js';

const router = express.Router();

// Hämta alla filmer
router.get('/', (req, res) => {
  const movies = getAllMovies();
  res.json(movies);
});

// Hämta detaljerad om en film
router.get('/:id', (req, res) => {
  const movie = getMovieById(req.params.id);
  if (movie) res.json(movie);
  else res.status(404).send('Filmen hittades inte');
});

// Lägg till film från OMDb API
router.post('/add', async (req, res) => {
  const { title } = req.body;
  try {
    const movieData = await fetchMovie(title);
    addMovie(movieData);
    res.status(201).json({ message: 'Film tillagd!' });
  } catch (err) {
    res.status(500).json({ error: 'Kunde inte hämta filminfö' });
  }
});

export default router;