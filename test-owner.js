import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
mongoose.connect(process.env.MONGODB_URI);
const FlashcardDeck = mongoose.model('FlashcardDeck', new mongoose.Schema({}, { strict: false }));
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

async function run() {
  const decks = await FlashcardDeck.find();
  const users = await User.find();
  console.log("Decks:", decks);
  console.log("Users:", users);
  process.exit(0);
}
run();
