import Database from "better-sqlite3";

const db = new Database("database.db");

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY,
    title TEXT,
    year TEXT,
    imdbID TEXT UNIQUE,
    poster TEXT,
    trailer TEXT,
    plot TEXT,
    genre TEXT,
    runtime TEXT
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS showings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER,
    date TEXT,
    time TEXT,
    FOREIGN KEY(movie_id) REFERENCES movies(id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER,
    date TEXT,
    time TEXT,
    seats TEXT, -- Add this column to store selected seats
    FOREIGN KEY(movie_id) REFERENCES movies(id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
`);

// Check if the 'seats' column exists in the 'bookings' table
const columnExists = db
  .prepare(`PRAGMA table_info(bookings)`)
  .all()
  .some((column) => column.name === "seats");

if (!columnExists) {
  db.exec(`ALTER TABLE bookings ADD COLUMN seats TEXT;`);
}

export default db;
