import { generateContentWithRetry } from "../services/rag.service";
import { Request, Response, NextFunction } from 'express';
import { Note } from '../models/Note';
import { DocumentChunk } from '../models/DocumentChunk';
import { Document } from '../models/Document';
import { AppError } from '../middlewares/error';
import { GoogleGenAI } from '@google/genai';

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

// @desc    Get all notes for current user
// @route   GET /api/notes
export const getNotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 100;
    const skip = (page - 1) * limit;

    const notes = await Note.find({ user: req.user?._id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Note.countDocuments({ user: req.user?._id });

    res.status(200).json({
      success: true,
      count: notes.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
export const getNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user?._id }).populate('document', 'title');

    if (!note) {
      return next(new AppError('Note not found', 404));
    }

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate note from document
// @route   POST /api/notes/generate
export const generateNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId, type, subject } = req.body;

    if (!documentId) {
      return next(new AppError('Please provide a document ID', 400));
    }

    const document = await Document.findOne({ _id: documentId, user: req.user?._id });
    if (!document) {
      return next(new AppError('Document not found', 404));
    }

    // Fetch all chunks for this document
    const chunks = await DocumentChunk.find({ document: documentId }).sort('chunkIndex');
    
    if (chunks.length === 0) {
      return next(new AppError('Document has no processed text chunks yet. Please wait a moment and try again.', 400));
    }

    // To prevent exceeding context limits, slice chunks or use semantic search.
    // For now we slice to the first 50 chunks (approx 50k tokens)
    let fullText = chunks.slice(0, 50).map(c => c.text).join('\n\n');
    
    let prompt = `Analyze the following document and generate a comprehensive "${type || 'Summary'}".\n\n`;
    prompt += `Document Content:\n${fullText}\n\n`;
    
    prompt += `IMPORTANT: Please format the output strictly in clean Markdown. Use clear Headings (#, ##, ###), subtitles, bullet points, bold text for emphasis, and proper paragraphs to make it well-structured, easy to read, and aesthetically pleasing. Do not output raw unformatted text.\n\n`;

    if (type === 'Summary') {
      prompt += `Provide a concise but comprehensive summary.`;
    } else if (type === 'Key Points') {
      prompt += `Extract the most important key points as a bulleted list.`;
    } else if (type === 'Definitions') {
      prompt += `Extract all important terms and provide their definitions based on the text.`;
    } else if (type === 'Important Questions') {
      prompt += `Generate a list of important questions that could be asked on an exam based on this material, along with their answers.`;
    } else if (type === 'Formula Sheet') {
      prompt += `Extract any formulas, equations, or key mathematical relationships.`;
    } else if (type === 'Revision Notes') {
      prompt += `Create structured revision notes with headings, subheadings, and bullet points for easy studying.`;
    } else {
      prompt += `Provide detailed notes.`;
    }

    const genAI = getAI();
    const response = await generateContentWithRetry({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const content = response.text || "Failed to generate content.";
    
    // Estimate word count
    const wordCount = content.split(/\s+/).length;

    // Create note
    const note = await Note.create({
      title: `${type || 'Summary'} - ${document.title}`,
      content,
      type: type || 'Summary',
      subject: subject || document.subject || 'General',
      words: wordCount,
      document: documentId,
      user: req.user?._id,
      summary: content.substring(0, 150) + '...',
    });

    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
export const deleteNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user?._id });

    if (!note) {
      return next(new AppError('Note not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
export const updateNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, tags, importance, subject } = req.body;
    let note = await Note.findOne({ _id: req.params.id, user: req.user?._id });

    if (!note) {
      return next(new AppError('Note not found', 404));
    }
    
    note.content = content !== undefined ? content : note.content;
    if (content !== undefined) {
      note.words = content.split(/\s+/).length;
      note.summary = content.substring(0, 150) + '...';
    }
    if (tags !== undefined) note.tags = tags;
    if (importance !== undefined) note.importance = importance;
    if (subject !== undefined) note.subject = subject;

    await note.save();

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
};
