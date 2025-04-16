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

router.post('/', (req, res) => {
  const { title, year, imdbID, poster, trailer, plot, genre, runtime } = req.body;

  if (!title || !year || !imdbID) {
    return res.status(400).json({ error: 'Missing required fields: title, year, or imdbID' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO movies (title, year, imdbID, poster, trailer, plot, genre, runtime)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(title, year, imdbID, poster, trailer, plot, genre, runtime);

    // Automatically add a showing with time 18:00
    const showingStmt = db.prepare(`
      INSERT INTO showings (movie_id, date, time)
      VALUES (?, ?, ?)
    `);
    showingStmt.run(result.lastInsertRowid, '2025-04-20', '18:00'); // Example date

    res.status(201).json({ message: 'Movie and showing added successfully!' });
  } catch (err) {
    console.error('Error adding movie:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;