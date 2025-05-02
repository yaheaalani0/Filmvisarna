import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET_KEY || '123123';

export function authenticateToken(req, res, next) {
  console.log("Auth Middleware - Headers:", req.headers);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.error("No token provided. Auth Header:", authHeader);
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token verification successful:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(403).json({ error: 'Invalid token' });
  }
}

export function requireAdmin(req, res, next) {
  console.log("Admin check - User data:", req.user);
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
}
