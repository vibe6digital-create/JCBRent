import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../config/firebase';
import { UserRole } from '../types';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    role: UserRole;
    phone: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    res.status(401).json({ error: 'No authentication token provided' });
    return;
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    const userData = userDoc.data();

    if (userData?.isActive === false) {
      res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
      return;
    }

    req.user = {
      uid: decoded.uid,
      role: userData?.role || 'customer',
      phone: decoded.phone_number || '',
    };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
};
