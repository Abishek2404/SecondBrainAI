const fs = require('fs');
let code = fs.readFileSync('src/server/services/rag.service.ts', 'utf8');

code = code.replace(/text-embedding-004/g, 'text-embedding-004'); // Wait, the error said "models/text-embedding-004 is not found". I should use 'gemini-embedding-2-preview'
code = code.replace(/text-embedding-004/g, 'gemini-embedding-2-preview');
code = code.replace(/gemini-3\.5-flash/g, 'gemini-3.6-flash');

fs.writeFileSync('src/server/services/rag.service.ts', code);
