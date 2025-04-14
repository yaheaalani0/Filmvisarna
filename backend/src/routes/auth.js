import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../../db.js';

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY; // Byt ut mot en säker nyckel och spara i .env

// Registrering för admin
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Användarnamn och lösenord krävs' });
  }

  try {
    // Kontrollera om användaren redan finns
    db.get('SELECT username FROM admins WHERE username = ?', [username], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Databasfel' });
      }
      if (row) {
        return res.status(400).json({ error: 'Användarnamn finns redan' });
      }

      // Kryptera lösenord
      const hashedPassword = await bcrypt.hash(password, 10);

      // Spara admin i databasen
      db.run(
        'INSERT INTO admins (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Kunde inte registrera admin' });
          }
          res.status(201).json({ message: 'Admin registrerad' });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Serverfel' });
  }
});

// Inloggning för admin
router.post('/admin', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Användarnamn och lösenord krävs' });
  }

  // Hämta admin från databasen
  db.get('SELECT * FROM admins WHERE username = ?', [username], async (err, admin) => {
    if (err) {
      return res.status(500).json({ error: 'Databasfel' });
    }
    if (!admin) {
      return res.status(401).json({ error: 'Fel användarnamn eller lösenord' });
    }

    // Jämför lösenord
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Fel användarnamn eller lösenord' });
    }

    // Skapa JWT-token
    const token = jwt.sign({ id: admin.id, username: admin.username }, SECRET_KEY, {
      expiresIn: '1h',
    });

    res.json({ token });
  });
});

// Middleware för att skydda admin-rutter
export const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Ingen token angiven' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Ogiltig token' });
  }
};

// Exempel på skyddad admin-rutt
router.get('/admin/dashboard', authenticateAdmin, (req, res) => {
  res.json({ message: `Välkommen, ${req.admin.username}!` });
});

export default router;