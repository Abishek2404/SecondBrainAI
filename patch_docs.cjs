const fs = require('fs');
let code = fs.readFileSync('src/server/controllers/documents.controller.ts', 'utf8');

code = code.replace(
  /if \(extractedText\) \{\s*await processDocument\(document\._id\.toString\(\), req\.user\?\._id\.toString\(\), extractedText\);\s*\}/,
  `if (extractedText) {
          if (document.subject === 'General') {
             try {
                 const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
                 const response = await ai.models.generateContent({
                     model: 'gemini-3.5-flash',
                     contents: \`Please determine the most appropriate academic subject or category for this document based on the following text. Respond ONLY with the subject name (e.g., "Mathematics", "History", "Biology", "Computer Science", etc.). Keep it to 1-3 words.\\n\\nText: \${extractedText.substring(0, 5000)}\`
                 });
                 const figuredSubject = response.text?.trim();
                 if (figuredSubject && figuredSubject.length > 0 && figuredSubject.length < 50) {
                     document.subject = figuredSubject;
                 }
             } catch(err) {
                 console.error("Error determining subject:", err);
             }
          }
          await processDocument(document._id.toString(), req.user?._id.toString(), extractedText);
        }`
);

fs.writeFileSync('src/server/controllers/documents.controller.ts', code);
