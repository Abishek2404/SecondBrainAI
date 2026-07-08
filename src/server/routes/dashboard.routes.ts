import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getDashboardStats);

export default router;
