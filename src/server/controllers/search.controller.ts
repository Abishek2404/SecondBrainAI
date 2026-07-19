import { Request, Response, NextFunction } from 'express';
import { Document } from '../models/Document';
import { Note } from '../models/Note';
import { Quiz } from '../models/Quiz';
import { FlashcardDeck } from '../models/FlashcardDeck';

export const globalSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(200).json({ success: true, data: { documents: [], notes: [], quizzes: [], flashcards: [] } });
    }

    const regex = new RegExp(query, 'i');
    
    // Search Documents
    const documents = await Document.find({ 
      user: req.user?._id,
      $or: [{ title: regex }, { originalName: regex }, { subject: regex }]
    }).select('title originalName subject mimeType size createdAt _id url');
    
    // Search Notes
    const notes = await Note.find({
      user: req.user?._id,
      $or: [{ title: regex }, { content: regex }]
    }).select('title content createdAt _id');

    // Search Quizzes
    const quizzes = await Quiz.find({
      user: req.user?._id,
      $or: [{ title: regex }, { subject: regex }]
    }).select('title subject status type createdAt _id');

    // Search Flashcards
    const flashcards = await FlashcardDeck.find({
      user: req.user?._id,
      $or: [{ title: regex }, { subject: regex }]
    }).select('title subject createdAt _id');

    res.status(200).json({
      success: true,
      data: {
        documents,
        notes,
        quizzes,
        flashcards
      },
    });
  } catch (error) {
    next(error);
  }
};
