import { Request, Response } from 'express';
import Question from '../../models/Question';
import * as crypto from 'crypto';
import {
  CategoryId,
  GenderFocus,
  RelationshipStage,
  LivingType,
  GoalTag,
  EmotionalNeed,
  Tone,
} from '../../types/enums';

// @route   GET /api/admin/questions
// @desc    Get all questions with filters
// @access  Private (Admin)
export const getAllQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 Fetching questions...');
    console.log('Query params:', req.query);

    const {
      category,
      genderFocus,
      status,
      relationshipStage,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    // Build filter object
    const filter: any = {};

    if (category) filter.categoryId = category;
    if (genderFocus) filter.genderFocus = genderFocus;
    if (status) filter.status = status;
    if (relationshipStage) filter.relationshipStage = relationshipStage;
    if (search) {
      filter.question = { $regex: search, $options: 'i' };
    }

    console.log('Filter:', filter);

    const skip = (Number(page) - 1) * Number(limit);

    const questions = await Question.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Question.countDocuments(filter);

    console.log(`✅ Found ${questions.length} questions (total: ${total})`);

    res.status(200).json({
      questions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('❌ Get questions error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching questions',
      error: error.message 
    });
  }
};

// @route   GET /api/admin/questions/:id
// @desc    Get single question
// @access  Private (Admin)
export const getQuestionById = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📋 Fetching question:', req.params.id);

    const question = await Question.findById(req.params.id);

    if (!question) {
      console.log('❌ Question not found:', req.params.id);
      res.status(404).json({ message: 'Question not found' });
      return;
    }

    console.log('✅ Question found:', question._id);
    res.status(200).json(question);
  } catch (error: any) {
    console.error('❌ Get question error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching question',
      error: error.message 
    });
  }
};

// @route   POST /api/admin/questions
// @desc    Create new question
// @access  Private (Admin)
export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('➕ Creating question:', req.body);

    const {
      question,
      categoryId,
      genderFocus,
      tone,
      difficulty,
      relationshipStage,
      livingType,
      goalTag,
      emotionalNeed,
      formatType,
      contextTag,
      status,
      writerNotes,
    } = req.body;

    // Validate required fields
    if (!question || !categoryId || !genderFocus || !tone || !difficulty) {
      console.log('❌ Missing required fields');
      res.status(400).json({
        message: 'Please provide question, categoryId, genderFocus, tone, and difficulty',
      });
      return;
    }

    // Validate enums
    if (!Object.values(CategoryId).includes(categoryId)) {
      console.log('❌ Invalid categoryId:', categoryId);
      res.status(400).json({ message: 'Invalid categoryId' });
      return;
    }

    if (!Object.values(GenderFocus).includes(genderFocus)) {
      console.log('❌ Invalid genderFocus:', genderFocus);
      res.status(400).json({ message: 'Invalid genderFocus' });
      return;
    }

    if (!Object.values(Tone).includes(tone)) {
      console.log('❌ Invalid tone:', tone);
      res.status(400).json({ message: 'Invalid tone. Must be one of: playful, romantic, reflective, deep' });
      return;
    }

    // Validate difficulty range
    if (difficulty < 1 || difficulty > 5) {
      console.log('❌ Invalid difficulty:', difficulty);
      res.status(400).json({ message: 'Difficulty must be between 1 and 5' });
      return;
    }

    // Generate unique questionId using crypto.randomUUID()
    const uuid = crypto.randomUUID();
    const questionId = `Q-${Date.now()}-${uuid.slice(0, 8)}`;

    // Create question
    const newQuestion = new Question({
      questionId,
      question,
      categoryId,
      genderFocus,
      tone, // Single value, not array
      difficulty,
      relationshipStage: relationshipStage || [],
      livingType: livingType || [],
      goalTag: goalTag || [],
      emotionalNeed: emotionalNeed || [],
      formatType: formatType || '',
      contextTag: contextTag || '',
      status: status || 'Published',
      writerNotes: writerNotes || '',
    });

    await newQuestion.save();

    console.log('✅ Question created:', newQuestion._id, 'with ID:', questionId);

    res.status(201).json({
      message: 'Question created successfully',
      question: newQuestion,
    });
  } catch (error: any) {
    console.error('❌ Create question error:', error);
    res.status(500).json({ 
      message: 'Server error while creating question',
      error: error.message 
    });
  }
};

