import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
mongoose.connect(process.env.MONGODB_URI);
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
const Document = mongoose.model('Document', new mongoose.Schema({}, { strict: false }));

async function run() {
  const user = await User.findOne({ email: 'abir33856@gmail.com' });
  const doc = await Document.findOne({ user: user._id });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback', { expiresIn: '1h' });
  try {
    const res = await fetch('http://localhost:3000/api/notes/generate', { 
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Cookie: `token=${token}` 
      },
      body: JSON.stringify({
        documentId: doc._id,
        type: 'Summary'
      })
    });
    const text = await res.text();
    console.log(text);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
run();
