const fs = require('fs');
let file = fs.readFileSync('src/components/SmartNotes.tsx', 'utf-8');

file = file.replace(/<SelectItem value="important questions">Important Questions<\/SelectItem>/, '<SelectItem value="important question">Important Questions</SelectItem>');

fs.writeFileSync('src/components/SmartNotes.tsx', file);
console.log("Patched SelectItem");
