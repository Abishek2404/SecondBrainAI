import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const Quiz = mongoose.model('Quiz', new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, subject: String }, { strict: false }));
const QuizAttempt = mongoose.model('QuizAttempt', new mongoose.Schema({ quiz: mongoose.Schema.Types.ObjectId, score: Number, totalQuestions: Number, user: mongoose.Schema.Types.ObjectId }, { strict: false }));

const FlashcardDeck = mongoose.model('FlashcardDeck', new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, subject: String }, { strict: false }));
const Flashcard = mongoose.model('Flashcard', new mongoose.Schema({ deck: mongoose.Schema.Types.ObjectId, repetitions: Number }, { strict: false }));

async function run() {
  const user = await mongoose.model('User', new mongoose.Schema({}, { strict: false })).findOne({ email: 'abir33856@gmail.com' });
  const userId = user._id;

  // 1. Quizzes
  const quizAttempts = await QuizAttempt.aggregate([
    { $match: { user: userId } },
    {
      $lookup: {
        from: 'quizzes', // Note: Make sure collection name is correct. mongoose pluralizes to 'quizzes' or 'quizs'? Usually 'quizzes'
        localField: 'quiz',
        foreignField: '_id',
        as: 'quizData'
      }
    },
    { $unwind: '$quizData' },
    {
      $group: {
        _id: { $ifNull: ['$quizData.subject', 'General'] },
        avgScore: { $avg: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] } }
      }
    }
  ]);
  console.log("quizAttempts", quizAttempts);

  // 2. Flashcards
  const flashcardDecks = await FlashcardDeck.aggregate([
    { $match: { user: userId } },
    {
      $lookup: {
        from: 'flashcards',
        localField: '_id',
        foreignField: 'deck',
        as: 'cards'
      }
    },
    { $unwind: '$cards' },
    {
      $group: {
        _id: { $ifNull: ['$subject', 'General'] },
        totalCards: { $sum: 1 },
        masteredCards: {
          $sum: { $cond: [{ $gte: ['$cards.repetitions', 3] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 1,
        masteryScore: { $multiply: [{ $divide: ['$masteredCards', '$totalCards'] }, 100] }
      }
    }
  ]);
  console.log("flashcardDecks", flashcardDecks);
  
  process.exit(0);
}
run();
