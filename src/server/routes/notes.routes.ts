import express from 'express';
import { getNotes, getNote, generateNote, deleteNote, updateNote } from '../controllers/notes.controller';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotes);

router.post('/generate', generateNote);

router.route('/:id')
  .get(getNote)
  .put(updateNote)
  .delete(deleteNote);

export default router;
