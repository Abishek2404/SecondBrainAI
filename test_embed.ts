import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const res = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: 'test'
    });
    console.log('text-embedding-004 worked');
  } catch (e) {
    console.log('text-embedding-004 failed', e.message);
  }
}
test();
