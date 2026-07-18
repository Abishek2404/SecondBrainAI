import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  provider?: string;
  googleId?: string;
  passwordUpdatedAt?: Date;
  role: 'user' | 'admin';
  avatar?: string;
  bio?: string;
  learningGoal?: string;
  preferredLanguage?: string;
  timeZone?: string;
  subscriptionPlan?: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
  todayCompleted: boolean;
  xp: number;
  level: number;
  coins: number;
  focusPoints: number;
  totalTasksCompleted: number;
  studyDays: string[];
  achievements: string[];
  dailyTasksGoal: number;
  dailyHoursGoal: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    provider: {
      type: String,
      default: 'local'
    },
    googleId: {
      type: String,
      sparse: true
    },
    passwordUpdatedAt: Date,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
    },
    bio: {
      type: String,
    },
    learningGoal: {
      type: String,
    },
    preferredLanguage: {
      type: String,
      default: 'English',
    },
    timeZone: {
      type: String,
      default: 'UTC',
    },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'premium', 'pro'],
      default: 'free',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastCompletedDate: {
      type: String,
      default: '',
    },
    todayCompleted: {
      type: Boolean,
      default: false,
    },
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    coins: {
      type: Number,
      default: 0,
    },
    focusPoints: {
      type: Number,
      default: 0,
    },
    totalTasksCompleted: {
      type: Number,
      default: 0,
    },
    studyDays: {
      type: [String],
      default: [],
    },
    achievements: {
      type: [String],
      default: [],
    },
    dailyTasksGoal: {
      type: Number,
      default: 4,
    },
    dailyHoursGoal: {
      type: Number,
      default: 2,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function (this: IUser) {
  if (!this.isModified('password')) {
    return;
  }

  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Match user entered password to hashed password in database
UserSchema.methods.comparePassword = async function (enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
