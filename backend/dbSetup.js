import db from './db.js'; // Importera din databasinstans

// Skapa admin-tabell om den inte finns
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );
`);

// Lägg in en admin-användare med hårdkodade uppgifter om den inte redan finns
const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin');
if (!admin) {
  // OBS! I en riktig applikation bör du hasha lösenordet istället för att lagra det som klartext.
  db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('admin', 'adminpass');
  console.log('Admin användare skapad: admin / adminpass');
} else {
  console.log('Admin redan existerar');
}