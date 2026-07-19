const fs = require('fs');
let code = fs.readFileSync('src/server/controllers/documents.controller.ts', 'utf-8');

// Move import if it's not at the top
if (code.includes('import { GoogleGenAI } from "@google/genai";') && !code.startsWith('import { GoogleGenAI }')) {
    code = code.replace('import { GoogleGenAI } from "@google/genai";', '');
    code = 'import { GoogleGenAI } from "@google/genai";\n' + code;
}

const targetUpload = `
    // Asynchronously process the document into chunks for semantic search
    (async () => {
      try {
        const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype, req.file.originalname);
        document.extractedText = extractedText;
        if (extractedText) {
          await processDocument(document._id.toString(), req.user?._id.toString(), extractedText);
        }
        document.status = 'ready';
        await document.save();
      } catch (err) {
        console.error("Error processing document chunks:", err);
        document.status = 'failed';
        await document.save();
      }
    })();
`;

const replacementUpload = `
    // Asynchronously process the document into chunks for semantic search
    (async () => {
      try {
        const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype, req.file.originalname);
        document.extractedText = extractedText;
        
        let aiTags = [];
        if (extractedText) {
          try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: \`You are an automated tagging system. Based on the following document text, generate 3 to 5 highly relevant topic tags (single words or short phrases). Return ONLY the tags, separated by commas, with no other text, formatting, or explanation.\\n\\nDocument text:\\n\${extractedText.substring(0, 5000)}\`,
            });
            if (response.text) {
               aiTags = response.text.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0 && tag.length < 30);
            }
          } catch (aiError) {
            console.error("Error generating auto-tags:", aiError);
          }
        
          await processDocument(document._id.toString(), req.user?._id.toString(), extractedText);
        }
        
        if (aiTags.length > 0) {
           document.tags = aiTags;
        }
        document.status = 'ready';
        await document.save();
      } catch (err) {
        console.error("Error processing document chunks:", err);
        document.status = 'failed';
        await document.save();
      }
    })();
`;

code = code.replace(targetUpload.trim(), replacementUpload.trim());

fs.writeFileSync('src/server/controllers/documents.controller.ts', code);
