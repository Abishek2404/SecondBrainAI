import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Document } from './src/server/models/Document';
import { Quiz } from './src/server/models/Quiz';
import { Note } from './src/server/models/Note';
import { FlashcardDeck } from './src/server/models/FlashcardDeck';
import { GoogleGenAI } from '@google/genai';

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const docs = await Document.find({ subject: 'General' });
  console.log(`Processing ${docs.length} documents...`);
  
  for (const doc of docs) {
    if (doc.extractedText && doc.extractedText.length > 0) {
      try {
        let response;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                response = await ai.models.generateContent({
                    model: 'gemini-3.6-flash',
                    contents: `Please determine the most appropriate subject or category for this document based on the following text. Respond ONLY with the subject name (e.g., "Mathematics", "History", "Biology", "Computer Science", "HTML", "CSS", "Python", "Web Development", etc.). Keep it to 1-3 words.\n\nText: ${doc.extractedText.substring(0, 5000)}`
                });
                break;
            } catch(aiError: any) {
                const errStr = String(aiError);
                if (attempt < 2 && (errStr.includes('429') || errStr.includes('503') || errStr.includes('quota'))) {
                    console.warn("Retrying subject generation...");
                    await new Promise(r => setTimeout(r, 2000));
                } else {
                    throw aiError;
                }
            }
        }
        
        if (response) {
            const figuredSubject = response.text?.trim();
            if (figuredSubject && figuredSubject.length > 0 && figuredSubject.length < 50) {
                console.log(`Doc: ${doc.title} -> ${figuredSubject}`);
                doc.subject = figuredSubject;
                await doc.save();
                
                // Update related items
                await Quiz.updateMany({ document: doc._id }, { subject: figuredSubject });
                await Note.updateMany({ document: doc._id }, { subject: figuredSubject });
                await FlashcardDeck.updateMany({ document: doc._id }, { subject: figuredSubject });
            }
        }
      } catch (e) {
        console.error(`Error on doc ${doc.title}:`, e.message);
      }
    }
  }

  // Also check quizzes that don't have a document or whose document isn't General anymore
  const quizzes = await Quiz.find({ subject: 'General' }).populate('document');
  for (const q of quizzes) {
    if (q.document && (q.document as any).subject && (q.document as any).subject !== 'General') {
       q.subject = (q.document as any).subject;
       await q.save();
       console.log(`Updated quiz for doc ${q.document._id} to ${q.subject}`);
    } else {
       // Just delete them or something? Or try to guess from title
       try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: `Determine a 1-3 word academic subject for a quiz with this title: "${q.title}". Respond ONLY with the subject name.`
        });
        const sub = response.text?.trim();
        if (sub && sub.length > 0 && sub.length < 50) {
            q.subject = sub;
            await q.save();
            console.log(`Updated quiz ${q.title} to ${q.subject}`);
        }
       } catch(e) {}
    }
  }

  console.log('Done!');
  process.exit(0);
}
fix();

async function fixOther() {
  const FlashcardDeck = (await import('./src/server/models/FlashcardDeck')).FlashcardDeck;
  const Note = (await import('./src/server/models/Note')).Note;
  const GoogleGenAI = (await import('@google/genai')).GoogleGenAI;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const decks = await FlashcardDeck.find({ subject: 'General' }).populate('document');
  for (const d of decks) {
    if (d.document && (d.document as any).subject && (d.document as any).subject !== 'General') {
       d.subject = (d.document as any).subject;
       await d.save();
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
        }
       } catch(e) {}
    }
  }

  const notes = await Note.find({ subject: 'General' }).populate('document');
  for (const n of notes) {
    if (n.document && (n.document as any).subject && (n.document as any).subject !== 'General') {
       n.subject = (n.document as any).subject;
       await n.save();
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
        }
       } catch(e) {}
    }
  }
  
  console.log('Done others!');
  process.exit(0);
}
// fixOther(); // wait, we have to run it separately. I'll make a new script
