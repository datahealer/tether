import mongoose from 'mongoose';
import Admin from '../models/admin';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, `../../config/env/${process.env.NODE_ENV || 'development'}.env`);
dotenv.config({ path: envPath });

const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/tether';

async function createAdmin() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get admin details from command line arguments or use defaults
    const email = process.argv[2] || 'admin@tether.com';
    const password = process.argv[3] || 'admin123';
    const name = process.argv[4] || 'Admin User';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      console.log(`⚠️  Admin user already exists with email: ${email}`);
      console.log('   To create a new admin, use a different email or delete the existing one.');
      process.exit(0);
    }

    // Create admin user
    const admin = new Admin({
      email: email.toLowerCase(),
      password, // Will be hashed automatically by the pre-save hook
      name,
      role: 'admin',
      isActive: true,
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Name: ${name}`);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('   You can change it via the admin panel or API endpoint.');

    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating admin:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
createAdmin();

