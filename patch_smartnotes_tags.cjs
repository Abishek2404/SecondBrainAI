const fs = require('fs');

let file = fs.readFileSync('src/components/SmartNotes.tsx', 'utf-8');

file = file.replace(/<div className="flex flex-wrap items-center gap-2 mt-4">[\s\S]*?<\/div>/, '');

file = file.replace(/\{note\.tags && note\.tags\.length > 0 && \([\s\S]*?\}\)\}\s*<\/div>\s*\)\}/, '');

fs.writeFileSync('src/components/SmartNotes.tsx', file);
console.log("Patched SmartNotes tags!");
