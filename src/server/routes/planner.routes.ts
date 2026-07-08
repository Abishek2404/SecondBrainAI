import express from 'express';
import { getPlans, setPlan, generateSchedule } from '../controllers/planner.controller';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPlans)
  .post(setPlan);

router.post('/generate', generateSchedule);

export default router;
