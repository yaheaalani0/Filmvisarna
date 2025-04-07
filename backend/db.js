import Database from 'better-sqlite3';

const db = new Database('database.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    year TEXT,
    imdbID TEXT UNIQUE,
    poster TEXT,
    trailer TEXT,
    plot TEXT
  );

  CREATE TABLE IF NOT EXISTS showings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER,
    date TEXT,
    time TEXT,
    FOREIGN KEY(movie_id) REFERENCES movies(id)
  );
`);

export default db;