const fs = require('fs');
let code = fs.readFileSync('src/server/controllers/documents.controller.ts', 'utf8');

code = code.replace(
    /contents: \`Please determine the most appropriate subject or category for this document based on the following text\. Respond ONLY with the subject name \(e\.g\., "Mathematics", "History", "Biology", "Computer Science", "HTML", "CSS", "Python", "Web Development", etc\.\)\. Keep it to 1-3 words\.\\n\\nText: \$\{extractedText \? extractedText\.substring\(0, 5000\) : \(document\.extractedText \? document\.extractedText\.substring\(0, 5000\) : ''\)\}\`/g,
    `contents: \`Please determine the most appropriate subject or category, and suggest 3-5 tags for this document based on the following text. Respond ONLY with a valid JSON object in this format: {"subject": "string", "tags": ["tag1", "tag2"]}. Keep the subject to 1-3 words (e.g., "Mathematics", "Computer Science", "Web Development").\\n\\nText: \${extractedText ? extractedText.substring(0, 5000) : (document.extractedText ? document.extractedText.substring(0, 5000) : '')}\``
);

code = code.replace(
    /const figuredSubject = response\.text\?\.trim\(\);\s*if \(figuredSubject && figuredSubject\.length > 0 && figuredSubject\.length < 50\) \{\s*document\.subject = figuredSubject;\s*\}/,
    `if (response && response.text) {
                     try {
                         const text = response.text.replace(/\`\`\`json\\n/g, '').replace(/\`\`\`\\n?/g, '').trim();
                         const data = JSON.parse(text);
                         if (data.subject && data.subject.length > 0 && data.subject.length < 50) {
                             document.subject = data.subject;
                         }
                         if (Array.isArray(data.tags)) {
                             document.tags = data.tags;
                         }
                     } catch (e) {
                         console.error("Failed to parse subject/tags JSON", e);
                     }
                 }`
);

fs.writeFileSync('src/server/controllers/documents.controller.ts', code);