// @route   PUT /api/admin/questions/:id
// @desc    Update question
// @access  Private (Admin)
export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('✏️ Updating question:', req.params.id, req.body);

    const {
      question,
      categoryId,
      genderFocus,
      tone,
      difficulty,
      relationshipStage,
      livingType,
      goalTag,
      emotionalNeed,
      formatType,
      contextTag,
      status,
      writerNotes,
    } = req.body;

    const existingQuestion = await Question.findById(req.params.id);

    if (!existingQuestion) {
      console.log('❌ Question not found:', req.params.id);
      res.status(404).json({ message: 'Question not found' });
      return;
    }

    // Validate enums if provided
    if (categoryId && !Object.values(CategoryId).includes(categoryId)) {
      console.log('❌ Invalid categoryId:', categoryId);
      res.status(400).json({ message: 'Invalid categoryId' });
      return;
    }

    if (genderFocus && !Object.values(GenderFocus).includes(genderFocus)) {
      console.log('❌ Invalid genderFocus:', genderFocus);
      res.status(400).json({ message: 'Invalid genderFocus' });
      return;
    }

    if (tone && !Object.values(Tone).includes(tone)) {
      console.log('❌ Invalid tone:', tone);
      res.status(400).json({ message: 'Invalid tone' });
      return;
    }

    if (difficulty && (difficulty < 1 || difficulty > 5)) {
      console.log('❌ Invalid difficulty:', difficulty);
      res.status(400).json({ message: 'Difficulty must be between 1 and 5' });
      return;
    }

    // Update fields
    if (question !== undefined) existingQuestion.question = question;
    if (categoryId !== undefined) existingQuestion.categoryId = categoryId;
    if (genderFocus !== undefined) existingQuestion.genderFocus = genderFocus;
    if (tone !== undefined) existingQuestion.tone = tone;
    if (difficulty !== undefined) existingQuestion.difficulty = difficulty;
    if (relationshipStage !== undefined) existingQuestion.relationshipStage = relationshipStage;
    if (livingType !== undefined) existingQuestion.livingType = livingType;
    if (goalTag !== undefined) existingQuestion.goalTag = goalTag;
    if (emotionalNeed !== undefined) existingQuestion.emotionalNeed = emotionalNeed;
    if (formatType !== undefined) existingQuestion.formatType = formatType;
    if (contextTag !== undefined) existingQuestion.contextTag = contextTag;
    if (status !== undefined) existingQuestion.status = status;
    if (writerNotes !== undefined) existingQuestion.writerNotes = writerNotes;

    await existingQuestion.save();

    console.log('✅ Question updated:', existingQuestion._id);

    res.status(200).json({
      message: 'Question updated successfully',
      question: existingQuestion,
    });
  } catch (error: any) {
    console.error('❌ Update question error:', error);
    res.status(500).json({ 
      message: 'Server error while updating question',
      error: error.message 
    });
  }
};

// @route   DELETE /api/admin/questions/:id
// @desc    Delete question
// @access  Private (Admin)
export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🗑️ Deleting question:', req.params.id);

    const question = await Question.findById(req.params.id);

    if (!question) {
      console.log('❌ Question not found:', req.params.id);
      res.status(404).json({ message: 'Question not found' });
      return;
    }

    await question.deleteOne();

    console.log('✅ Question deleted:', req.params.id);

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error: any) {
    console.error('❌ Delete question error:', error);
    res.status(500).json({ 
      message: 'Server error while deleting question',
      error: error.message 
    });
  }
};

// @route   GET /api/admin/questions/stats
// @desc    Get question statistics
// @access  Private (Admin)
export const getQuestionStats = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📊 Fetching question stats...');

    const totalQuestions = await Question.countDocuments();
    const publishedQuestions = await Question.countDocuments({ status: 'Published' });
    const draftQuestions = await Question.countDocuments({ status: 'Draft' });

    const categoryStats = await Question.aggregate([
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 },
        },
      },
    ]);

    const genderFocusStats = await Question.aggregate([
      {
        $group: {
          _id: '$genderFocus',
          count: { $sum: 1 },
        },
      },
    ]);

    const difficultyStats = await Question.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    console.log('✅ Stats fetched successfully');

    res.status(200).json({
      total: totalQuestions,
      published: publishedQuestions,
      draft: draftQuestions,
      byCategory: categoryStats,
      byGenderFocus: genderFocusStats,
      byDifficulty: difficultyStats,
    });
  } catch (error: any) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching statistics',
      error: error.message 
    });
  }
};