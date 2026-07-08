import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

export interface IQuizAttempt extends MongooseDocument {
  quiz: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  score: number;
  totalQuestions: number;
  answers: number[];
}

const QuizAttemptSchema: Schema<IQuizAttempt> = new Schema(
  {
    quiz: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    answers: [{ type: Number }], // Index of selected answers
  },
  {
    timestamps: true,
  }
);

export const QuizAttempt = (mongoose.models.QuizAttempt as mongoose.Model<IQuizAttempt>) || mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
