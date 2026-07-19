const fs = require('fs');
let file = fs.readFileSync('src/components/Quizzes.tsx', 'utf-8');

file = file.replace(/className=\{\`rounded-xl px-4 py-2\.5 text-sm font-bold whitespace-nowrap transition-colors \\\$\\{isActive \? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-muted text-muted-foreground bg-transparent'\\}\`\}/, 
"className={`rounded-full px-5 py-2.5 text-[13px] font-bold whitespace-nowrap transition-colors ${isActive ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-muted text-muted-foreground bg-transparent'}`}");

fs.writeFileSync('src/components/Quizzes.tsx', file);
console.log("Patched tabs pill");
