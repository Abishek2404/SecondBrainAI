import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const Flashcard = mongoose.model('Flashcard', new mongoose.Schema({ deck: mongoose.Schema.Types.ObjectId, nextReviewDate: Date }, { strict: false }));
const FlashcardDeck = mongoose.model('FlashcardDeck', new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, subject: String, title: String }, { strict: false }));

async function run() {
  const user = await mongoose.model('User', new mongoose.Schema({}, { strict: false })).findOne({ email: 'abir33856@gmail.com' });
  const userId = user._id;

  const dueCardsAgg = await Flashcard.aggregate([
    {
      $match: {
        nextReviewDate: { $lte: new Date() }
      }
    },
    {
      $group: {
        _id: '$deck',
        dueCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'flashcarddecks',
        localField: '_id',
        foreignField: '_id',
        as: 'deck'
      }
    },
    { $unwind: '$deck' },
    { $match: { 'deck.user': userId } }
  ]);
  console.log("dueCardsAgg", JSON.stringify(dueCardsAgg, null, 2));

  process.exit(0);
}
run();
