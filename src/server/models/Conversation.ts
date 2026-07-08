import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

export interface IMessage {
  role: 'user' | 'model';
  content: string;
  createdAt: Date;
}

export interface IConversation extends MongooseDocument {
  title: string;
  user: mongoose.Types.ObjectId;
  document?: mongoose.Types.ObjectId;
  messages: IMessage[];
}

const ConversationSchema: Schema<IConversation> = new Schema(
  {
    title: {
      type: String,
      required: true,
      default: 'New Chat',
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
    messages: [
      {
        role: { type: String, enum: ['user', 'model'], required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Conversation = (mongoose.models.Conversation as mongoose.Model<IConversation>) || mongoose.model<IConversation>('Conversation', ConversationSchema);
