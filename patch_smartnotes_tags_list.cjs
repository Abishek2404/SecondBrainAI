const fs = require('fs');

let file = fs.readFileSync('src/components/SmartNotes.tsx', 'utf-8');

file = file.replace(/\{note\.tags && note\.tags\.length > 0 && \([\s\S]*?\}\)\}\s*<\/div>\s*\)\}/g, '');

fs.writeFileSync('src/components/SmartNotes.tsx', file);
console.log("Patched SmartNotes list tags!");
