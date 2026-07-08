import express from 'express';
import { getMe, updateProfile } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.use(protect);

router.get('/profile', getMe);
router.put('/profile', updateProfile);
router.post('/avatar', updateProfile);

export default router;
