import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  for (let i = 0; i < 6; i++) {
    try {
      const res = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: 'test'
      });
      console.log('gemini-3.5-flash worked', i);
    } catch (e) {
      console.log('gemini-3.5-flash failed', i, e.message);
    }
  }
}
test();
