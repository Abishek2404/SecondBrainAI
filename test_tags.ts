import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Document } from './src/server/models/Document';
import { GoogleGenAI } from '@google/genai';

async function testTags() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const docs = await Document.find({ tags: { $size: 0 } }).limit(5);
  for (const doc of docs) {
     if (!doc.extractedText) continue;
     try {
       const response = await ai.models.generateContent({
           model: 'gemini-3.6-flash',
           contents: `Please determine the most appropriate subject or category, and suggest 3-5 tags for this document based on the following text. Respond ONLY with a valid JSON object in this format: {"subject": "string", "tags": ["tag1", "tag2"]}. Keep the subject to 1-3 words (e.g., "Mathematics", "Computer Science", "Web Development").\n\nText: ${doc.extractedText.substring(0, 5000)}`
       });
       if (response && response.text) {
           const text = response.text.replace(/```json\n/g, '').replace(/```\n?/g, '').trim();
           const data = JSON.parse(text);
           if (data.subject) doc.subject = data.subject;
           if (Array.isArray(data.tags)) doc.tags = data.tags;
           await doc.save();
           console.log(`Updated ${doc.title} with tags:`, data.tags);
       }
     } catch (e) {
       console.log("Error:", e.message);
     }
  }
  process.exit(0);
}
testTags();
