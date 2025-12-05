import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Admin, { IAdmin } from '../../models/admin';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT Token with 'admin' type
const generateToken = (adminId: string): string => {
  return jwt.sign({ id: adminId, type: 'admin' }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// @route   POST /api/admin/auth/signup
// @desc    Register a new admin
// @access  Public
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      res.status(400).json({ message: 'Admin with this email already exists' });
      return;
    }

    // Create new admin
    const admin = new Admin({
      email: email.toLowerCase(),
      password,
      name,
      role: 'admin',
    });

    await admin.save();

    // Generate token
    const token = generateToken(admin._id.toString());

    // Return admin data (excluding password)
    const adminData = {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    res.status(201).json({
      message: 'Admin registered successfully',
      token,
      user: adminData,
    });
  } catch (error: any) {
    console.error('Admin signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

// @route   POST /api/admin/auth/login
// @desc    Login admin
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Admin login attempt:', email);

    // Validate input
    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      console.log('❌ Admin not found:', email);
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Check if admin is active
    if (!admin.isActive) {
      console.log('❌ Admin account deactivated:', email);
      res.status(403).json({ message: 'Account is deactivated' });
      return;
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for admin:', email);
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Generate token
    const token = generateToken(admin._id.toString());

    console.log('✅ Admin login successful:', email);

    // Return admin data (excluding password)
    const adminData = {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    res.status(200).json({
      message: 'Login successful',
      token,
      user: adminData,
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @route   GET /api/admin/auth/me
// @desc    Get current admin
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = await Admin.findById(req.user?.id).select('-password');
    
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    res.status(200).json(admin);
  } catch (error: any) {
    console.error('Get admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   PUT /api/admin/auth/change-password
// @desc    Change admin password
// @access  Private
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Please provide current and new password' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters' });
      return;
    }

    const admin = await Admin.findById(req.user?.id);
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    // Verify current password
    const isPasswordValid = await admin.comparePassword(currentPassword);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};