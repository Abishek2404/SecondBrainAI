import { generateContentWithRetry } from "../services/rag.service";
import { Request, Response, NextFunction } from 'express';
import { Quiz } from '../models/Quiz';
import { QuizAttempt } from '../models/QuizAttempt';
import { DocumentChunk } from '../models/DocumentChunk';
import { AppError } from '../middlewares/error';
import { GoogleGenAI } from '@google/genai';
import { Document } from '../models/Document';

let ai: GoogleGenAI | null = null;
const getAI = () => {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing");
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
};

// @desc    Get all quizzes
// @route   GET /api/quizzes
export const getQuizzes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 100;
    const skip = (page - 1) * limit;
    const quizzes = await Quiz.find({ user: req.user?._id }).sort('-createdAt').skip(skip).limit(limit);
    const total = await Quiz.countDocuments({ user: req.user?._id });
    
    // Also get attempts to show completion/stats
    const quizIds = quizzes.map(q => q._id);
    const attempts = await QuizAttempt.aggregate([
      { $match: { quiz: { $in: quizIds } } },
      { $group: { _id: '$quiz', avgScore: { $avg: '$score' }, count: { $sum: 1 } } }
    ]);
    
    const attemptsMap = new Map(attempts.map(a => [a._id.toString(), a]));
    
    const data = quizzes.map(q => {
      const stats = attemptsMap.get(q._id.toString());
      return {
        _id: q._id,
        title: q.title,
        subject: q.subject,
        questionsCount: q.questions.length,
        attemptsCount: stats?.count || 0,
        avgScore: stats ? Math.round(stats.avgScore) : 0,
        createdAt: (q as any).createdAt
      };
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
export const getQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user?._id });
    if (!quiz) {
      return next(new AppError('Quiz not found', 404));
    }
    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate quiz
// @route   POST /api/quizzes/generate
export const generateQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId, type, difficulty, questionCount } = req.body; // type: MCQ, True/False, etc.

    if (!documentId) return next(new AppError('Please provide a document ID', 400));

    const document = await Document.findOne({ _id: documentId, user: req.user?._id });
    if (!document) return next(new AppError('Document not found', 404));

    const chunks = await DocumentChunk.find({ document: documentId }).sort('chunkIndex');
    if (chunks.length === 0) return next(new AppError('Document has no text chunks yet', 400));

    let fullText = chunks.slice(0, 50).map(c => c.text).join('\n\n');
    let prompt = `Generate a ${difficulty || 'medium'} difficulty quiz with ${questionCount || 5} questions of type ${type || 'MCQ'}.
Return ONLY a valid JSON array of objects.
Each object MUST have:
- 'question' (string)
- 'options' (array of strings, typically 4 options, or 2 for True/False)
- 'correctAnswerIndex' (number, the index of the correct option 0-based)
- 'explanation' (string, why the answer is correct)

Document Content:\n${fullText}`;

    const genAI = getAI();
    const response = await generateContentWithRetry({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let content = response.text || "[]";
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();

    let questions = [];
    try {
      questions = JSON.parse(content);
    } catch (err) {
      console.error("Failed to parse quiz JSON:", content);
      return next(new AppError('Failed to parse AI response into quiz', 500));
    }

    const quiz = await Quiz.create({
      title: `${document.title} - ${type || 'Quiz'}`,
      subject: document.subject || 'General',
      document: documentId,
      user: req.user?._id,
      questions,
    });

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz attempt
// @route   POST /api/quizzes/:id/attempts
export const submitAttempt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { score, totalQuestions, answers } = req.body;
    
    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user?._id });
    if (!quiz) return next(new AppError('Quiz not found', 404));

    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      user: req.user?._id,
      score,
      totalQuestions,
      answers,
    });

    res.status(201).json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
export const deleteQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, user: req.user?._id });
    if (!quiz) return next(new AppError('Quiz not found', 404));

    await QuizAttempt.deleteMany({ quiz: quiz._id });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
