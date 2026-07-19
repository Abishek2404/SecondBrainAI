const fs = require('fs');

// 1. Remove from Document.ts
let docFile = fs.readFileSync('src/server/models/Document.ts', 'utf-8');
docFile = docFile.replace(/\s*tags\?:\s*string\[\];/g, '');
docFile = docFile.replace(/\s*tags:\s*\{\s*type:\s*\[String\],\s*default:\s*\[\],\s*\}/g, '');
fs.writeFileSync('src/server/models/Document.ts', docFile);

// 2. Remove from Note.ts
let noteFile = fs.readFileSync('src/server/models/Note.ts', 'utf-8');
noteFile = noteFile.replace(/\s*tags:\s*string\[\];/g, '');
noteFile = noteFile.replace(/\s*tags:\s*\{\s*type:\s*\[String\],\s*default:\s*\[\],\s*\}/g, '');
fs.writeFileSync('src/server/models/Note.ts', noteFile);

// 3. Remove from search.controller.ts
let searchFile = fs.readFileSync('src/server/controllers/search.controller.ts', 'utf-8');
searchFile = searchFile.replace(/,\s*\{ tags: regex \}/g, '');
searchFile = searchFile.replace(/ content tags /g, ' content ');
fs.writeFileSync('src/server/controllers/search.controller.ts', searchFile);

// 4. Remove from documents.controller.ts
let docsCtrlFile = fs.readFileSync('src/server/controllers/documents.controller.ts', 'utf-8');
docsCtrlFile = docsCtrlFile.replace(/if\s*\(req\.body\.tags\)\s*updateData\.tags\s*=\s*req\.body\.tags;/g, '');

const regexAI = /let aiTags = \[\];[\s\S]*?if \(aiTags\.length > 0\) \{\s*document\.tags = aiTags;\s*\}/;
docsCtrlFile = docsCtrlFile.replace(regexAI, `
        if (extractedText) {
          await processDocument(document._id.toString(), req.user?._id.toString(), extractedText);
        }
`);
fs.writeFileSync('src/server/controllers/documents.controller.ts', docsCtrlFile);

// 5. Remove from notes.controller.ts
let notesCtrlFile = fs.readFileSync('src/server/controllers/notes.controller.ts', 'utf-8');
notesCtrlFile = notesCtrlFile.replace(/,\s*tags/g, '');
notesCtrlFile = notesCtrlFile.replace(/if\s*\(tags\s*!==\s*undefined\)\s*note\.tags\s*=\s*tags;/g, '');
fs.writeFileSync('src/server/controllers/notes.controller.ts', notesCtrlFile);

// 6. Remove from offlineDb.ts
let offlineDbFile = fs.readFileSync('src/lib/offlineDb.ts', 'utf-8');
offlineDbFile = offlineDbFile.replace(/tags:\s*bodyData\.tags\s*\|\|\s*\["offline"\],/g, '');
fs.writeFileSync('src/lib/offlineDb.ts', offlineDbFile);

console.log("Patched server files!");
