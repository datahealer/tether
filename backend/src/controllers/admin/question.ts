import { Request, Response } from 'express';
import Question from '../../models/Question';
import * as crypto from 'crypto';
import path from 'path';
import {
  CategoryId,
  GenderFocus,
  RelationshipStage,
  LivingType,
  GoalTag,
  EmotionalNeed,
  Tone,
} from '../../types/enums';
import xlsx from 'xlsx'; // Install: npm i xlsx
import multer from 'multer'; // For file upload; install multer
import { IQuestion } from '../../types/interfaces';

const upload = multer({ storage: multer.memoryStorage() });

// @route   GET /api/admin/questions/template
// @desc    Download Excel import template
// @access  Private (Admin)
export const downloadTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    // Create template data
    const templateData = [
      ['Category', 'Question', 'Difficulty', 'Tone', 'Gender Focus', 'Relationship Stage', 'Living Type', 'Goal Tag', 'Emotional Need', 'Status'],
      ['communication', "What's one thing I do that makes you feel heard?", 2, 'reflective', 'Neutral', 'Early,Established', 'Together,Apart, Long Distance', 'Communication', 'Recognition,Belonging', 'Published'],
      ['intimacy', 'When do you feel most connected to me?', 2, 'romantic', 'Neutral', 'Early,Established', '', 'Intimacy,Spark', 'Love & Security,Belonging', 'Published'],
      ['playfulness', 'If we could teleport anywhere right now for a date, where would you choose?', 1, 'playful', 'Neutral', 'Early,Established', '', 'Playfulness,Spark', 'Play', 'Published'],
      ['vulnerability', "What's something you're afraid to share with me?", 4, 'deep', 'Neutral', 'Established,Long-term', '', 'Vulnerability,Trust', 'Love & Security,Belonging', 'Published'],
      ['trust', 'What makes you feel most secure in our relationship?', 2, 'reflective', 'Neutral', 'Early,Established', '', 'Trust', 'Love & Security', 'Published'],
    ];

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet(templateData);

    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Template');

    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for Excel download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=questions-import-template.xlsx');
    res.send(buffer);
  } catch (error: any) {
    console.error('❌ Template download error:', error);
    res.status(500).json({ message: 'Failed to download template', error: error.message });
  }
};

/**
 * Generate sequential questionId based on category
 * Format: {CATEGORY_PREFIX}{NUMBER} e.g., COM001, INT045
 */
const generateQuestionId = async (categoryId: CategoryId): Promise<string> => {
  const categoryPrefixes: { [key in CategoryId]: string } = {
    [CategoryId.COMMUNICATION]: 'COM',
    [CategoryId.INTIMACY]: 'INT',
    [CategoryId.PLAYFULNESS]: 'PLY',
    [CategoryId.TRUST]: 'TRU',
    [CategoryId.LOVE_LANGUAGES]: 'LOV',
    [CategoryId.FUTURE]: 'FUT',
    [CategoryId.VULNERABILITY]: 'VUL',
    [CategoryId.CONFLICT]: 'CON',
    [CategoryId.EROTIC]: 'ERO',
    [CategoryId.GRATITUDE]: 'GRA',
  };

  const prefix = categoryPrefixes[categoryId];
  
  // Count existing questions in this category
  const count = await Question.countDocuments({ categoryId });
  const nextNumber = count + 1;
  
  // Format: PREFIX + zero-padded number (3 digits)
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
};

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
      limit = 1000, // High default for admin panel
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

    // Generate sequential questionId based on category
    const questionId = await generateQuestionId(categoryId);

    // Create question data object - only include fields with values
    const questionData: any = {
      questionId,
      question,
      categoryId,
      genderFocus,
      tone,
      difficulty,
      relationshipStage: relationshipStage || [],
      livingType: livingType || [],
      goalTag: goalTag || [],
      emotionalNeed: emotionalNeed || [],
      status: status || 'Published',
    };

    // Only add optional fields if they have values
    if (formatType) questionData.formatType = formatType;
    if (contextTag) questionData.contextTag = contextTag;
    if (writerNotes) questionData.writerNotes = writerNotes;

    // Create question
    const newQuestion = new Question(questionData);

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




// Configure multer for memory storage


// In router: router.post('/import', upload.single('file'), importQuestionsFromExcel);

