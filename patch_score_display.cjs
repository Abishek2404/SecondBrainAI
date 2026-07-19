const fs = require('fs');
let file = fs.readFileSync('src/components/Quizzes.tsx', 'utf-8');

const oldScore = `                             <div className="absolute inset-0 flex items-center justify-center">
                               <span className="text-[10px] font-bold text-foreground">_</span>
                             </div>`;
const newScore = `                             <div className="absolute inset-0 flex items-center justify-center">
                               <span className="text-xs font-bold text-foreground">-</span>
                             </div>`;

file = file.replace(oldScore, newScore);
fs.writeFileSync('src/components/Quizzes.tsx', file);
console.log("Patched score display");
