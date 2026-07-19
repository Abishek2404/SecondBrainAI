const fs = require('fs');

let file = fs.readFileSync('src/components/Documents.tsx', 'utf-8');

file = file.replace(/<div className="flex justify-between items-start">\s*<span className="text-slate-500 font-medium mt-1">Tags<\/span>[\s\S]*?<\/div>\s*<\/div>/g, '');

fs.writeFileSync('src/components/Documents.tsx', file);
console.log("Patched tags in preview panel!");
