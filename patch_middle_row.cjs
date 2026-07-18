const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const target = `{/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">`;
      
const replace = target + `
        
        {/* Today's Goal Card */}
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-sm flex flex-col relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg tracking-tight">Today's Goal</h3>
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
              <Target className="h-5 w-5 text-red-500" />
            </div>
          </div>
          
          <div className="flex items-center gap-6 mt-2 flex-1">
            {/* Progress Circle */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" className="stroke-muted" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="42" 
                  fill="none" 
                  className="stroke-foreground transition-all duration-1000 ease-out" 
                  strokeWidth="8" 
                  strokeDasharray="263.89" 
                  strokeDashoffset={263.89 - (263.89 * goalProgressPct) / 100} 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold tracking-tight">{goalProgressPct}%</span>
              </div>
            </div>

            {/* Info & Button */}
            <div className="flex flex-col flex-1 justify-center">
              <h4 className="font-bold text-lg mb-1">
                {goalProgressPct >= 100 ? "Goal reached!" : goalProgressPct >= 50 ? "Great progress!" : "Keep going!"}
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                {completedTasks} of {dailyTasksGoal} tasks completed
              </p>
              <Button onClick={() => navigate('/planner')} className="w-fit rounded-xl px-5 shadow-sm font-medium">
                Continue Learning <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
`;

content = content.replace(target, replace);
content = content.replace('{/* AI Study Recommendation */}\\n        <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col relative overflow-hidden group">', '{/* AI Study Recommendation */}\\n        <div className="lg:col-span-3 rounded-2xl border bg-card p-6 shadow-sm flex flex-col relative overflow-hidden group">');

fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log('done');
