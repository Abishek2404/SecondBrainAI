import express from 'express';
import { register, login, getMe, logout, updateProfile, changePassword, uploadAvatar, forgotPassword, verifyOtp, resetPassword, verifyResetToken, googleLogin } from '../controllers/auth.controller';
import { protect } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/verify-reset-token/:token', verifyResetToken);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/profile/avatar', protect, upload.single('avatar'), uploadAvatar);
router.put('/change-password', protect, changePassword);

export default router;
