const fs = require('fs');
let code = fs.readFileSync('src/server/controllers/documents.controller.ts', 'utf8');

code = code.replace(
  /const ai = new GoogleGenAI\(\{ apiKey: process\.env\.GEMINI_API_KEY \}\);\s*const response = await ai\.models\.generateContent\(\{[\s\S]*?\}\);/g,
  `const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                 let response;
                 for (let attempt = 0; attempt < 3; attempt++) {
                     try {
                         response = await ai.models.generateContent({
                             model: 'gemini-3.6-flash',
                             contents: \`Please determine the most appropriate academic subject or category for this document based on the following text. Respond ONLY with the subject name (e.g., "Mathematics", "History", "Biology", "Computer Science", etc.). Keep it to 1-3 words.\\n\\nText: \${extractedText.substring(0, 5000)}\`
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
                 }`
);

fs.writeFileSync('src/server/controllers/documents.controller.ts', code);
