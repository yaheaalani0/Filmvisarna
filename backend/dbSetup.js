import db from './db.js'; // Importera din databasinstans

// Skapa tabeller om de inte finns
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    movie_id INTEGER,
    date TEXT,
    time TEXT,
    seats TEXT,
    FOREIGN KEY(movie_id) REFERENCES movies(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Rensa gamla bokningar som inte har ett user_id
db.exec(`DELETE FROM bookings WHERE user_id IS NULL;`);

// Lägg in en admin-användare med hårdkodade uppgifter om den inte redan finns
const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin');
if (!admin) {
  // OBS! I en riktig applikation bör du hasha lösenordet istället för att lagra det som klartext.
  db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('admin', 'adminpass');
  console.log('Admin användare skapad: admin / adminpass');
} else {
  console.log('Admin redan existerar');
}