import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

export interface IDocument extends MongooseDocument {
  title: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  extractedText?: string;
  user: mongoose.Types.ObjectId;
  folder?: mongoose.Types.ObjectId;
  status: 'processing' | 'ready' | 'failed';
  summary?: string;
  subject?: string;
  tags?: string[];
}

const DocumentSchema: Schema<IDocument> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    extractedText: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    folder: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
    },
    status: {
      type: String,
      enum: ['processing', 'ready', 'failed'],
      default: 'processing',
    },
    summary: {
      type: String,
    },
    subject: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Document = (mongoose.models.Document as mongoose.Model<IDocument>) || mongoose.model<IDocument>('Document', DocumentSchema);
