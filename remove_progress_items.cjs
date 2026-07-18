const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(/<svg className="absolute bottom-0 left-0 w-full h-12 opacity-60" preserveAspectRatio="none" viewBox="0 0 100 40">\s*<path d="M0,35 C20,15 30,40 50,25 C70,10 80,35 100,20" fill="none" stroke="#9333ea" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" \/>\s*<\/svg>/g, '');

code = code.replace(/<svg className="absolute bottom-0 left-0 w-full h-12 opacity-60" preserveAspectRatio="none" viewBox="0 0 100 40">\s*<path d="M0,30 C20,15 30,35 50,20 C70,5 80,30 100,15" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" \/>\s*<\/svg>/g, '');

code = code.replace(/<svg className="absolute bottom-0 left-0 w-full h-12 opacity-60" preserveAspectRatio="none" viewBox="0 0 100 40">\s*<path d="M0,35 C20,20 30,40 50,25 C70,10 80,25 100,5" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" \/>\s*<\/svg>/g, '');

code = code.replace(/<svg className="absolute bottom-0 left-0 w-full h-12 opacity-60" preserveAspectRatio="none" viewBox="0 0 100 40">\s*<path d="M0,25 C20,10 30,35 50,20 C70,5 80,30 100,10" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" \/>\s*<\/svg>/g, '');

const streakBlock = `<div className="flex items-center justify-between bg-purple-500/10 rounded-xl p-3 px-4 border border-purple-500/10 text-purple-700 dark:text-purple-400 cursor-pointer hover:bg-purple-500/20 transition-colors mt-auto">
                    <div className="flex items-center gap-2.5">
                      <Trophy className="h-4 w-4" />
                      <span className="text-sm font-semibold">Best streak: {longestStreakVal} days</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                 </div>`;
                 
code = code.replace(streakBlock, '');

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Removed selected items.");
