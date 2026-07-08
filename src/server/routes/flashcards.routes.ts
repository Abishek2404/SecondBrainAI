import express from 'express';
import { getDecks, generateDeck, getDeckCards, reviewCard, deleteDeck } from '../controllers/flashcards.controller';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router.route('/decks')
  .get(getDecks);

router.post('/generate', generateDeck);

router.route('/decks/:id/cards')
  .get(getDeckCards);

router.route('/decks/:id')
  .delete(deleteDeck);

router.post('/cards/:id/review', reviewCard);

export default router;
