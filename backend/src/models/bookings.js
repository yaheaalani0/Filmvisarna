import db from '../../db.js';

export function addBooking(movie_id, date, time, seats) {
  const stmt = db.prepare(`
    INSERT INTO bookings (movie_id, date, time, seats)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(movie_id, date, time, JSON.stringify(seats)); // Store seats as a JSON string
}