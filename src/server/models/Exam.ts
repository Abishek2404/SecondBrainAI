import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

export interface IExam extends MongooseDocument {
  title: string;
  date: string; // ISO String or YYYY-MM-DD
  user: mongoose.Types.ObjectId;
}

const ExamSchema: Schema<IExam> = new Schema(
  {
    title: { type: String, required: true },
    date: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Exam = (mongoose.models.Exam as mongoose.Model<IExam>) || mongoose.model<IExam>('Exam', ExamSchema);
