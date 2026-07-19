const fs = require('fs');
let file = fs.readFileSync('src/components/Quizzes.tsx', 'utf-8');

file = file.replace(/text-\\[11px\\] font-bold uppercase tracking-wider/, "text-sm font-bold");

fs.writeFileSync('src/components/Quizzes.tsx', file);
console.log("Patched subject perf");
