import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.list();
  for (const m of response.pageItems) {
    if (m.name.includes('embed') || m.name.includes('text-')) {
        console.log(m.name);
    }
  }
}
test();
