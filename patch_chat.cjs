const fs = require('fs');
let file = fs.readFileSync('src/components/Chat.tsx', 'utf-8');

const searchRegex = /<div className=\{`p-1\.5 \$\{bg\} rounded-lg shrink-0 border border-white\/50`\}>\s*<FileText className=\{`h-4 w-4 \$\{color\}`\} \/>\s*<\/div>/g;
const replacement = `<div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center">
  {source.type === 'pdf' ? (
    <img src="/pdf.svg.webp" alt="PDF" className="w-full h-full object-contain" />
  ) : (
    <img src="/Doc%20File.png" alt="Doc" className="w-full h-full object-contain" />
  )}
</div>`;

file = file.replace(searchRegex, replacement);

fs.writeFileSync('src/components/Chat.tsx', file);
console.log("Chat.tsx patched.");
