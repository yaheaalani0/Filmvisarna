import Database from "better-sqlite3";

const db = new Database("database.db");

// Enable foreign key support
db.exec('PRAGMA foreign_keys = ON;');

// Create tables in correct order (referenced tables first)
db.exec(`
  -- Movies table (referenced by showings and bookings)
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

  -- Users table (referenced by bookings)
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  -- Admins table (independent)
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  -- Showings table (references movies)
  CREATE TABLE IF NOT EXISTS showings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER,
    date TEXT,
    time TEXT,
    FOREIGN KEY(movie_id) REFERENCES movies(id)
  );

  -- Bookings table (references both movies and users)
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    movie_id INTEGER,
    date TEXT,
    time TEXT,
    seats TEXT,
    FOREIGN KEY(movie_id) REFERENCES movies(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Handle users table migration for email column
const emailColumnExists = db
  .prepare("PRAGMA table_info(users)")
  .all()
  .some((column) => column.name === "email");

if (!emailColumnExists) {
  // Begin transaction
  db.exec('BEGIN TRANSACTION;');
  
  try {
    // Create temporary table with email
    db.exec(`
      CREATE TABLE users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT
      );
    `);

    // Copy existing data to new table
    db.exec(`
      INSERT INTO users_new (id, username, password, email)
      SELECT id, username, password, username || '@placeholder.com' FROM users;
    `);

    // Drop old table and its dependencies first
    db.exec('DROP TABLE IF EXISTS bookings;');  // Drop dependent table first
    db.exec('DROP TABLE IF EXISTS users;');     // Then drop the users table

    // Rename new table to users
    db.exec('ALTER TABLE users_new RENAME TO users;');

    // Recreate bookings table with proper constraints
    db.exec(`
      CREATE TABLE bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        movie_id INTEGER,
        date TEXT,
        time TEXT,
        seats TEXT,
        FOREIGN KEY(movie_id) REFERENCES movies(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
    `);

    // Add unique constraint to email after migration
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);');

    // Commit transaction
    db.exec('COMMIT;');
  } catch (error) {
    // If anything goes wrong, rollback
    db.exec('ROLLBACK;');
    throw error;
  }
}

export default db;
