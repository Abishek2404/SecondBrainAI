const fs = require('fs');
let file = fs.readFileSync('src/components/Quizzes.tsx', 'utf-8');

// We need to calculate quizzes taken today
const statsCalculation = `  const recentActivity = quizzes
    .filter(q => q.attemptsCount > 0)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())`;

const newStatsCalculation = `  const todayStr = new Date().toDateString();
  const quizzesCompletedToday = quizzes.filter(q => q.attemptsCount > 0 && new Date(q.updatedAt || q.createdAt).toDateString() === todayStr).length;
  const dailyGoal = 3;
  const dailyProgress = Math.min(quizzesCompletedToday / dailyGoal, 1);

  const recentActivity = quizzes
    .filter(q => q.attemptsCount > 0)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())`;

file = file.replace(statsCalculation, newStatsCalculation);

const oldDailyGoalCard = `        {/* Daily Goal Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-foreground">Daily Goal</h3>
             <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Edit Goal</a>
           </div>
           
           <div className="flex items-center gap-5">
              <div className="relative w-[60px] h-[60px] shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                   <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/30" />
                   <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="276.46" strokeDashoffset={276.46 * (1 - 2/3)} className="text-emerald-500 stroke-emerald-500" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-sm font-bold text-foreground leading-none">2/3</span>
                </div>
              </div>
              <div className="flex flex-col">
                 <h4 className="text-sm font-bold text-foreground mb-1">Quizzes Completed</h4>
                 <p className="text-xs font-semibold text-muted-foreground leading-relaxed pr-2">Complete 3 quizzes daily to earn <strong className="text-foreground">50 Focus Points</strong></p>
              </div>
           </div>
        </div>`;

const newDailyGoalCard = `        {/* Daily Goal Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-4">
             <h3 className="font-bold text-foreground">Daily Goal</h3>
             <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Edit Goal</a>
           </div>
           
           <div className="flex items-center gap-5">
              <div className="relative w-[60px] h-[60px] shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                   <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/30" />
                   <motion.circle 
                     cx="50" cy="50" r="44" 
                     stroke="currentColor" 
                     strokeWidth="12" 
                     fill="transparent" 
                     strokeDasharray="276.46" 
                     initial={{ strokeDashoffset: 276.46 }}
                     animate={{ strokeDashoffset: 276.46 * (1 - dailyProgress) }}
                     transition={{ duration: 1.5, ease: "easeOut" }}
                     className="text-emerald-500 stroke-emerald-500" 
                     strokeLinecap="round" 
                   />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-sm font-bold text-foreground leading-none">{quizzesCompletedToday}/{dailyGoal}</span>
                </div>
              </div>
              <div className="flex flex-col">
                 <h4 className="text-sm font-bold text-foreground mb-1">Quizzes Completed</h4>
                 <p className="text-xs font-semibold text-muted-foreground leading-relaxed pr-2">
                   {quizzesCompletedToday >= dailyGoal 
                     ? <span className="text-emerald-600">You've reached your daily goal! Great job!</span>
                     : <>Complete {dailyGoal} quizzes daily to earn <strong className="text-foreground">50 Focus Points</strong></>
                   }
                 </p>
              </div>
           </div>
        </div>`;

file = file.replace(oldDailyGoalCard, newDailyGoalCard);
fs.writeFileSync('src/components/Quizzes.tsx', file);
console.log("Patched Daily Goal using real data and animation");
