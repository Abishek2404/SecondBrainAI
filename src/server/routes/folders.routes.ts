import express from 'express';
import { getFolders, createFolder, updateFolder, deleteFolder } from '../controllers/folders.controller';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.use(protect); // All routes require auth

router.route('/')
  .get(getFolders)
  .post(createFolder);

router.route('/:id')
  .put(updateFolder)
  .delete(deleteFolder);

export default router;
