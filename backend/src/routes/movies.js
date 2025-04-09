import express from 'express';
import { getAllMovies, getMovieById, addMovie } from '../models/movieModel.js';
import { fetchMovie } from '../../omdb.js';

const router = express.Router();

// Get all movies
router.get('/', (req, res) => {
  const movies = getAllMovies();
  res.json(movies);
});

// Get a movie by ID
router.get('/:id', (req, res) => {
  const movie = getMovieById(req.params.id);
  if (movie) res.json(movie);
  else res.status(404).send('Movie not found');
});

// Add a movie using OMDb API
router.post('/add', async (req, res) => {
  const { title } = req.body;
  try {
    const movieData = await fetchMovie(title);
    addMovie(movieData);
    res.status(201).json({ message: 'Movie added!', movie: movieData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;