import { generateContentWithRetry } from "../services/rag.service";
import { Request, Response, NextFunction } from 'express';
import { FlashcardDeck } from '../models/FlashcardDeck';
import { Flashcard } from '../models/Flashcard';
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

// @desc    Get all decks
// @route   GET /api/flashcards/decks
export const getDecks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 100;
    const skip = (page - 1) * limit;
    const decks = await FlashcardDeck.find({ user: req.user?._id }).sort('-createdAt').skip(skip).limit(limit);
    const total = await FlashcardDeck.countDocuments({ user: req.user?._id });
    
    const deckIds = decks.map(d => d._id);
    const cardStats = await Flashcard.aggregate([
      { $match: { deck: { $in: deckIds } } },
      { 
        $group: { 
          _id: '$deck', 
          total: { $sum: 1 },
          due: { 
            $sum: { $cond: [{ $lte: ['$nextReviewDate', new Date()] }, 1, 0] } 
          },
          masterySum: {
            $sum: {
              $cond: [
                { $gte: ['$repetitions', 3] },
                100,
                { $multiply: ['$repetitions', 33.33] }
              ]
            }
          }
        } 
      }
    ]);

    const statsMap = new Map(cardStats.map(item => [item._id.toString(), item]));

    const decksWithStats = decks.map(deck => {
      const stats = statsMap.get(deck._id.toString()) || { total: 0, due: 0, masterySum: 0 };
      const mastery = stats.total > 0 ? Math.round(stats.masterySum / stats.total) : 0;
      
      return {
        _id: deck._id,
        title: deck.title,
        subject: deck.subject,
        cards: stats.total,
        due: stats.due,
        mastery,
      };
    });

    res.status(200).json({
      success: true,
      data: decksWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate a new deck from a document
// @route   POST /api/flashcards/generate
export const generateDeck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId, count } = req.body;

    if (!documentId) {
      return next(new AppError('Please provide a document ID', 400));
    }

    const document = await Document.findOne({ _id: documentId, user: req.user?._id });
    if (!document) {
      return next(new AppError('Document not found', 404));
    }

    const chunks = await DocumentChunk.find({ document: documentId }).sort('chunkIndex');
    if (chunks.length === 0) {
      return next(new AppError('Document has no processed text chunks yet', 400));
    }

    // Limit to first 50 chunks
    let fullText = chunks.slice(0, 50).map(c => c.text).join('\n\n');

    let prompt = `Analyze the following document and generate a list of ${count || 10} flashcards.
    Return ONLY a valid JSON array of objects. Each object must have a 'front' property (the question or term) and a 'back' property (the answer or definition).
    Do NOT include any markdown formatting like \`\`\`json. Just the raw JSON array.
    
    Document Content:\n${fullText}`;

    const genAI = getAI();
    const response = await generateContentWithRetry({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let content = response.text || "[]";
    
    // Clean up potential markdown JSON formatting
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let cards = [];
    try {
      cards = JSON.parse(content);
    } catch (err) {
      console.error("Failed to parse flashcards JSON:", content);
      return next(new AppError('Failed to parse AI response into flashcards', 500));
    }

    // Create Deck
    const deck = await FlashcardDeck.create({
      title: `${document.title} - Flashcards`,
      subject: document.subject || 'General',
      document: documentId,
      user: req.user?._id,
    });

    // Create Cards
    const cardDocs = cards.map((c: any) => ({
      front: c.front,
      back: c.back,
      deck: deck._id,
    }));

    await Flashcard.insertMany(cardDocs);

    res.status(201).json({
      success: true,
      data: deck,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get cards for a deck (either all or just due)
// @route   GET /api/flashcards/decks/:id/cards
export const getDeckCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dueOnly } = req.query;
    
    const deck = await FlashcardDeck.findOne({ _id: req.params.id, user: req.user?._id });
    if (!deck) {
      return next(new AppError('Deck not found', 404));
    }

    let query: any = { deck: deck._id };
    
    if (dueOnly === 'true') {
      query.nextReviewDate = { $lte: new Date() };
    }

    const cards = await Flashcard.find(query);

    res.status(200).json({
      success: true,
      count: cards.length,
      data: cards,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Review a card (SuperMemo-2 algorithm simplified)
// @route   POST /api/flashcards/cards/:id/review
export const reviewCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quality } = req.body; // 0-5
    
    if (quality === undefined || quality < 0 || quality > 5) {
      return next(new AppError('Please provide a quality score between 0 and 5', 400));
    }

    const card = await Flashcard.findById(req.params.id).populate('deck');
    if (!card) {
      return next(new AppError('Card not found', 404));
    }

    // Verify ownership
    const deck = card.deck as any;
    if (deck.user.toString() !== req.user?._id.toString()) {
      return next(new AppError('Unauthorized', 403));
    }
    
    // SM-2 logic
    let { easeFactor, interval, repetitions } = card;

    if (quality >= 3) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    } else {
      repetitions = 0;
      interval = 1;
    }

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    card.easeFactor = easeFactor;
    card.interval = interval;
    card.repetitions = repetitions;
    card.nextReviewDate = nextReviewDate;

    await card.save();

    res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete deck
// @route   DELETE /api/flashcards/decks/:id
export const deleteDeck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deck = await FlashcardDeck.findOneAndDelete({ _id: req.params.id, user: req.user?._id });

    if (!deck) {
      return next(new AppError('Deck not found', 404));
    }

    await Flashcard.deleteMany({ deck: req.params.id });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
