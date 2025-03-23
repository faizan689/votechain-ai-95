
import jwt from 'jsonwebtoken';

// JWT secret keys (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'voteguard_secret_key';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'voteguard_admin_secret_key';

/**
 * Middleware to authenticate voter JWT token
 */
export function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
}

/**
 * Middleware to authenticate admin JWT token
 */
export function authenticateAdminToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication token required' });
  }
  
  jwt.verify(token, ADMIN_JWT_SECRET, (err: any, user: any) => {
    if (err || !user.isAdmin) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
}
