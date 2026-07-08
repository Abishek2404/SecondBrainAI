import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

export interface IFlashcard extends MongooseDocument {
  front: string;
  back: string;
  deck: mongoose.Types.ObjectId;
  nextReviewDate?: Date;
  easeFactor: number;
  interval: number;
  repetitions: number;
}

const FlashcardSchema: Schema<IFlashcard> = new Schema(
  {
    front: {
      type: String,
      required: [true, 'Please add a front side'],
    },
    back: {
      type: String,
      required: [true, 'Please add a back side'],
    },
    deck: {
      type: Schema.Types.ObjectId,
      ref: 'FlashcardDeck',
      required: true,
    },
    nextReviewDate: {
      type: Date,
      default: Date.now,
    },
    easeFactor: {
      type: Number,
      default: 2.5,
    },
    interval: {
      type: Number,
      default: 0,
    },
    repetitions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Flashcard = (mongoose.models.Flashcard as mongoose.Model<IFlashcard>) || mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);