export const importQuestionsFromExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const imported: any[] = [];
    const errors: any[] = [];

    // Map sheet names to valid CategoryId values
    const categoryMap: { [key: string]: CategoryId } = {
      'communication': CategoryId.COMMUNICATION,
      'intimacy': CategoryId.INTIMACY,
      'playfulness': CategoryId.PLAYFULNESS,
      'trust': CategoryId.TRUST,
      'love_languages': CategoryId.LOVE_LANGUAGES,
      'future': CategoryId.FUTURE,
      'vulnerability': CategoryId.VULNERABILITY,
      'conflict': CategoryId.CONFLICT,
      'erotic': CategoryId.EROTIC,
      'gratitude': CategoryId.GRATITUDE,
    };

    // Process each sheet (one per category)
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const rows: any[] = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: false });

      // First row is headers
      const headers = rows[0] as string[];
      const dataRows = rows.slice(1);

      // Map sheet name to valid categoryId (for Excel with named sheets)
      const normalizedSheetName = sheetName.toLowerCase().trim().replace(/\s+/g, '_');
      let sheetCategoryId = categoryMap[normalizedSheetName];
      
      // Check if there's a Category column in the CSV (for single-sheet imports)
      const categoryColumnIndex = headers.findIndex(h => h.toLowerCase() === 'category');
      const hasCategoryColumn = categoryColumnIndex !== -1;

      for (const row of dataRows) {
        if (!row[0]) continue; // Skip empty rows

        try {
          // Determine category: from column (CSV) or sheet name (Excel)
          let categoryId = sheetCategoryId;
          
          if (hasCategoryColumn && row[categoryColumnIndex]) {
            const categoryValue = row[categoryColumnIndex].toString().toLowerCase().trim().replace(/\s+/g, '_');
            categoryId = categoryMap[categoryValue];
          }
          
          if (!categoryId) {
            errors.push({ row, error: `Invalid or missing category` });
            continue;
          }

          const questionData: Partial<IQuestion> = {
            categoryId,
            genderFocus: GenderFocus.NEUTRAL, // Default values
            tone: Tone.PLAYFUL,
            difficulty: 3,
            status: 'Published',
            relationshipStage: [],
            livingType: [],
            goalTag: [],
            emotionalNeed: [],
          };

          headers.forEach((header, idx) => {
            const value = row[idx]?.toString().trim();
            if (!value) return;

            switch (header.toLowerCase()) {
              case 'id':
              case 'questionid':
                questionData.questionId = value;
                break;
              case 'question':
              case 'question text':
                questionData.question = value;
                break;
              case 'category':
                // Already handled above
                break;
              case 'difficulty':
                const diff = parseInt(value);
                if ([1, 2, 3, 4, 5].includes(diff)) {
                  questionData.difficulty = diff as 1 | 2 | 3 | 4 | 5;
                }
                break;
              case 'tone':
                const toneValue = value.toLowerCase();
                if (Object.values(Tone).includes(toneValue as Tone)) {
                  questionData.tone = toneValue as Tone;
                }
                break;
              case 'gender focus':
              case 'genderfocus':
                if (Object.values(GenderFocus).includes(value as GenderFocus)) {
                  questionData.genderFocus = value as GenderFocus;
                }
                break;
              case 'relationship stage':
              case 'relationshipstage':
                questionData.relationshipStage = value.split(',').map((s: string) => s.trim()).filter(Boolean);
                break;
              case 'living type':
              case 'livingtype':
                questionData.livingType = value.split(',').map((s: string) => s.trim()).filter(Boolean);
                break;
              case 'goal tag':
              case 'goaltag':
                questionData.goalTag = value.split(',').map((s: string) => s.trim()).filter(Boolean);
                break;
              case 'emotional need':
              case 'emotionalneed':
                questionData.emotionalNeed = value.split(',').map((s: string) => s.trim()).filter(Boolean);
                break;
              case 'format type':
              case 'formattype':
                questionData.formatType = value;
                break;
              case 'context tag':
              case 'contexttag':
                questionData.contextTag = value;
                break;
              case 'status':
                questionData.status = value === 'Published' ? 'Published' : 'Draft';
                break;
              case 'writer notes':
              case 'writernotes':
                questionData.writerNotes = value;
                break;
            }
          });

          // Validate required fields
          if (!questionData.question) {
            errors.push({ row, error: 'Missing question text' });
            continue;
          }

          // Generate sequential ID based on category
          if (!questionData.questionId) {
            questionData.questionId = await generateQuestionId(categoryId);
          }

          // Clean up data - remove empty optional fields to match seed structure
          const cleanData: any = {
            questionId: questionData.questionId,
            question: questionData.question,
            categoryId: questionData.categoryId,
            genderFocus: questionData.genderFocus,
            tone: questionData.tone,
            difficulty: questionData.difficulty,
            relationshipStage: questionData.relationshipStage || [],
            livingType: questionData.livingType || [],
            goalTag: questionData.goalTag || [],
            emotionalNeed: questionData.emotionalNeed || [],
            status: questionData.status || 'Published',
          };

          // Only add optional fields if they have values
          if (questionData.formatType) cleanData.formatType = questionData.formatType;
          if (questionData.contextTag) cleanData.contextTag = questionData.contextTag;
          if (questionData.writerNotes) cleanData.writerNotes = questionData.writerNotes;

          const newQuestion = new Question(cleanData);
          await newQuestion.save();
          imported.push(newQuestion);
        } catch (rowError: any) {
          errors.push({ row, error: rowError.message });
        }
      }
    }

    console.log(`✅ Imported ${imported.length} questions`);
    if (errors.length > 0) {
      console.log(`⚠️ ${errors.length} errors during import`);
    }

    res.status(201).json({ 
      message: `Imported ${imported.length} questions`, 
      imported: imported.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error: any) {
    console.error('❌ Import error:', error);
    res.status(500).json({ message: 'Failed to import', error: error.message });
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