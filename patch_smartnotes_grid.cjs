const fs = require('fs');
let file = fs.readFileSync('src/components/SmartNotes.tsx', 'utf-8');

file = file.replace(/<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">/, `<div className={\`grid \${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6 pb-12\`}>`);

fs.writeFileSync('src/components/SmartNotes.tsx', file);
console.log("Patched grid container");
