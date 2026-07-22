const fs = require('fs');
let code = fs.readFileSync('src/server/controllers/documents.controller.ts', 'utf8');

// Fix subject generation prompt
code = code.replace(
  /contents: \`Please determine the most appropriate academic subject or category for this document based on the following text\. Respond ONLY with the subject name \(e\.g\., "Mathematics", "History", "Biology", "Computer Science", etc\.\)\. Keep it to 1-3 words\.\\n\\nText: \$\{extractedText\.substring\(0, 5000\)\}\`/g,
  `contents: \`Please determine the most appropriate subject or category for this document based on the following text. Respond ONLY with the subject name (e.g., "Mathematics", "History", "Biology", "Computer Science", "HTML", "CSS", "Python", "Web Development", etc.). Keep it to 1-3 words.\\n\\nText: \${extractedText ? extractedText.substring(0, 5000) : (document.extractedText ? document.extractedText.substring(0, 5000) : '')}\``
);

// We need to specifically fix the summary generation logic back to what it was
code = code.replace(
  /summary = response\.text \|\| "Summary generation failed\.";/g,
  `summary = response ? (response.text || "Summary generation failed.") : "Summary generation failed.";`
);

fs.writeFileSync('src/server/controllers/documents.controller.ts', code);
