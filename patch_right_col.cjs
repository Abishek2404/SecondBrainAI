const fs = require('fs');
let file = fs.readFileSync('src/components/Quizzes.tsx', 'utf-8');

const rightColStart = '      {/* Right Column (Sidebar) */}';
const dialogsStart = '      <ConfirmDialog ';

const rightIdx = file.indexOf(rightColStart);
const dialogsIdx = file.indexOf(dialogsStart, rightIdx);

const newRightCol = `      {/* Right Column (Sidebar) */}
      <div className="w-full xl:w-[320px] 2xl:w-[340px] shrink-0 flex flex-col gap-6">
        
        {/* Your Performance Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-foreground">Your Performance</h3>
           </div>
           
           <div className="flex items-center gap-6 mb-6">
             <div className="relative w-[100px] h-[100px] shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                   <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/30" />
                   {/* Correct - Green */}
                   <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="263.89" strokeDashoffset={263.89 * (1 - (avgScorePct/100))} className="text-emerald-500" />
                   {/* Incorrect - Red (starts after green) */}
                   <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="263.89" strokeDashoffset={263.89 * (1 - (1 - avgScorePct/100))} className="text-red-500" style={{ transformOrigin: 'center', transform: \`rotate(\${(avgScorePct/100) * 360}deg)\` }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-2xl font-bold text-foreground leading-none">{Math.round(avgScorePct)}%</span>
                   <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5">Avg Score</span>
                </div>
             </div>
             
             <div className="flex flex-col gap-2.5 flex-1">
                <div className="flex items-center justify-between text-xs">
                   <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                     <span className="font-bold text-foreground">Correct</span>
                   </div>
                   <div className="flex items-center gap-1 font-bold">
                     <span className="text-foreground">{Math.round(totalCorrect)}</span>
                     <span className="text-muted-foreground/60">({Math.round(avgScorePct)}%)</span>
                   </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                   <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                     <span className="font-bold text-foreground">Incorrect</span>
                   </div>
                   <div className="flex items-center gap-1 font-bold">
                     <span className="text-foreground">{Math.round(totalQuestionsAttempted - totalCorrect)}</span>
                     <span className="text-muted-foreground/60">({totalQuestionsAttempted > 0 ? 100 - Math.round(avgScorePct) : 0}%)</span>
                   </div>
                </div>
             </div>
           </div>
           
           <div className="w-full py-2.5 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-bold text-center flex items-center justify-center gap-1">
              <span>{totalQuizzesTaken > 0 ? '✓ Keep up the great work!' : 'Start your first quiz today!'}</span>
           </div>
        </div>

        {/* Subject Performance Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-foreground">Subject Performance</h3>
           </div>
           
           <div className="flex flex-col gap-5">
              {formattedSubjects.length > 0 ? formattedSubjects.map(sub => (
                <div key={sub.name} className="flex flex-col gap-2">
                   <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-foreground">{sub.name}</span>
                      <span className="text-foreground">{sub.progress}%</span>
                   </div>
                   <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={\`h-full rounded-full \${sub.color}\`} style={{ width: \`\${sub.progress}%\` }} />
                   </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">Take some quizzes to see your subject stats!</p>
              )}
           </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-foreground">Recent Activity</h3>
           </div>
           
           <div className="flex flex-col gap-5">
              {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                <div key={i} className="flex gap-4">
                   <div className={\`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 \${activity.bg}\`}>
                     {activity.icon}
                   </div>
                   <div className="flex flex-col min-w-0 flex-1">
                      <h4 className="text-[13px] font-bold text-foreground truncate mb-0.5">{activity.title}</h4>
                      <p className="text-[11px] font-semibold text-muted-foreground">{activity.subtitle}</p>
                   </div>
                   <div className="text-[10px] font-bold text-muted-foreground text-right shrink-0 mt-1 whitespace-nowrap">
                      {activity.time}
                   </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity yet.</p>
              )}
           </div>
        </div>
      </div>
    </div>
`;

file = file.substring(0, rightIdx) + newRightCol + file.substring(dialogsIdx);

fs.writeFileSync('src/components/Quizzes.tsx', file);
console.log("Patched right column");
