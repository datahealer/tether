import mongoose from 'mongoose';
import { Category } from '../models/Category';
import { CategoryId } from '../types/enums';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, `../../config/env/${process.env.NODE_ENV || 'development'}.env`);
dotenv.config({ path: envPath });

const categories = [
  {
    categoryId: CategoryId.COMMUNICATION,
    name: 'Communication',
    totalQuestions: 180,
    colorCode: '#4A90E2',
    description: 'Strengthen your dialogue and understanding',
  },
  {
    categoryId: CategoryId.INTIMACY,
    name: 'Intimacy',
    totalQuestions: 180,
    colorCode: '#E94B3C',
    description: 'Deepen your emotional and physical connection',
  },
  {
    categoryId: CategoryId.PLAYFULNESS,
    name: 'Playfulness',
    totalQuestions: 180,
    colorCode: '#F5A623',
    description: 'Keep the spark alive with fun and joy',
  },
  {
    categoryId: CategoryId.TRUST,
    name: 'Trust',
    totalQuestions: 180,
    colorCode: '#7ED321',
    description: 'Build stronger foundations of reliability',
  },
  {
    categoryId: CategoryId.LOVE_LANGUAGES,
    name: 'Love Languages',
    totalQuestions: 180,
    colorCode: '#BD10E0',
    description: 'Speak and understand each other\'s language',
  },
  {
    categoryId: CategoryId.FUTURE,
    name: 'Future',
    totalQuestions: 180,
    colorCode: '#50E3C2',
    description: 'Plan your journey together',
  },
  {
    categoryId: CategoryId.VULNERABILITY,
    name: 'Vulnerability',
    totalQuestions: 180,
    colorCode: '#9013FE',
    description: 'Open your hearts and share deeply',
  },
  {
    categoryId: CategoryId.CONFLICT,
    name: 'Conflict',
    totalQuestions: 180,
    colorCode: '#D0021B',
    description: 'Navigate disagreements with grace',
  },
  {
    categoryId: CategoryId.EROTIC,
    name: 'Erotic',
    totalQuestions: 180,
    colorCode: '#FF6F91',
    description: 'Explore passion and desire together',
  },
  {
    categoryId: CategoryId.GRATITUDE,
    name: 'Gratitude',
    totalQuestions: 180,
    colorCode: '#FFD93D',
    description: 'Appreciate and celebrate each other',
  },
];

async function seedCategories() {
  try {
    const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost:27017/tether';
    console.log(`Connecting to MongoDB: ${mongoUri}`);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing categories
    const deleteResult = await Category.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing categories`);

    // Insert new categories
    const inserted = await Category.insertMany(categories);
    console.log(`✅ Seeded ${inserted.length} categories:`);
    
    inserted.forEach((cat) => {
      console.log(`   - ${cat.name} (${cat.categoryId}): ${cat.totalQuestions} questions`);
    });

    // Verify
    const count = await Category.countDocuments();
    console.log(`\n✨ Total categories in database: ${count}`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  console.log('🌱 Seeding categories for Question Service Engine...\n');
  seedCategories();
}

export default seedCategories;
