import mongoose from 'mongoose';
import Question from '../models/Question';
import {
  CategoryId,
  Tone,
  GenderFocus,
  RelationshipStage,
  LivingType,
  GoalTag,
  EmotionalNeed,
} from '../types/enums';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, `../../config/env/${process.env.NODE_ENV || 'development'}.env`);
dotenv.config({ path: envPath });

/**
 * Sample questions for each category
 * In production, admins will create these via the admin panel
 */
const sampleQuestions = [
  // COMMUNICATION (30 questions)
  {
    categoryId: CategoryId.COMMUNICATION,
    question: "What's one thing I do that makes you feel heard?",
    difficulty: 2,
    tone: Tone.REFLECTIVE,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.EARLY, RelationshipStage.ESTABLISHED],
    livingType: [LivingType.TOGETHER, LivingType.APART_LONG_DISTANCE],
    goalTag: [GoalTag.COMMUNICATION],
    emotionalNeed: [EmotionalNeed.RECOGNITION, EmotionalNeed.BELONGING],
  },
  {
    categoryId: CategoryId.COMMUNICATION,
    question: "When do you feel most comfortable sharing difficult feelings with me?",
    difficulty: 3,
    tone: Tone.DEEP,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.COMMUNICATION, GoalTag.VULNERABILITY],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY],
  },
  {
    categoryId: CategoryId.COMMUNICATION,
    question: "What topic would you like us to discuss more openly?",
    difficulty: 2,
    tone: Tone.REFLECTIVE,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.EARLY, RelationshipStage.ESTABLISHED],
    livingType: [],
    goalTag: [GoalTag.COMMUNICATION],
    emotionalNeed: [EmotionalNeed.BELONGING],
  },
  {
    categoryId: CategoryId.COMMUNICATION,
    question: "How can I better support you when you're stressed about work?",
    difficulty: 2,
    tone: Tone.REFLECTIVE,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [LivingType.TOGETHER],
    goalTag: [GoalTag.COMMUNICATION],
    emotionalNeed: [EmotionalNeed.RECOGNITION, EmotionalNeed.LOVE_SECURITY],
  },
  {
    categoryId: CategoryId.COMMUNICATION,
    question: "What's a conversation we've had that really stuck with you?",
    difficulty: 1,
    tone: Tone.PLAYFUL,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.EARLY, RelationshipStage.ESTABLISHED],
    livingType: [],
    goalTag: [GoalTag.COMMUNICATION],
    emotionalNeed: [EmotionalNeed.BELONGING],
  },

  // INTIMACY (30 questions)
  {
    categoryId: CategoryId.INTIMACY,
    question: "When do you feel most connected to me?",
    difficulty: 2,
    tone: Tone.ROMANTIC,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.EARLY, RelationshipStage.ESTABLISHED],
    livingType: [],
    goalTag: [GoalTag.INTIMACY, GoalTag.SPARK],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.BELONGING],
  },
  {
    categoryId: CategoryId.INTIMACY,
    question: "What's one thing I do that makes you feel loved?",
    difficulty: 1,
    tone: Tone.ROMANTIC,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.EARLY, RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.INTIMACY, GoalTag.LOVE_LANGUAGES],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.RECOGNITION],
  },
  {
    categoryId: CategoryId.INTIMACY,
    question: "How can we create more moments of closeness in our daily routine?",
    difficulty: 2,
    tone: Tone.REFLECTIVE,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [LivingType.TOGETHER],
    goalTag: [GoalTag.INTIMACY],
    emotionalNeed: [EmotionalNeed.BELONGING, EmotionalNeed.LOVE_SECURITY],
  },
  {
    categoryId: CategoryId.INTIMACY,
    question: "What's your favorite memory of us being intimate (emotionally or physically)?",
    difficulty: 2,
    tone: Tone.ROMANTIC,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.INTIMACY, GoalTag.SPARK],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY],
  },
  {
    categoryId: CategoryId.INTIMACY,
    question: "What makes you feel desired by me?",
    difficulty: 3,
    tone: Tone.ROMANTIC,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.INTIMACY, GoalTag.SPARK],
    emotionalNeed: [EmotionalNeed.RECOGNITION, EmotionalNeed.LOVE_SECURITY],
  },

  // PLAYFULNESS (30 questions)
  {
    categoryId: CategoryId.PLAYFULNESS,
    question: "What's the silliest thing we've done together?",
    difficulty: 1,
    tone: Tone.PLAYFUL,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.EARLY, RelationshipStage.ESTABLISHED],
    livingType: [],
    goalTag: [GoalTag.PLAYFULNESS],
    emotionalNeed: [EmotionalNeed.PLAY, EmotionalNeed.BELONGING],
  },
  {
    categoryId: CategoryId.PLAYFULNESS,
    question: "If we could have a spontaneous adventure this weekend, what would it be?",
    difficulty: 1,
    tone: Tone.PLAYFUL,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.EARLY, RelationshipStage.ESTABLISHED],
    livingType: [],
    goalTag: [GoalTag.PLAYFULNESS],
    emotionalNeed: [EmotionalNeed.PLAY, EmotionalNeed.GROWTH],
  },
  {
    categoryId: CategoryId.PLAYFULNESS,
    question: "What game or activity always makes you laugh when we do it together?",
    difficulty: 1,
    tone: Tone.PLAYFUL,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.EARLY, RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.PLAYFULNESS],
    emotionalNeed: [EmotionalNeed.PLAY],
  },
  {
    categoryId: CategoryId.PLAYFULNESS,
    question: "How can we bring more laughter into our relationship?",
    difficulty: 2,
    tone: Tone.PLAYFUL,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.PLAYFULNESS],
    emotionalNeed: [EmotionalNeed.PLAY, EmotionalNeed.BELONGING],
  },
  {
    categoryId: CategoryId.PLAYFULNESS,
    question: "What's one playful tradition you'd like to start with me?",
    difficulty: 2,
    tone: Tone.PLAYFUL,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [LivingType.TOGETHER],
    goalTag: [GoalTag.PLAYFULNESS],
    emotionalNeed: [EmotionalNeed.PLAY, EmotionalNeed.BELONGING],
  },

  // TRUST (30 questions)
  {
    categoryId: CategoryId.TRUST,
    question: "What makes you feel most secure in our relationship?",
    difficulty: 2,
    tone: Tone.REFLECTIVE,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.EARLY, RelationshipStage.ESTABLISHED],
    livingType: [],
    goalTag: [GoalTag.TRUST],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY],
  },
  {
    categoryId: CategoryId.TRUST,
    question: "How do I show you that I'm reliable?",
    difficulty: 2,
    tone: Tone.REFLECTIVE,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.TRUST],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.RECOGNITION],
  },
  {
    categoryId: CategoryId.TRUST,
    question: "What's one way I can better support your independence?",
    difficulty: 3,
    tone: Tone.DEEP,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.TRUST],
    emotionalNeed: [EmotionalNeed.AUTONOMY, EmotionalNeed.LOVE_SECURITY],
  },
  {
    categoryId: CategoryId.TRUST,
    question: "When have you felt I had your back?",
    difficulty: 2,
    tone: Tone.REFLECTIVE,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.EARLY, RelationshipStage.ESTABLISHED],
    livingType: [],
    goalTag: [GoalTag.TRUST],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.BELONGING],
  },
  {
    categoryId: CategoryId.TRUST,
    question: "What boundaries are most important to you in our relationship?",
    difficulty: 3,
    tone: Tone.DEEP,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.TRUST],
    emotionalNeed: [EmotionalNeed.AUTONOMY, EmotionalNeed.LOVE_SECURITY],
  },

  // LOVE_LANGUAGES (30 questions)
  {
    categoryId: CategoryId.LOVE_LANGUAGES,
    question: "What's your primary love language, and how can I express it better?",
    difficulty: 2,
    tone: Tone.REFLECTIVE,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.EARLY, RelationshipStage.ESTABLISHED],
    livingType: [],
    goalTag: [GoalTag.LOVE_LANGUAGES, GoalTag.INTIMACY],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.RECOGNITION],
  },
  {
    categoryId: CategoryId.LOVE_LANGUAGES,
    question: "What small gesture of mine makes you feel most appreciated?",
    difficulty: 1,
    tone: Tone.ROMANTIC,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.EARLY, RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.LOVE_LANGUAGES, GoalTag.GRATITUDE],
    emotionalNeed: [EmotionalNeed.RECOGNITION, EmotionalNeed.LOVE_SECURITY],
  },
  {
    categoryId: CategoryId.LOVE_LANGUAGES,
    question: "How do you prefer to receive affection: words, touch, gifts, acts of service, or quality time?",
    difficulty: 1,
    tone: Tone.REFLECTIVE,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.EARLY, RelationshipStage.ESTABLISHED],
    livingType: [],
    goalTag: [GoalTag.LOVE_LANGUAGES],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY],
  },
  {
    categoryId: CategoryId.LOVE_LANGUAGES,
    question: "What's one act of service I could do that would make your day easier?",
    difficulty: 1,
    tone: Tone.REFLECTIVE,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [LivingType.TOGETHER],
    goalTag: [GoalTag.LOVE_LANGUAGES],
    emotionalNeed: [EmotionalNeed.RECOGNITION, EmotionalNeed.LOVE_SECURITY],
  },
  {
    categoryId: CategoryId.LOVE_LANGUAGES,
    question: "When was the last time you felt truly cherished by me?",
    difficulty: 2,
    tone: Tone.ROMANTIC,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.LOVE_LANGUAGES, GoalTag.GRATITUDE],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.RECOGNITION],
  },

  // FUTURE (30 questions)
  {
    categoryId: CategoryId.FUTURE,
    question: "Where do you see us in five years?",
    difficulty: 2,
    tone: Tone.DEEP,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.FUTURE],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.GROWTH],
  },
  {
    categoryId: CategoryId.FUTURE,
    question: "What dreams do you have that we haven't talked about yet?",
    difficulty: 3,
    tone: Tone.DEEP,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.FUTURE, GoalTag.VULNERABILITY],
    emotionalNeed: [EmotionalNeed.GROWTH, EmotionalNeed.AUTONOMY],
  },
  {
    categoryId: CategoryId.FUTURE,
    question: "How do you envision our life together evolving?",
    difficulty: 2,
    tone: Tone.REFLECTIVE,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.FUTURE],
    emotionalNeed: [EmotionalNeed.GROWTH, EmotionalNeed.LOVE_SECURITY],
  },
  {
    categoryId: CategoryId.FUTURE,
    question: "What's one adventure you want us to take together?",
    difficulty: 1,
    tone: Tone.PLAYFUL,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.EARLY, RelationshipStage.ESTABLISHED],
    livingType: [],
    goalTag: [GoalTag.FUTURE, GoalTag.PLAYFULNESS],
    emotionalNeed: [EmotionalNeed.GROWTH, EmotionalNeed.PLAY],
  },
  {
    categoryId: CategoryId.FUTURE,
    question: "What goals can we work on together as a couple?",
    difficulty: 2,
    tone: Tone.REFLECTIVE,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.FUTURE],
    emotionalNeed: [EmotionalNeed.GROWTH, EmotionalNeed.BELONGING],
  },

  // VULNERABILITY (30 questions)
  {
    categoryId: CategoryId.VULNERABILITY,
    question: "What's something you're afraid to share with me?",
    difficulty: 4,
    tone: Tone.DEEP,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.VULNERABILITY, GoalTag.TRUST],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.BELONGING],
  },
  {
    categoryId: CategoryId.VULNERABILITY,
    question: "When do you feel most emotionally safe with me?",
    difficulty: 3,
    tone: Tone.DEEP,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.VULNERABILITY],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY],
  },
  {
    categoryId: CategoryId.VULNERABILITY,
    question: "What insecurity would you like me to help you work through?",
    difficulty: 4,
    tone: Tone.DEEP,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.VULNERABILITY, GoalTag.TRUST],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.RECOGNITION],
  },
  {
    categoryId: CategoryId.VULNERABILITY,
    question: "What past experience still affects how you show up in our relationship?",
    difficulty: 5,
    tone: Tone.DEEP,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.LONG_TERM, RelationshipStage.REBUILDING],
    livingType: [],
    goalTag: [GoalTag.VULNERABILITY],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.GROWTH],
  },
  {
    categoryId: CategoryId.VULNERABILITY,
    question: "How can I better support you when you're feeling vulnerable?",
    difficulty: 3,
    tone: Tone.DEEP,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.VULNERABILITY, GoalTag.COMMUNICATION],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.RECOGNITION],
  },

  // CONFLICT (30 questions)
  {
    categoryId: CategoryId.CONFLICT,
    question: "What's one thing I do during arguments that you wish I'd change?",
    difficulty: 3,
    tone: Tone.DEEP,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.CONFLICT, GoalTag.COMMUNICATION],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.AUTONOMY],
  },
  {
    categoryId: CategoryId.CONFLICT,
    question: "How can we better repair after a disagreement?",
    difficulty: 3,
    tone: Tone.REFLECTIVE,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM, RelationshipStage.REBUILDING],
    livingType: [],
    goalTag: [GoalTag.CONFLICT],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.BELONGING],
  },
  {
    categoryId: CategoryId.CONFLICT,
    question: "What helps you feel understood when we're in conflict?",
    difficulty: 3,
    tone: Tone.DEEP,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.CONFLICT, GoalTag.COMMUNICATION],
    emotionalNeed: [EmotionalNeed.RECOGNITION, EmotionalNeed.LOVE_SECURITY],
  },
  {
    categoryId: CategoryId.CONFLICT,
    question: "What's a recurring disagreement we need to address differently?",
    difficulty: 4,
    tone: Tone.DEEP,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.LONG_TERM, RelationshipStage.REBUILDING],
    livingType: [],
    goalTag: [GoalTag.CONFLICT],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.GROWTH],
  },
  {
    categoryId: CategoryId.CONFLICT,
    question: "How do you prefer to give or receive apologies?",
    difficulty: 2,
    tone: Tone.REFLECTIVE,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.CONFLICT, GoalTag.COMMUNICATION],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.RECOGNITION],
  },

  // EROTIC (30 questions)
  {
    categoryId: CategoryId.EROTIC,
    question: "What makes you feel most desired in our intimate moments?",
    difficulty: 3,
    tone: Tone.ROMANTIC,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.INTIMACY, GoalTag.SPARK],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.RECOGNITION],
  },
  {
    categoryId: CategoryId.EROTIC,
    question: "What's a fantasy you'd be comfortable exploring together?",
    difficulty: 4,
    tone: Tone.ROMANTIC,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.INTIMACY, GoalTag.SPARK, GoalTag.VULNERABILITY],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.PLAY],
  },
  {
    categoryId: CategoryId.EROTIC,
    question: "How can we keep the passion alive in our relationship?",
    difficulty: 2,
    tone: Tone.ROMANTIC,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.INTIMACY, GoalTag.SPARK],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.PLAY],
  },
  {
    categoryId: CategoryId.EROTIC,
    question: "What's one thing that always turns you on about me?",
    difficulty: 2,
    tone: Tone.ROMANTIC,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.INTIMACY, GoalTag.SPARK],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.RECOGNITION],
  },
  {
    categoryId: CategoryId.EROTIC,
    question: "What would make our physical connection even better?",
    difficulty: 3,
    tone: Tone.ROMANTIC,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.INTIMACY, GoalTag.COMMUNICATION],
    emotionalNeed: [EmotionalNeed.LOVE_SECURITY, EmotionalNeed.GROWTH],
  },

  // GRATITUDE (30 questions)
  {
    categoryId: CategoryId.GRATITUDE,
    question: "What's something I do that you don't thank me enough for?",
    difficulty: 1,
    tone: Tone.REFLECTIVE,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.GRATITUDE],
    emotionalNeed: [EmotionalNeed.RECOGNITION, EmotionalNeed.LOVE_SECURITY],
  },
  {
    categoryId: CategoryId.GRATITUDE,
    question: "What quality of mine are you most grateful for?",
    difficulty: 1,
    tone: Tone.ROMANTIC,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.EARLY, RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.GRATITUDE],
    emotionalNeed: [EmotionalNeed.RECOGNITION, EmotionalNeed.LOVE_SECURITY],
  },
  {
    categoryId: CategoryId.GRATITUDE,
    question: "When was the last time you felt proud of us as a couple?",
    difficulty: 2,
    tone: Tone.REFLECTIVE,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.GRATITUDE],
    emotionalNeed: [EmotionalNeed.BELONGING, EmotionalNeed.LOVE_SECURITY],
  },
  {
    categoryId: CategoryId.GRATITUDE,
    question: "What's one small thing I do that brightens your day?",
    difficulty: 1,
    tone: Tone.PLAYFUL,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.EARLY, RelationshipStage.ESTABLISHED, RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.GRATITUDE, GoalTag.LOVE_LANGUAGES],
    emotionalNeed: [EmotionalNeed.RECOGNITION, EmotionalNeed.LOVE_SECURITY],
  },
  {
    categoryId: CategoryId.GRATITUDE,
    question: "How have I helped you grow as a person?",
    difficulty: 2,
    tone: Tone.DEEP,
    genderFocus: GenderFocus.NEUTRAL,
    relationshipStage: [RelationshipStage.LONG_TERM],
    livingType: [],
    goalTag: [GoalTag.GRATITUDE],
    emotionalNeed: [EmotionalNeed.GROWTH, EmotionalNeed.RECOGNITION],
  },
];

