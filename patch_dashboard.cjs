const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

if (!code.includes('Check,')) {
    code = code.replace('ExternalLink\n} from "lucide-react";', 'ExternalLink, LineChart, CheckCircle2, Check\n} from "lucide-react";');
}

const targetStart = `{/* This Week's Progress */}`;
const targetEnd = `{/* Bottom Section */}`;

const startIndex = code.indexOf(targetStart);
const endIndex = code.indexOf(targetEnd);

if (startIndex !== -1 && endIndex !== -1) {
    const before = code.substring(0, startIndex);
    const after = code.substring(endIndex);
    
    const newSection = `{/* This Week's Progress */}
      <div className="mt-4 flex flex-col gap-4">
         <div className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm flex flex-col gap-8">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <LineChart className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-xl tracking-tight text-foreground">This Week's Progress</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Great job! You're consistent and making progress.</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-9 rounded-lg px-3 shadow-sm border-muted font-medium shrink-0">
                <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                This Week
                <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
              </Button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Cards Grid */}
              <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Study Time Card */}
                <div className="bg-slate-50/50 dark:bg-muted/10 border border-muted/50 rounded-2xl p-5 flex flex-col h-[180px] relative overflow-hidden group">
                   <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-4 shrink-0">
                     <Clock className="h-5 w-5 text-purple-600" />
                   </div>
                   <div className="flex flex-col z-10">
                     <span className="text-sm text-muted-foreground font-medium mb-1">Study Time</span>
                     <div className="text-2xl font-bold tracking-tight flex items-baseline gap-1">
                       <span className="text-purple-700 dark:text-purple-400">{Math.floor(analytics?.totalStudyHours || 24)}h</span>
                       <span className="text-foreground">{Math.round(((analytics?.totalStudyHours || 24.6) % 1) * 60)}m</span>
                     </div>
                     <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-2">
                       <ArrowRight className="h-3 w-3 -rotate-45" /> 4h 12m vs last week
                     </span>
                   </div>
                   <svg className="absolute bottom-0 left-0 w-full h-12 opacity-60" preserveAspectRatio="none" viewBox="0 0 100 40">
                     <path d="M0,35 C20,15 30,40 50,25 C70,10 80,35 100,20" fill="none" stroke="#9333ea" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                   </svg>
                </div>

                {/* Tasks Completed Card */}
                <div className="bg-slate-50/50 dark:bg-muted/10 border border-muted/50 rounded-2xl p-5 flex flex-col h-[180px] relative overflow-hidden group">
                   <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 shrink-0">
                     <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                   </div>
                   <div className="flex flex-col z-10">
                     <span className="text-sm text-muted-foreground font-medium mb-1">Tasks Completed</span>
                     <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                       {analytics?.completedTasks || 84}
                     </div>
                     <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-2">
                       <ArrowRight className="h-3 w-3 -rotate-45" /> 17 vs last week
                     </span>
                   </div>
                   <svg className="absolute bottom-0 left-0 w-full h-12 opacity-60" preserveAspectRatio="none" viewBox="0 0 100 40">
                     <path d="M0,30 C20,15 30,35 50,20 C70,5 80,30 100,15" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                   </svg>
                </div>

                {/* Accuracy Card */}
                <div className="bg-slate-50/50 dark:bg-muted/10 border border-muted/50 rounded-2xl p-5 flex flex-col h-[180px] relative overflow-hidden group">
                   <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 shrink-0">
                     <TrendingUp className="h-5 w-5 text-blue-600" />
                   </div>
                   <div className="flex flex-col z-10">
                     <span className="text-sm text-muted-foreground font-medium mb-1">Accuracy</span>
                     <div className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                       {analytics?.avgQuizScore || 87}%
                     </div>
                     <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-2">
                       <ArrowRight className="h-3 w-3 -rotate-45" /> 9% vs last week
                     </span>
                   </div>
                   <svg className="absolute bottom-0 left-0 w-full h-12 opacity-60" preserveAspectRatio="none" viewBox="0 0 100 40">
                     <path d="M0,35 C20,20 30,40 50,25 C70,10 80,25 100,5" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                   </svg>
                </div>

                {/* Documents Read Card */}
                <div className="bg-slate-50/50 dark:bg-muted/10 border border-muted/50 rounded-2xl p-5 flex flex-col h-[180px] relative overflow-hidden group">
                   <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 shrink-0">
                     <FileText className="h-5 w-5 text-orange-500" />
                   </div>
                   <div className="flex flex-col z-10">
                     <span className="text-sm text-muted-foreground font-medium mb-1">Documents Read</span>
                     <div className="text-2xl font-bold tracking-tight text-orange-500 dark:text-orange-400">
                       {analytics?.totalDocuments || 3}
                     </div>
                     <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-2">
                       <ArrowRight className="h-3 w-3 -rotate-45" /> 2 vs last week
                     </span>
                   </div>
                   <svg className="absolute bottom-0 left-0 w-full h-12 opacity-60" preserveAspectRatio="none" viewBox="0 0 100 40">
                     <path d="M0,25 C20,10 30,35 50,20 C70,5 80,30 100,10" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                   </svg>
                </div>

              </div>

              {/* Weekly Streak Section */}
              <div className="xl:col-span-1 border-t xl:border-t-0 xl:border-l border-muted pt-6 xl:pt-0 xl:pl-8 flex flex-col justify-center">
                 <div className="flex items-center gap-3 mb-8">
                   <h4 className="font-semibold text-lg">Weekly Streak</h4>
                   <div className="flex items-center gap-1.5">
                     <Flame className="h-5 w-5 text-orange-500 fill-orange-500" />
                     <span className="font-bold text-lg">{currentStreakVal} days</span>
                   </div>
                 </div>
                 
                 <div className="flex items-center justify-between gap-1 mb-8">
                   {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                      const distribution = analytics?.studyDistribution;
                      let isCompleted = false;
                      if (distribution && distribution.length === 7) {
                        const dayData = distribution.find((d: any) => d.day === day);
                        if (dayData && dayData.hours > 0) isCompleted = true;
                      } else {
                        // Mock data for preview if no real data
                        isCompleted = i < 4; 
                      }
                      
                      return (
                        <div key={day} className="flex flex-col items-center gap-2">
                          <span className="text-[11px] font-medium text-muted-foreground">{day}</span>
                          <div className={\`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-colors \${isCompleted ? 'bg-emerald-500 text-white shadow-sm' : 'bg-muted text-transparent'}\`}>
                            <Check className="h-4 w-4" strokeWidth={3} />
                          </div>
                        </div>
                      )
                   })}
                 </div>
                 
                 <div className="flex items-center justify-between bg-purple-500/10 rounded-xl p-3 px-4 border border-purple-500/10 text-purple-700 dark:text-purple-400 cursor-pointer hover:bg-purple-500/20 transition-colors mt-auto">
                    <div className="flex items-center gap-2.5">
                      <Trophy className="h-4 w-4" />
                      <span className="text-sm font-semibold">Best streak: {longestStreakVal} days</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                 </div>
              </div>
            </div>
         </div>
      </div>
      
      `;
      
    code = before + newSection + after;
    fs.writeFileSync('src/components/Dashboard.tsx', code);
    console.log("Patched successfully");
} else {
    console.log("Could not find targets");
}
