import express from 'express';
import { getMe, updateProfile } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth';
import { User } from '../models/User';
import { processStreakActivity } from '../utils/streakHelper';

const router = express.Router();

router.use(protect);

router.get('/profile', getMe);
router.put('/profile', updateProfile);
router.post('/avatar', updateProfile);

router.post('/complete-activity', async (req, res, next) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const result = await processStreakActivity(user);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

export default router;
