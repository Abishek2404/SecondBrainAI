import express from 'express';
import { getQuizzes, getQuiz, generateQuiz, submitAttempt, deleteQuiz, getDailyQuiz } from '../controllers/quiz.controller';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getQuizzes);

router.post('/generate', generateQuiz);

router.get('/daily', getDailyQuiz);

router.route('/:id')
  .get(getQuiz)
  .delete(deleteQuiz);

router.post('/:id/attempts', submitAttempt);

export default router;
