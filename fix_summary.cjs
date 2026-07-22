const fs = require('fs');
let code = fs.readFileSync('src/server/controllers/documents.controller.ts', 'utf8');

const targetStr = `contents: \`Please determine the most appropriate subject or category for this document based on the following text. Respond ONLY with the subject name (e.g., "Mathematics", "History", "Biology", "Computer Science", "HTML", "CSS", "Python", "Web Development", etc.). Keep it to 1-3 words.\\n\\nText: \${extractedText ? extractedText.substring(0, 5000) : (document.extractedText ? document.extractedText.substring(0, 5000) : '')}\``;

const parts = code.split(targetStr);

if (parts.length === 3) {
  // It found two instances. Replace the second one with the summary prompt.
  const summaryPrompt = `contents: \`Summarize the following document in a concise, informative paragraph:\\n\\n\${document.extractedText.substring(0, 15000)}\``;
  
  code = parts[0] + targetStr + parts[1] + summaryPrompt + parts[2];
  fs.writeFileSync('src/server/controllers/documents.controller.ts', code);
  console.log('Fixed summary prompt!');
} else {
  console.log('Could not find two instances of the prompt:', parts.length - 1);
}

