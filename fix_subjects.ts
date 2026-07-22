import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Document } from './src/server/models/Document';
import { Quiz } from './src/server/models/Quiz';
import { Note } from './src/server/models/Note';
import { FlashcardDeck } from './src/server/models/FlashcardDeck';

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  
  const docs = await Document.find({ subject: 'General' });
  console.log(`Found ${docs.length} docs with General subject`);
  
  const quizzes = await Quiz.find({ subject: 'General' });
  console.log(`Found ${quizzes.length} quizzes with General subject`);
  
  // Also list all subjects
  const allQuizzes = await Quiz.find();
  const subjects = allQuizzes.map(q => q.subject);
  console.log('All quiz subjects:', new Set(subjects));

  process.exit(0);
}
fix();