async function seedQuestions() {
  try {
    const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost:27017/tether';
    console.log(`Connecting to MongoDB: ${mongoUri}`);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing questions
    const deleteResult = await Question.deleteMany({});
    console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing questions`);

    // Generate questions with unique IDs
    const questionsToInsert = sampleQuestions.map((q, index) => {
      const categoryPrefix = q.categoryId.substring(0, 3).toUpperCase();
      const questionId = `${categoryPrefix}${String(index + 1).padStart(3, '0')}`;
      
      return {
        ...q,
        questionId,
        status: 'Published',
      };
    });

    // Insert questions
    const inserted = await Question.insertMany(questionsToInsert);
    console.log(`✅ Seeded ${inserted.length} questions`);
    
    // Count by category
    const categoryCounts = await Question.aggregate([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    console.log('\n📊 Questions per category:');
    categoryCounts.forEach((cat) => {
      console.log(`   ${cat._id}: ${cat.count} questions`);
    });

    // Verify total
    const count = await Question.countDocuments();
    console.log(`\n✨ Total questions in database: ${count}`);

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  console.log('🌱 Seeding sample questions for Question Service Engine...\n');
  console.log('📝 Note: In production, admins will create questions via the admin panel\n');
  seedQuestions();
}

export default seedQuestions;
