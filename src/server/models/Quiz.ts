import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

export interface IQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface IQuiz extends MongooseDocument {
  title: string;
  subject?: string;
  questions: IQuestion[];
  user: mongoose.Types.ObjectId;
  document?: mongoose.Types.ObjectId;
  isDaily?: boolean;
}

const QuizSchema: Schema<IQuiz> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    subject: {
      type: String,
    },
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswerIndex: { type: Number, required: true },
        explanation: { type: String },
      },
    ],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    document: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
    },
    isDaily: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

export const Quiz = (mongoose.models.Quiz as mongoose.Model<IQuiz>) || mongoose.model<IQuiz>('Quiz', QuizSchema);
