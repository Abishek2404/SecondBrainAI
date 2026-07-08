import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: "hello world",
    });
    console.log("gemini-embedding-2 SUCCESS");
  } catch (e) {
    console.error("gemini-embedding-2 ERROR", e.message);
  }
}
run();
