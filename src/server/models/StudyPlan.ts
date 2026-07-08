import mongoose, { Document as MongooseDocument, Schema } from 'mongoose';

export interface IStudyTask {
  title: string;
  type: string;
  duration: string;
  status: 'pending' | 'completed';
}

export interface IStudyPlan extends MongooseDocument {
  date: string; // ISO String or YYYY-MM-DD
  tasks: IStudyTask[];
  user: mongoose.Types.ObjectId;
}

const StudyPlanSchema: Schema<IStudyPlan> = new Schema(
  {
    date: {
      type: String,
      required: true,
    },
    tasks: [
      {
        title: { type: String, required: true },
        type: { type: String, required: true },
        duration: { type: String, required: true },
        status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
      },
    ],
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

export const StudyPlan = (mongoose.models.StudyPlan as mongoose.Model<IStudyPlan>) || mongoose.model<IStudyPlan>('StudyPlan', StudyPlanSchema);
