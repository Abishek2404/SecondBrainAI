import express from 'express';
import { globalSearch } from '../controllers/search.controller';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.use(protect);
router.route('/')
  .get(globalSearch);

export default router;
