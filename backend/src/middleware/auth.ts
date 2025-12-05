import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import  User  from '../models/User';
import Admin from '../models/admin'




const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
  id: string;
  type: string;
}

export const adminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      // Check if token is for admin
      if (decoded.type !== 'admin') {
        res.status(403).json({ message: 'Access denied. Admin access required.' });
        return;
      }

      // Find admin
      const admin = await Admin.findById(decoded.id).select('-password');

      if (!admin) {
        res.status(401).json({ message: 'Admin not found' });
        return;
      }

      if (!admin.isActive) {
        res.status(403).json({ message: 'Account is deactivated' });
        return;
      }

      req.user = {
        id: admin._id.toString(),
        email: admin.email,
      };

      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid or expired token' });
      return;
    }
  } catch (error: any) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ message: 'Server error in authentication' });
  }
};

// Middleware to check for super admin
export const superAdminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const admin = await Admin.findById(req.user?.id);

    if (!admin) {
      res.status(401).json({ message: 'Admin not found' });
      return;
    }

    if (admin.role !== 'super_admin') {
      res.status(403).json({ message: 'Super admin access required' });
      return;
    }

    next();
  } catch (error: any) {
    console.error('Super admin auth error:', error);
    res.status(500).json({ message: 'Server error in authentication' });
  }
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // convert mongoose document to a plain object and cast to any to satisfy the Request type
    req.user = (user && (user as any).toObject ? (user as any).toObject() : user) as any;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};