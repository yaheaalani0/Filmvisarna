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
    plot TEXT,
    genre TEXT,
    runtime TEXT
  );

  CREATE TABLE IF NOT EXISTS showings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER,
    date TEXT,
    time TEXT,
    FOREIGN KEY(movie_id) REFERENCES movies(id)
  );

  INSERT OR IGNORE INTO movies (title, year, imdbID, poster, trailer, plot, genre, runtime)
  VALUES (
    'Inception',
    '2010',
    'tt1375666',
    'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
    'https://www.youtube.com/watch?v=YoHD9XEInc0',
    'Dom Cobb (Leonardo DiCaprio) is a thief with the rare ability to enter people''s dreams and steal their secrets from their subconscious. His skill has made him a hot commodity in the world of corporate espionage but has also cost him everything he loves. Cobb gets a chance at redemption when he is offered a seemingly impossible task: Plant an idea in someone''s mind. If he succeeds, it will be the perfect crime, but a dangerous enemy anticipates Cobb''s every move.',
    'Sci-Fi, Thriller',
    '148 min'
  );

  INSERT OR IGNORE INTO showings (movie_id, date, time)
  VALUES (1, '2025-04-10', '18:00');
`);

export default db;
