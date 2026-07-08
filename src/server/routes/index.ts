import express from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import folderRoutes from './folders.routes';
import documentRoutes from './documents.routes';
import chatRoutes from './chat.routes';
import notesRoutes from './notes.routes';
import flashcardsRoutes from './flashcards.routes';
import quizRoutes from './quiz.routes';
import plannerRoutes from './planner.routes';
import dashboardRoutes from './dashboard.routes';

const router = express.Router();

// Mount routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/folders', folderRoutes);
router.use('/documents', documentRoutes);
router.use('/chat', chatRoutes);
router.use('/notes', notesRoutes);
router.use('/flashcards', flashcardsRoutes);
router.use('/quizzes', quizRoutes);
router.use('/planner', plannerRoutes);
router.use('/dashboard', dashboardRoutes);

// Export router
export default router;
