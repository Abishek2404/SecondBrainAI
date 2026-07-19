const fs = require('fs');

let file = fs.readFileSync('src/components/SmartNotes.tsx', 'utf-8');

// 1. Remove saveNoteTags function
file = file.replace(/const saveNoteTags = async \([\s\S]*?\};\n\n/g, '');

// 2. Remove tags rendering in detail view
file = file.replace(/<div className="flex flex-wrap items-center gap-2 mt-4">[\s\S]*?<\/form>\s*<\/div>/, '');

// 3. Remove tags rendering in list view
file = file.replace(/\{note\.tags && note\.tags\.length > 0 && \([\s\S]*?\}\)\}\s*<\/div>\s*\)\}/g, '');

fs.writeFileSync('src/components/SmartNotes.tsx', file);
console.log("Patched SmartNotes.tsx");
