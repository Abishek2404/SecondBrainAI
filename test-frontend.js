import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// We need a valid token. Let's just create a token for a user.
import mongoose from 'mongoose';
mongoose.connect(process.env.MONGODB_URI);
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

async function run() {
  const user = await User.findOne();
  if(!user) return console.log("no user");
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback', { expiresIn: '1h' });
  const res = await fetch('http://localhost:3000/api/flashcards/decks', { headers: { Cookie: `token=${token}` } });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}
run();
