import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';


export function authenticateToken(req, res, next) {
  let token;
  if (req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1];
  }
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, userData) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = userData;
    next();
  });
}

export function authorizeAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
}
