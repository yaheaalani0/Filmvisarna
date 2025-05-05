import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../../db.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET_KEY || '123123';

// Login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  // Check admin table first
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
  if (admin && admin.password === password) {
    const token = jwt.sign({ id: admin.id, username, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token, role: 'admin' });
  }

  // Check regular users table
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (user && user.password === password) {
    const token = jwt.sign({ 
      id: user.id, 
      username, 
      email: user.email, 
      role: 'user' 
    }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token, role: 'user' });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

// Token verification endpoint
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Registration endpoint
router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Missing username, email or password' });
  }

  try {
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this username or email already exists' });
    }

    const insert = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
    const result = insert.run(username, email, password);
    const token = jwt.sign({ id: result.lastInsertRowid, username, email, role: 'user' }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token, role: 'user' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    const stmt = db.prepare('SELECT id, username, email FROM users ORDER BY username');
    const users = stmt.all();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update user email (admin only)
router.put('/users/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const stmt = db.prepare('UPDATE users SET email = ? WHERE id = ?');
    const result = stmt.run(email, id);
    
    if (result.changes) {
      res.json({ message: 'User email updated successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;