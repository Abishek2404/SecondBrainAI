import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "say hi",
    });
    console.log("gemini-2.5-flash SUCCESS", res.text);
  } catch (e) {
    console.error("gemini-2.5-flash ERROR", e.message);
  }
}
run();
