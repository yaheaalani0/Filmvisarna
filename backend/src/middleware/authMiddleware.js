import jwt from 'jsonwebtoken';

const JWT_SECRET = '123123';

export function authenticateToken(req, res, next) {
  console.log("Authorization header:", req.headers['authorization']);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.error("No token provided.");
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.log("Decoded token:", user);
    req.user = user;
    next();
  });
}

export function requireAdmin(req, res, next) {
  console.log("Decoded token in requireAdmin:", req.user);
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
}
