import { Request, Response, NextFunction } from 'express';
import { Conversation } from '../models/Conversation';
import { DocumentChunk } from '../models/DocumentChunk';
import { semanticSearch, generateAnswer } from '../services/rag.service';
import { AppError } from '../middlewares/error';

// @desc    Get all conversations
// @route   GET /api/chat
export const getConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversations = await Conversation.find({ user: req.user?._id }).sort('-updatedAt').select('-messages');
    
    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single conversation
// @route   GET /api/chat/:id
export const getConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, user: req.user?._id });
    
    if (!conversation) {
      return next(new AppError('Conversation not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/chat
export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, conversationId, documentId, imageUrl } = req.body;
    
    if (!text) {
      return next(new AppError('Please provide a message', 400));
    }

    let conversation;
    
    if (conversationId) {
      conversation = await Conversation.findOne({ _id: conversationId, user: req.user?._id });
      if (!conversation) {
        return next(new AppError('Conversation not found', 404));
      }
    } else {
      // Create new conversation
      conversation = await Conversation.create({
        user: req.user?._id,
        title: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
        document: documentId || null,
        messages: [],
      });
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: text,
      image: imageUrl,
      createdAt: new Date(),
    });

    await conversation.save();

    // Do RAG
    // 1. Get history
    const history = conversation.messages.slice(0, -1).map((m: any) => ({
      role: m.role,
      content: m.content,
      image: m.image
    }));

    // 2. Search relevant context
    // If conversation is linked to a document, search only there, otherwise search all user docs
    const targetDocId = documentId || conversation.document?.toString();
    const contextChunks = await semanticSearch(text, req.user?._id.toString(), targetDocId);

    // 3. Generate answer
    const answer = await generateAnswer(text, history, contextChunks, imageUrl);

    // Add model message
    conversation.messages.push({
      role: 'model',
      content: answer,
      createdAt: new Date(),
    });

    await conversation.save();

    res.status(200).json({
      success: true,
      data: {
        conversationId: conversation._id,
        message: {
          role: 'model',
          content: answer,
          createdAt: new Date(),
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
