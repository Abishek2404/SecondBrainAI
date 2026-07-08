import express from 'express';
import { getConversations, getConversation, sendMessage } from '../controllers/chat.controller';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getConversations)
  .post(sendMessage);

router.route('/:id')
  .get(getConversation);

export default router;
