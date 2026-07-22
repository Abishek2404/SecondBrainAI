import { GoogleGenAI } from "@google/genai";
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { Document } from '../models/Document';
import { AppError } from '../middlewares/error';
import { extractTextFromFile } from '../services/documentParser';
import { processDocument } from '../services/rag.service';
import { Folder } from '../models/Folder';
import { DocumentChunk } from '../models/DocumentChunk';
import { Note } from '../models/Note';
import { Quiz } from '../models/Quiz';
import { QuizAttempt } from '../models/QuizAttempt';
import { FlashcardDeck } from '../models/FlashcardDeck';
import { Flashcard } from '../models/Flashcard';

// @desc    Get all documents for current user
// @route   GET /api/documents
export const getDocuments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let query: any = { user: req.user?._id };

    if (req.query.folderId) {
      if (req.query.folderId === 'root') {
        query.folder = { $exists: false };
      } else {
        query.folder = req.query.folderId;
      }
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 100;
    const skip = (page - 1) * limit;

    const documents = await Document.find(query)
      .select('-extractedText')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('folder', 'name');

    const total = await Document.countDocuments(query);

    res.status(200).json({
      success: true,
      count: documents.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload new document
// @route   POST /api/documents
export const uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    const { folderId, subject } = req.body;

    // Check if folder exists and belongs to user
    if (folderId && folderId !== 'root') {
      const folder = await Folder.findById(folderId);
      if (!folder || folder.user.toString() !== req.user?._id.toString()) {
        return next(new AppError('Invalid folder', 400));
      }
    }

    // Create document in DB
    const docData: any = {
      title: req.file.originalname.split('.')[0],
      originalName: req.file.originalname,
      url: `/uploads/${req.file.filename}`, // Local URL for now
      mimeType: req.file.mimetype,
      size: req.file.size,
      user: req.user?._id,
      status: 'processing',
      subject: subject || 'General',
    };

    if (folderId && folderId !== 'root') {
      docData.folder = folderId;
    }

    const document = await Document.create(docData);

    // Asynchronously process the document into chunks for semantic search
    (async () => {
      try {
        const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype, req.file.originalname);
        document.extractedText = extractedText;
        
        
        if (extractedText) {
          if (document.subject === 'General') {
             try {
                 const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                 let response;
                 for (let attempt = 0; attempt < 3; attempt++) {
                     try {
                         response = await ai.models.generateContent({
                             model: 'gemini-3.6-flash',
                             contents: `Please determine the most appropriate subject or category, and suggest 3-5 tags for this document based on the following text. Respond ONLY with a valid JSON object in this format: {"subject": "string", "tags": ["tag1", "tag2"]}. Keep the subject to 1-3 words (e.g., "Mathematics", "Computer Science", "Web Development").\n\nText: ${extractedText ? extractedText.substring(0, 5000) : (document.extractedText ? document.extractedText.substring(0, 5000) : '')}`
                         });
                         break;
                     } catch(aiError: any) {
                         const errStr = String(aiError);
                         if (attempt < 2 && (errStr.includes('429') || errStr.includes('quota'))) {
                                console.warn("Quota limit reached, retrying in 60 seconds...");
                                await new Promise(r => setTimeout(r, 61000));
                            } else if (attempt < 2 && errStr.includes('503')) {
                                console.warn("503 error, retrying in 5 seconds...");
                                await new Promise(r => setTimeout(r, 5000));
                            } else {
                             throw aiError;
                         }
                     }
                 }
                 if (response && response.text) {
                     try {
                         const text = response.text.replace(/```json\n/g, '').replace(/```\n?/g, '').trim();
                         const data = JSON.parse(text);
                         if (data.subject && data.subject.length > 0 && data.subject.length < 50) {
                             document.subject = data.subject;
                         }
                         if (Array.isArray(data.tags)) {
                             document.tags = data.tags;
                         }
                     } catch (e) {
                         console.error("Failed to parse subject/tags JSON", e);
                     }
                 }
             } catch(err) {
                 console.error("Error determining subject:", err);
             }
          }
          await processDocument(document._id.toString(), req.user?._id.toString(), extractedText);
        }

        document.status = 'ready';
        await document.save();
      } catch (err) {
        console.error("Error processing document chunks:", err);
        document.status = 'failed';
        await document.save();
      }
    })();

    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error: any) {
    // If there's an error after file upload, clean up the file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Update document (rename, move)
// @route   PUT /api/documents/:id
export const updateDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let document = await Document.findById(req.params.id);

    if (!document) {
      return next(new AppError(`Document not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns document
    if (document.user.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return next(new AppError(`User not authorized to update this document`, 401));
    }

    const updateData: any = {};
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.subject) updateData.subject = req.body.subject;
    
    
    if (req.body.folderId) {
      if (req.body.folderId === 'root') {
        updateData.$unset = { folder: 1 };
      } else {
        const folder = await Folder.findById(req.body.folderId);
        if (!folder || folder.user.toString() !== req.user?._id.toString()) {
          return next(new AppError('Invalid folder', 400));
        }
        updateData.folder = req.body.folderId;
      }
    }

    if (updateData.$unset) {
      document = await Document.findByIdAndUpdate(req.params.id, { $unset: { folder: 1 } }, { new: true });
      delete updateData.$unset;
    }
    
    if (Object.keys(updateData).length > 0) {
      document = await Document.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return next(new AppError(`Document not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns document
    if (document.user.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return next(new AppError(`User not authorized to delete this document`, 401));
    }

    // Remove file from filesystem
    const filePath = path.join(process.cwd(), document.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Cascade delete related records
    await DocumentChunk.deleteMany({ document: document._id });
    await Note.deleteMany({ document: document._id });
    
    const quizzes = await Quiz.find({ document: document._id });
    for (const q of quizzes) {
      await QuizAttempt.deleteMany({ quiz: q._id });
      await q.deleteOne();
    }
    
    const decks = await FlashcardDeck.find({ document: document._id });
    for (const d of decks) {
      await Flashcard.deleteMany({ deck: d._id });
      await d.deleteOne();
    }

    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get document info (notes count, AI summary)
// @route   GET /api/documents/:id/info

export const getDocumentInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return next(new AppError(`Document not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns document
    if (document.user.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      return next(new AppError(`User not authorized to access this document`, 401));
    }

    const notesCount = await Note.countDocuments({ document: document._id });

    let summary = document.summary;
    if (!summary && document.extractedText) {
      // Generate summary if it doesn't exist and text is available
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                 let response;
                 for (let attempt = 0; attempt < 3; attempt++) {
                     try {
                         response = await ai.models.generateContent({
                             model: 'gemini-3.6-flash',
                             contents: `Summarize the following document in a concise, informative paragraph:\n\n${document.extractedText.substring(0, 15000)}`
                         });
                         break;
                     } catch(aiError: any) {
                         const errStr = String(aiError);
                         if (attempt < 2 && (errStr.includes('429') || errStr.includes('quota'))) {
                                console.warn("Quota limit reached, retrying in 60 seconds...");
                                await new Promise(r => setTimeout(r, 61000));
                            } else if (attempt < 2 && errStr.includes('503')) {
                                console.warn("503 error, retrying in 5 seconds...");
                                await new Promise(r => setTimeout(r, 5000));
                            } else {
                             throw aiError;
                         }
                     }
                 }
        summary = response ? (response.text || "Summary generation failed.") : "Summary generation failed.";
        document.summary = summary;
        await document.save();
      } catch (aiError) {
         console.error("Failed to generate summary", aiError);
         summary = "Could not generate summary at this time.";
      }
    } else if (!summary) {
       summary = "No text content available to summarize.";
    }

    res.status(200).json({
      success: true,
      data: {
        notesCount,
        summary
      }
    });
  } catch (error) {
    next(error);
  }
};
