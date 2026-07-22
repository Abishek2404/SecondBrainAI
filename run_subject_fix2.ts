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
                if (errStr.includes('429') || errStr.includes('quota')) {
                    console.warn("Quota exceeded, sleeping 60 seconds...");
                    await new Promise(r => setTimeout(r, 62000));
                } else if (errStr.includes('503')) {
                    console.warn("503 error, sleeping 5 seconds...");
                    await new Promise(r => setTimeout(r, 5000));
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
  console.log('Done fixing documents');
  process.exit(0);
}
fix();
