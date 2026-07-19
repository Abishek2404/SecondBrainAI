const fs = require('fs');
let file = fs.readFileSync('src/components/SmartNotes.tsx', 'utf-8');

file = file.replace(/<Button className="w-full sm:w-auto gap-2 rounded-xl h-10 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white" onClick=\{\(\) => setIsDialogOpen\(true\)\}>/g, `<Button className="w-full sm:w-auto gap-2 rounded-xl h-10 shadow-sm bg-black hover:bg-black/90 text-white" onClick={() => setIsDialogOpen(true)}>`);

file = file.replace(/<Button className="rounded-xl shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white" onClick=\{\(\) => setIsDialogOpen\(true\)\}>/g, `<Button className="rounded-xl shadow-sm bg-black hover:bg-black/90 text-white" onClick={() => setIsDialogOpen(true)}>`);

fs.writeFileSync('src/components/SmartNotes.tsx', file);
console.log("Patched buttons");
