import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../middlewares/error';
import fs from 'fs';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    const { name, bio, learningGoal, preferredLanguage, timeZone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { name, bio, learningGoal, preferredLanguage, timeZone, avatar },
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
    
    // Always return a generic message to prevent email enumeration
    const genericMessage = 'If an account exists for this email, a password reset link has been sent.';

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ success: true, message: genericMessage });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (15 minutes)
    const resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

    // Save user with token
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a put request to: \n\n ${resetUrl} \n\n If you didn't request this, please ignore this email.`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${user.name || 'User'},</p>
        <p>You requested a password reset for your SecondBrain AI account.</p>
        <p>Please click the button below to reset your password. This link is valid for 15 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'SecondBrain AI - Password Reset Token',
        message,
        html
      });

      res.status(200).json({ success: true, message: genericMessage });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError('Email could not be sent', 500));
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Invalid or expired token', 400));
    }

    // Set new password
    const newPassword = req.body.password;
    if (!newPassword) {
       return next(new AppError('Please provide a new password', 400));
    }
    
    if (newPassword.length < 8 || 
        !/[A-Z]/.test(newPassword) || 
        !/[a-z]/.test(newPassword) || 
        !/[0-9]/.test(newPassword) || 
        !/[^A-Za-z0-9]/.test(newPassword)) {
      return next(new AppError('Password does not meet strength requirements', 400));
    }
    
    user.password = newPassword;
    user.passwordUpdatedAt = new Date();
    user.resetPasswordToken = undefined;
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
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Invalid or expired token', 400));
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid'
    });
  } catch (error) {
    next(error);
  }
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
