import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const Flashcard = mongoose.model('Flashcard', new mongoose.Schema({ deck: mongoose.Schema.Types.ObjectId, nextReviewDate: Date, repetitions: Number }, { strict: false }));
const FlashcardDeck = mongoose.model('FlashcardDeck', new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId }, { strict: false }));

async function run() {
  const decks = await FlashcardDeck.find();
  const deckIds = decks.map(d => d._id);
  console.log("deckIds", deckIds);
  const cardStats = await Flashcard.aggregate([
      { $match: { deck: { $in: deckIds } } },
      { 
        $group: { 
          _id: '$deck', 
          total: { $sum: 1 },
        } 
      }
    ]);
  console.log("cardStats", cardStats);
  process.exit(0);
}
run();
