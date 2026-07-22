import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Document } from './src/server/models/Document';
import { FlashcardDeck } from './src/server/models/FlashcardDeck';
import { Note } from './src/server/models/Note';
import { GoogleGenAI } from '@google/genai';

async function fixOther() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // ensure Document is registered
  console.log(Document.modelName);

  const decks = await FlashcardDeck.find({ subject: 'General' }).populate('document');
  for (const d of decks) {
    if (d.document && (d.document as any).subject && (d.document as any).subject !== 'General') {
       d.subject = (d.document as any).subject;
       await d.save();
       console.log(`Updated deck ${d.title} to ${d.subject}`);
    } else {
       try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: `Determine a 1-3 word academic subject for a flashcard deck with this title: "${d.title}". Respond ONLY with the subject name.`
        });
        const sub = response.text?.trim();
        if (sub && sub.length > 0 && sub.length < 50) {
            d.subject = sub;
            await d.save();
            console.log(`Updated deck ${d.title} to ${d.subject}`);
        }
       } catch(e) {}
    }
  }

  const notes = await Note.find({ subject: 'General' }).populate('document');
  for (const n of notes) {
    if (n.document && (n.document as any).subject && (n.document as any).subject !== 'General') {
       n.subject = (n.document as any).subject;
       await n.save();
       console.log(`Updated note ${n.title} to ${n.subject}`);
    } else {
       try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: `Determine a 1-3 word academic subject for a note with this title: "${n.title}". Respond ONLY with the subject name.`
        });
        const sub = response.text?.trim();
        if (sub && sub.length > 0 && sub.length < 50) {
            n.subject = sub;
            await n.save();
            console.log(`Updated note ${n.title} to ${n.subject}`);
        }
       } catch(e) {}
    }
  }
  
  console.log('Done others!');
  process.exit(0);
}
fixOther();
