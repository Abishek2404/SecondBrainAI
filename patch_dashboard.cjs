const fs = require('fs');
let file = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');
file = file.replace(/<div className="h-10 w-10 shrink-0 rounded-\[14px\].*?>[\s\S]*?<\/div>/, `<div className="h-10 w-10 shrink-0 flex items-center justify-center">
                             <img src={doc.type === 'pdf' || doc.mimeType?.includes('pdf') ? '/pdf.svg.webp' : '/Doc File.png'} alt="Icon" className="h-full w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform" />
                           </div>`);
fs.writeFileSync('src/components/Dashboard.tsx', file);
console.log("Replaced using regex.");
