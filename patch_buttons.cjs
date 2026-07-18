const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
  'className="h-8 w-8 rounded-full border bg-background hover:bg-muted flex items-center justify-center shrink-0 shadow-sm z-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">',
  'className="h-10 w-10 sm:h-8 sm:w-8 rounded-full border bg-background hover:bg-muted flex items-center justify-center shrink-0 shadow-sm z-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">'
);
code = code.replace(
  'className="h-8 w-8 rounded-full border bg-background hover:bg-muted flex items-center justify-center shrink-0 shadow-sm z-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">',
  'className="h-10 w-10 sm:h-8 sm:w-8 rounded-full border bg-background hover:bg-muted flex items-center justify-center shrink-0 shadow-sm z-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);

let docs = fs.readFileSync('src/components/Documents.tsx', 'utf8');
docs = docs.replace(
  '<button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border bg-background hover:bg-muted transition-colors">',
  '<button className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl border bg-background hover:bg-muted transition-colors">'
);
docs = docs.replace(
  '<button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border bg-background hover:bg-muted transition-colors">',
  '<button className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl border bg-background hover:bg-muted transition-colors">'
);

fs.writeFileSync('src/components/Documents.tsx', docs);
