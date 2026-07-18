const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const progressStart = `{/* This Week's Progress */}`;
const quickActionStart = `{/* Quick Action Floating Menu */}`;

let lines = code.split('\n');
const startIdx = lines.findIndex(l => l.includes(progressStart));
const endIdx = lines.findIndex(l => l.includes(quickActionStart));

const newProgressSection = `      {/* This Week's Progress */}
      <div className="flex flex-col gap-6">
         <h3 className="font-semibold text-lg tracking-tight">This Week's Progress</h3>
         
         <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 flex-1 w-full">
                {/* Study Time */}
                <div className="flex flex-col gap-1.5">
                   <div className="flex items-center gap-2">
                     <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                       <Clock className="h-4 w-4 text-indigo-600" />
                     </div>
                     <span className="text-xs text-muted-foreground font-medium">Study Time</span>
                   </div>
                   <div className="text-2xl font-bold tracking-tight">
                     {Math.floor(analytics?.totalStudyHours || 24)}h {Math.round(((analytics?.totalStudyHours || 24.6) % 1) * 60)}m
                   </div>
                   <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                     <ArrowRight className="h-3 w-3 -rotate-45" /> 4h 12m vs last week
                   </span>
                </div>

                {/* Tasks Completed */}
                <div className="flex flex-col gap-1.5">
                   <div className="flex items-center gap-2">
                     <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                       <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                     </div>
                     <span className="text-xs text-muted-foreground font-medium">Tasks Completed</span>
                   </div>
                   <div className="text-2xl font-bold tracking-tight">
                     {analytics?.completedTasks || 84}
                   </div>
                   <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                     <ArrowRight className="h-3 w-3 -rotate-45" /> 17 vs last week
                   </span>
                </div>

                {/* Quiz Accuracy */}
                <div className="flex flex-col gap-1.5">
                   <div className="flex items-center gap-2">
                     <div className="h-8 w-8 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                       <TrendingUp className="h-4 w-4 text-pink-600" />
                     </div>
                     <span className="text-xs text-muted-foreground font-medium">Quiz Accuracy</span>
                   </div>
                   <div className="text-2xl font-bold tracking-tight">
                     {analytics?.avgQuizScore || 87}%
                   </div>
                   <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                     <ArrowRight className="h-3 w-3 -rotate-45" /> 9% vs last week
                   </span>
                </div>

                {/* Documents Processed */}
                <div className="flex flex-col gap-1.5">
                   <div className="flex items-center gap-2">
                     <div className="h-8 w-8 rounded-full bg-slate-500/10 flex items-center justify-center shrink-0">
                       <FileText className="h-4 w-4 text-slate-600" />
                     </div>
                     <span className="text-xs text-muted-foreground font-medium">Documents Processed</span>
                   </div>
                   <div className="text-2xl font-bold tracking-tight">
                     {analytics?.totalDocuments || 3}
                   </div>
                   <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                     <ArrowRight className="h-3 w-3 -rotate-45" /> 2 vs last week
                   </span>
                </div>
              </div>

              {/* Heatmap */}
              <div className="flex flex-col shrink-0 lg:pl-8 lg:border-l border-muted">
                <div className="flex items-center gap-1 mb-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <div key={day} className="w-6 text-center text-[9px] text-muted-foreground font-medium">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <div key={day} className="flex flex-col gap-1">
                       {[0, 1, 2].map(level => {
                          // mock logic for heatmap
                          const activeLevels = i === 1 ? 2 : i === 2 ? 3 : i === 4 ? 1 : i === 5 ? 3 : i === 6 ? 2 : 1;
                          const isActive = 2 - level < activeLevels;
                          return (
                            <div key={level} className={\`w-6 h-6 rounded-[4px] \${isActive ? 'bg-emerald-500' : 'bg-emerald-500/20'}\`} />
                          );
                       })}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 px-1">
                   <span className="text-[10px] text-muted-foreground">Less</span>
                   <div className="flex items-center gap-0.5">
                     <div className="w-3 h-3 rounded-[2px] bg-emerald-500/20" />
                     <div className="w-3 h-3 rounded-[2px] bg-emerald-500/40" />
                     <div className="w-3 h-3 rounded-[2px] bg-emerald-500/60" />
                     <div className="w-3 h-3 rounded-[2px] bg-emerald-500/80" />
                     <div className="w-3 h-3 rounded-[2px] bg-emerald-500" />
                   </div>
                   <span className="text-[10px] text-muted-foreground">More</span>
                </div>
              </div>

            </div>
         </div>
      </div>
`;

if (startIdx !== -1 && endIdx !== -1) {
    let newLines = [
        ...lines.slice(0, startIdx),
        newProgressSection,
        ...lines.slice(endIdx)
    ];
    fs.writeFileSync('src/components/Dashboard.tsx', newLines.join('\n'));
    console.log("Updated This Week's Progress section.");
} else {
    console.log("Could not find start or end index.");
}
