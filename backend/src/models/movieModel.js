import db from '../../db.js';


export function addMovie(movie) {
  const stmt = db.prepare(`INSERT OR IGNORE INTO movies (title, year, imdbID, poster, plot) VALUES (?, ?, ?, ?, ?)`);
  stmt.run(movie.Title, movie.Year, movie.imdbID, movie.Poster, movie.Plot);
}

export function getAllMovies() {
  return db.prepare('SELECT * FROM movies').all();
}

export function getMovieById(id) {
  return db.prepare('SELECT * FROM movies WHERE id = ?').get(id);
}