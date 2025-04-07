import db from '../db.js';

export function addShowing(movie_id, date, time) {
  const stmt = db.prepare(`INSERT INTO showings (movie_id, date, time) VALUES (?, ?, ?)`);
  stmt.run(movie_id, date, time);
}

export function getShowingsByMovie(movie_id) {
  return db.prepare('SELECT * FROM showings WHERE movie_id = ?').all(movie_id);
}