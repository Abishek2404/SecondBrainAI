import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

export interface IFolder extends MongooseDocument {
  name: string;
  color?: string;
  user: mongoose.Types.ObjectId;
}

const FolderSchema: Schema<IFolder> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a folder name'],
      trim: true,
    },
    color: {
      type: String,
      default: 'indigo',
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

export const Folder = (mongoose.models.Folder as mongoose.Model<IFolder>) || mongoose.model<IFolder>('Folder', FolderSchema);
