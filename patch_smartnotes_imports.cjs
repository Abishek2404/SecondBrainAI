const fs = require('fs');
let file = fs.readFileSync('src/components/SmartNotes.tsx', 'utf-8');

file = file.replace(/import \{ BookOpen/, "import { LayoutGrid, List, Star, Image as ImageIcon, BookOpen");
fs.writeFileSync('src/components/SmartNotes.tsx', file);
console.log("Patched imports");
