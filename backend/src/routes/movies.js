import express from 'express';
import axios from 'axios';
import db from '../../db.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const OMDB_API_KEY = process.env.OMDB_API_KEY;

// Function to fetch movie details from OMDb
export async function fetchMovie(title) {
  try {
    const url = `http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}&plot=full&r=json`;
    const response = await axios.get(url);
    console.log("OMDb response:", response.data); // Debug log
    if (response.data.Response === 'True') {
      return {
        title: response.data.Title,
        year: response.data.Year,
        imdbID: response.data.imdbID,
        genre: response.data.Genre,
        runtime: response.data.Runtime,
        poster: response.data.Poster,
        trailer: response.data.trailer || '',
        plot: response.data.Plot,
      };
    } else {
      // This error message is from OMDb, e.g. "Movie not found!"
      throw new Error(response.data.Error);
    }
  } catch (err) {
    console.error("Error in fetchMovie:", err.message);
    throw err;
  }
}

// Get all movies (accessible to everyone)
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM movies");
    const movies = stmt.all();
    res.json(movies);
  } catch (err) {
    console.error("Error in GET /api/movies:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get a movie by ID (accessible to everyone)
router.get('/:id', (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM movies WHERE id = ?");
    const movie = stmt.get(req.params.id);
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).json({ error: "Movie not found" });
    }
  } catch (err) {
    console.error("Error in GET /api/movies/:id:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/movies/add endpoint (admin only)
router.post('/add', authenticateToken, requireAdmin, async (req, res) => {
  const { title, trailer: providedTrailer } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Movie title is required' });
  }
  try {
    const movieData = await fetchMovie(title);

    // Log the fetched trailer before override
    console.log("Fetched trailer:", movieData.trailer);
    // Override the trailer with the provided value, if any
    if (providedTrailer) {
      movieData.trailer = providedTrailer;
      console.log("Overridden trailer:", movieData.trailer);
    }

    // Upsert the movie so that if it already exists (by imdbID) the trailer gets updated.
    const insertOrUpdate = db.prepare(`
      INSERT INTO movies (title, year, imdbID, poster, trailer, plot, genre, runtime)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(imdbID) DO UPDATE SET trailer = excluded.trailer
    `);
    insertOrUpdate.run(
      movieData.title,
      movieData.year,
      movieData.imdbID || '',
      movieData.poster,
      movieData.trailer,
      movieData.plot,
      movieData.genre,
      movieData.runtime
    );
    res.status(201).json({ message: 'Movie added!', movie: movieData });
  } catch (err) {
    console.error("Error in POST /api/movies/add:", err.message);
    if (err.message.toLowerCase().includes("not found")) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
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

// PUT endpoint to update a movie (e.g., updating the trailer field, restricted to admin)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { trailer } = req.body; // Expecting a JSON body with the trailer field

  if (!trailer) {
    return res.status(400).json({ error: 'Trailer URL is required' });
  }

  try {
    const stmt = db.prepare("UPDATE movies SET trailer = ? WHERE id = ?");
    const result = stmt.run(trailer, id);

    if (result.changes) {
      res.json({ message: 'Movie updated successfully' });
    } else {
      res.status(404).json({ error: 'Movie not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  console.log("Attempting to delete movie with id:", id);
  try {
    const stmt = db.prepare("DELETE FROM movies WHERE id = ?");
    const result = stmt.run(id);
    if (result.changes > 0) {
      res.json({ message: `Movie with id ${id} deleted successfully` });
    } else {
      res.status(404).json({ error: "Movie not found" });
    }
  } catch (err) {
    console.error("Error in DELETE /api/movies/:id:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;