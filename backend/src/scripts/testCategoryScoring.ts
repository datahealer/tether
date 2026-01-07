import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { QuestionServiceEngine } from '../services/questionService';
import Couple from '../models/Couple';
import User from '../models/User';
import { CoupleCategoryState } from '../models/CoupleCategoryState';
import { GoalTag, LivingType, EmotionalNeed, CategoryId } from '../types/enums';

// Load environment variables
const envPath = path.resolve(__dirname, `../../config/env/${process.env.NODE_ENV || 'development'}.env`);
dotenv.config({ path: envPath });

/**
 * Test scenarios to verify category scoring algorithm
 */
const testScenarios = [
  {
    name: 'Couple with Communication & Trust goals',
    user1: {
      goals: [GoalTag.COMMUNICATION, GoalTag.TRUST],
      livingType: [LivingType.TOGETHER],
      emotionalNeeds: [EmotionalNeed.LOVE_SECURITY],
    },
    user2: {
      goals: [GoalTag.COMMUNICATION],
      livingType: [LivingType.TOGETHER],
      emotionalNeeds: [EmotionalNeed.RECOGNITION],
    },
    expectedCategories: [CategoryId.COMMUNICATION, CategoryId.TRUST],
  },
  {
    name: 'Long distance couple',
    user1: {
      goals: [GoalTag.INTIMACY, GoalTag.TRUST],
      livingType: [LivingType.APART_LONG_DISTANCE],
      emotionalNeeds: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.BELONGING],
    },
    user2: {
      goals: [GoalTag.COMMUNICATION],
      livingType: [LivingType.APART_LONG_DISTANCE],
      emotionalNeeds: [EmotionalNeed.LOVE_SECURITY],
    },
    expectedCategories: [CategoryId.COMMUNICATION, CategoryId.INTIMACY],
  },
  {
    name: 'Couple with kids focusing on playfulness',
    user1: {
      goals: [GoalTag.PLAYFULNESS, GoalTag.GRATITUDE],
      livingType: [LivingType.TOGETHER, LivingType.KIDS],
      emotionalNeeds: [EmotionalNeed.PLAY, EmotionalNeed.BELONGING],
    },
    user2: {
      goals: [GoalTag.COMMUNICATION, GoalTag.PLAYFULNESS],
      livingType: [LivingType.TOGETHER, LivingType.KIDS],
      emotionalNeeds: [EmotionalNeed.PLAY],
    },
    expectedCategories: [CategoryId.PLAYFULNESS, CategoryId.GRATITUDE],
  },
  {
    name: 'Couple focusing on vulnerability and future',
    user1: {
      goals: [GoalTag.VULNERABILITY, GoalTag.FUTURE],
      livingType: [LivingType.TOGETHER, LivingType.NO_KIDS],
      emotionalNeeds: [EmotionalNeed.GROWTH, EmotionalNeed.AUTONOMY],
    },
    user2: {
      goals: [GoalTag.FUTURE, GoalTag.INTIMACY],
      livingType: [LivingType.TOGETHER, LivingType.NO_KIDS],
      emotionalNeeds: [EmotionalNeed.GROWTH],
    },
    expectedCategories: [CategoryId.FUTURE, CategoryId.VULNERABILITY],
  },
  {
    name: 'No onboarding data (should default)',
    user1: {
      goals: [],
      livingType: [],
      emotionalNeeds: [],
    },
    user2: {
      goals: [],
      livingType: [],
      emotionalNeeds: [],
    },
    expectedCategories: [CategoryId.COMMUNICATION, CategoryId.INTIMACY],
  },
];

async function testCategoryScoring() {
  try {
    const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost:27017/tether';
    console.log(`Connecting to MongoDB: ${mongoUri}`);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    console.log('🧪 Testing Category Scoring Algorithm\n');
    console.log('='.repeat(80));

    for (const scenario of testScenarios) {
      console.log(`\n📋 Test: ${scenario.name}`);
      console.log('-'.repeat(80));

      // Create mock users
      const mockUser1 = {
        _id: new mongoose.Types.ObjectId(),
        onboardingData: scenario.user1,
      };

      const mockUser2 = {
        _id: new mongoose.Types.ObjectId(),
        onboardingData: scenario.user2,
      };

      // Create mock couple
      const mockCouple = {
        _id: new mongoose.Types.ObjectId(),
        user1Id: mockUser1,
        user2Id: mockUser2,
      };

      console.log('User 1 Profile:', JSON.stringify(scenario.user1, null, 2));
      console.log('User 2 Profile:', JSON.stringify(scenario.user2, null, 2));

      // Use the private method via reflection (for testing only)
      const QuestionServiceClass = QuestionServiceEngine as any;
      const selectedCategories = QuestionServiceClass.determineFreeCategoriesForCouple(mockCouple);

      console.log(`\n✨ Selected Categories: ${selectedCategories.join(', ')}`);
      console.log(`📊 Expected Categories: ${scenario.expectedCategories.join(', ')}`);

      // Check if results match expectations
      const isCorrect = selectedCategories.length === 2 &&
        selectedCategories.every((cat: string) => scenario.expectedCategories.includes(cat as CategoryId));

      if (isCorrect) {
        console.log('✅ TEST PASSED');
      } else {
        console.log('❌ TEST FAILED - Categories do not match expectations');
      }

      console.log('='.repeat(80));
    }

    console.log('\n✅ All tests completed\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing category scoring:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  console.log('🌱 Testing Category Scoring Algorithm...\n');
  testCategoryScoring();
}

export default testCategoryScoring;
