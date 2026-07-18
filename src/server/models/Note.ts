import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

export interface INote extends MongooseDocument {
  title: string;
  content: string;
  summary?: string;
  type: string;
  words: number;
  subject?: string;
  tags: string[];
  importance: 'low' | 'medium' | 'high';
  document: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
}

const NoteSchema: Schema<INote> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
    },
    type: {
      type: String,
      default: 'Summary',
    },
    words: {
      type: Number,
      default: 0,
    },
    subject: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    importance: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    document: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
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

export const Note = (mongoose.models.Note as mongoose.Model<INote>) || mongoose.model<INote>('Note', NoteSchema);
