import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const res = await ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: 'test'
    });
    console.log('gemini-embedding-2 worked');
  } catch (e) {
    console.log('gemini-embedding-2 failed', e.message);
  }
}
test();
