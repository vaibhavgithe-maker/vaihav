import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { queryOne, UserRow } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'store-rating-intern-challenge-secret-key-2026';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  address: string;
  role: 'admin' | 'normal' | 'store_owner';
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function generateToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Authentication token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    // Verify user still exists in database
    const user = queryOne<UserRow>('SELECT id, name, email, address, role FROM users WHERE id = ?', [decoded.id]);
    if (!user) {
      res.status(401).json({ error: 'User not found or account deactivated' });
      return;
    }
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role as 'admin' | 'normal' | 'store_owner',
    };
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }
}

export function requireRole(allowedRoles: Array<'admin' | 'normal' | 'store_owner'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: `Access denied. Requires one of: ${allowedRoles.join(', ')}` });
      return;
    }
    next();
  };
}
