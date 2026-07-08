import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const Flashcard = mongoose.model('Flashcard', new mongoose.Schema({}, { strict: false }));
const FlashcardDeck = mongoose.model('FlashcardDeck', new mongoose.Schema({}, { strict: false }));

async function run() {
  const decks = await FlashcardDeck.find();
  console.log("Decks:", decks.length);
  for (const deck of decks) {
    const cards = await Flashcard.countDocuments({ deck: deck._id });
    console.log(`Deck ${deck._id}: ${cards} cards`);
  }
  process.exit(0);
}
run();
