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

      (req as any).user = {
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

// ...existing code...

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      type?: string;
    };

    // Check if it's a user token (not admin)
    if (decoded.type === 'admin') {
      return res.status(403).json({ error: 'Invalid token type' });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    // Attach user to request - use consistent format
    req.user = user.toObject() as any;
    (req.user as any).userId = user._id.toString();

    next();
  } catch (err: any) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ error: 'Unauthorized - ' + err.message });
  }
};

