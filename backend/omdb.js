import axios from 'axios';
import dotenv from 'dotenv';
import db from './db.js';  // Make sure this path points to your db.js file

dotenv.config();
const OMDB_API_KEY = process.env.OMDB_API_KEY;

const movieTitles = ['batman', 'The Matrix', 'Interstellar'];

// Hämta filmdata från OMDb
export async function fetchMovie(title) {
  const url = `http://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${3e879038}&plot=full&r=json`;
  const response = await axios.get(url);
  if (response.data.Response === 'True') {
    return {
      title: response.data.Title,
      year: response.data.Year,
      imdbID: response.data.imdbID,
      genre: response.data.Genre,
      runtime: response.data.Runtime,
      poster: response.data.Poster,
      trailer: response.data.trailer,
      plot: response.data.Plot,
    };
  } else {
    throw new Error(`Film ej hittad: ${response.data.Error}`);
  }
}

// 💾 Funktion: Spara film i databasen
function saveMovie(movie) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO movies 
    (title, year, imdbID, poster, trailer, plot, genre, runtime)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    movie.title,
    movie.year,
    movie.imdbID || '',
    movie.poster,
    movie.trailer,
    movie.plot,
    movie.genre,
    movie.runtime
  );
}

// ▶️ Starta import
async function importMovies() {
  for (const title of movieTitles) {
    try {
      const movie = await fetchMovie(title);
      saveMovie(movie);
      console.log(`✅ Film importerad: ${movie.title}`);
    } catch (err) {
      console.error(err.message);
    }
  }
}

importMovies();
