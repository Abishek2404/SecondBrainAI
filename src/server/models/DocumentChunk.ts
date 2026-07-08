import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

export interface IDocumentChunk extends MongooseDocument {
  document: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  text: string;
  embedding: number[];
  chunkIndex: number;
}

const DocumentChunkSchema: Schema<IDocumentChunk> = new Schema(
  {
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
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const DocumentChunk = (mongoose.models.DocumentChunk as mongoose.Model<IDocumentChunk>) || mongoose.model<IDocumentChunk>('DocumentChunk', DocumentChunkSchema);
