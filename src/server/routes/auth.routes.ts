import express from 'express';
import { register, login, getMe, logout, updateProfile, changePassword, uploadAvatar } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/profile/avatar', protect, upload.single('avatar'), uploadAvatar);
router.put('/change-password', protect, changePassword);

export default router;
