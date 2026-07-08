import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

export interface IFlashcardDeck extends MongooseDocument {
  title: string;
  subject?: string;
  user: mongoose.Types.ObjectId;
  document?: mongoose.Types.ObjectId;
}

const FlashcardDeckSchema: Schema<IFlashcardDeck> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    subject: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    document: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
    },
  },
  {
    timestamps: true,
  }
);

export const FlashcardDeck = (mongoose.models.FlashcardDeck as mongoose.Model<IFlashcardDeck>) || mongoose.model<IFlashcardDeck>('FlashcardDeck', FlashcardDeckSchema);
