import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../middlewares/error';
import fs from 'fs';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

let googleClient: OAuth2Client | null = null;
function getGoogleClient() {
  if (!googleClient) {
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
  return googleClient;
}

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: (process.env.JWT_EXPIRES_IN || '30d') as any,
  });

  const options = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE || '30') * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        provider: user.provider,
        avatar: user.avatar,
        hasPassword: !!user.password
      }
    });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'user', // ignore role from req.body
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new AppError('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(new AppError('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id).select('+password');
    const userData = user?.toObject() as any;
    const hasPassword = !!userData.password;
    delete userData.password;
    
    res.status(200).json({
      success: true,
      data: { ...userData, hasPassword },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, bio, learningGoal, preferredLanguage, timeZone, avatar, dailyTasksGoal, dailyHoursGoal } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { name, bio, learningGoal, preferredLanguage, timeZone, avatar, dailyTasksGoal, dailyHoursGoal },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }
    
    // Read the file and convert it to base64 string
    const fileBuffer = await fs.promises.readFile(req.file.path);
    const base64Image = fileBuffer.toString('base64');
    const avatarUrl = `data:${req.file.mimetype};base64,${base64Image}`;
    
    // Clean up the uploaded file
    await fs.promises.unlink(req.file.path).catch(console.error);
    
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { avatar: avatarUrl },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Please provide current and new password', 400));
    }

    const user = await User.findById(req.user?._id).select('+password');
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError('Password incorrect', 401));
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return next(new AppError('Please provide an email', 400));
    }
    
    const genericMessage = 'If an account exists for this email, a password reset OTP has been sent.';
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ success: true, message: genericMessage });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP and set to resetPasswordToken field
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    // Set expire (5 minutes)
    const resetPasswordExpire = new Date(Date.now() + 5 * 60 * 1000);

    // Save user with token
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    user.resetPasswordOtpAttempts = 0;
    user.resetPasswordVerifiedToken = undefined;
    await user.save({ validateBeforeSave: false });

    const message = `Your password reset OTP is: ${otp}\n\nThis OTP is valid for 5 minutes.`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${user.name || 'User'},</p>
        <p>You requested a password reset for your SecondBrain AI account.</p>
        <p>Your OTP for resetting the password is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px;">${otp}</span>
        </div>
        <p>This OTP is valid for 5 minutes.</p>
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `;

    try {
      const emailResult = await sendEmail({
        email: user.email,
        subject: 'SecondBrain AI - Password Reset OTP',
        message,
        html
      });
      if (emailResult && emailResult.mocked) {
        res.status(200).json({ success: true, message: genericMessage, mockOtp: otp });
      } else {
        res.status(200).json({ success: true, message: genericMessage });
      }
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      user.resetPasswordOtpAttempts = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError('Email could not be sent', 500));
    }
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return next(new AppError('Please provide email and OTP', 400));
    }

    const user = await User.findOne({ 
      email,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user || !user.resetPasswordToken) {
      return next(new AppError('Invalid or expired OTP', 400));
    }

    const attempts = user.resetPasswordOtpAttempts || 0;
    if (attempts >= 5) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError('Too many failed attempts. Please request a new OTP.', 400));
    }

    let cleanOtp = String(otp).trim();
    const digitMatch = cleanOtp.match(/^\d{6}$/);
    if (!digitMatch) {
        // If they accidentally sent the whole sentence, try to extract 6 digits
        const extracted = cleanOtp.match(/\d{6}/);
        if (extracted) cleanOtp = extracted[0];
    }
    const hashedOtp = crypto
      .createHash('sha256')
      .update(cleanOtp)
      .digest('hex');

    if (hashedOtp !== user.resetPasswordToken && cleanOtp !== user.resetPasswordToken) {
      user.resetPasswordOtpAttempts = attempts + 1;
      await user.save({ validateBeforeSave: false });
      return next(new AppError('Invalid OTP', 400));
    }

    // OTP verified successfully. Generate a verified token.
    const verifiedToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordVerifiedToken = crypto.createHash('sha256').update(verifiedToken).digest('hex');
    user.resetPasswordToken = undefined; // clear otp
    user.resetPasswordOtpAttempts = undefined;
    // extend expiration for the reset flow
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); 
    
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      verifiedToken
    });

  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
       return next(new AppError('Please provide email, token, and new password', 400));
    }

    const cleanToken = String(token).trim();
    const hashedToken = crypto
      .createHash('sha256')
      .update(cleanToken)
      .digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordExpire: { $gt: Date.now() },
      $or: [
        { resetPasswordVerifiedToken: hashedToken },
        { resetPasswordVerifiedToken: cleanToken }
      ]
    });

    if (!user) {
      return next(new AppError('Invalid or expired token', 400));
    }

    if (password.length < 6) {
      return next(new AppError('Password must contain at least 6 characters.', 400));
    }
    
    user.password = password;
    user.passwordUpdatedAt = new Date();
    user.resetPasswordVerifiedToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const verifyResetToken = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ success: true }); // legacy mock
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) {
      return next(new AppError('No token provided', 400));
    }

    // Fetch user info from Google
    const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const payload = googleRes.data;
    
    if (!payload.email) {
      return next(new AppError('Google account does not have an email', 400));
    }

    // Check if user exists
    let user = await User.findOne({ email: payload.email });

    if (user) {
      // User exists, check if they signed up with google
      if (!user.googleId) {
        user.googleId = payload.sub;
        user.provider = 'google';
        if (!user.avatar && payload.picture) {
          user.avatar = payload.picture;
        }
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name: payload.name || payload.given_name || 'User',
        email: payload.email,
        googleId: payload.sub,
        provider: 'google',
        avatar: payload.picture,
        role: 'user'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Google login error:', error);
    return next(new AppError('Google login failed', 401));
  }
};
