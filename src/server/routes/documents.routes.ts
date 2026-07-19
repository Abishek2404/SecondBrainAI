import express from 'express';
import { getDocuments, uploadDocument, updateDocument, deleteDocument, getDocumentInfo } from '../controllers/documents.controller';
import { protect } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = express.Router();

router.use(protect); // All routes require auth

router.route('/')
  .get(getDocuments)
  .post(upload.single('file'), uploadDocument);

router.get('/:id/info', getDocumentInfo);
router.route('/:id')
  .put(updateDocument)
  .delete(deleteDocument);

export default router;
