const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const oldState = `  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);`;
const newState = `  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [currentRecIndex, setCurrentRecIndex] = useState(0);

  const recommendations = React.useMemo(() => {
    if (!analytics) return [
      {
        title: "Review CSS Box Model",
        description: "You're slightly behind on this topic. Spend 30 minutes today to strengthen your understanding.",
        time: "30 min",
        impact: "High Impact",
        icon: <BrainCircuit className="h-10 w-10 text-indigo-500" strokeWidth={1.5} />,
        link: "/documents"
      }
    ];
    const recs = [];
    
    if (analytics.subjectPerformance && analytics.subjectPerformance.length > 0) {
       const lowestSubject = [...analytics.subjectPerformance].sort((a, b) => a.score - b.score)[0];
       if (lowestSubject.score < 80) {
         recs.push({
           title: \`Review \${lowestSubject.subject}\`,
           description: \`Your mastery in \${lowestSubject.subject} is currently at \${lowestSubject.score}%. Spend some time reviewing it to boost your score.\`,
           time: '30 min',
           impact: 'High Impact',
           icon: <Target className="h-10 w-10 text-indigo-500" strokeWidth={1.5} />,
           link: '/quizzes'
         });
       }
    }

    if (analytics.upcomingTasks && analytics.upcomingTasks.length > 0) {
       const nextTask = analytics.upcomingTasks[0];
       recs.push({
          title: \`Upcoming: \${nextTask.title}\`,
          description: \`You have an upcoming task scheduled for today. Completing this will help maintain your study streak.\`,
          time: nextTask.duration || '15 min',
          impact: 'Medium Impact',
          icon: <CalendarDays className="h-10 w-10 text-indigo-500" strokeWidth={1.5} />,
          link: '/planner'
       });
    }

    if (recs.length === 0) {
       recs.push({
          title: 'Start a new Quiz',
          description: "You're all caught up on your tasks! Test your knowledge by taking a new quiz.",
          time: '15 min',
          impact: 'Low Impact',
          icon: <BrainCircuit className="h-10 w-10 text-indigo-500" strokeWidth={1.5} />,
          link: '/quizzes'
       });
       recs.push({
          title: 'Review Recent Documents',
          description: "Read through your recent uploads to solidify your understanding of the material.",
          time: '20 min',
          impact: 'Medium Impact',
          icon: <FileText className="h-10 w-10 text-indigo-500" strokeWidth={1.5} />,
          link: '/documents'
       });
    }

    return recs;
  }, [analytics]);

  const nextRec = () => {
    setCurrentRecIndex((prev) => (prev + 1) % recommendations.length);
  };

  const prevRec = () => {
    setCurrentRecIndex((prev) => (prev - 1 + recommendations.length) % recommendations.length);
  };`;

code = code.replace(oldState, newState);

const oldRecComponent = `        {/* AI Study Recommendation */}
        <div className="lg:col-span-3 rounded-2xl border bg-card p-6 shadow-sm flex flex-col relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <h3 className="font-semibold text-sm">AI Study Recommendation</h3>
          </div>
          <p className="text-xs text-muted-foreground -mt-4 mb-4">Based on your recent activity</p>

          <div className="flex items-center gap-4">
             <button className="h-8 w-8 rounded-full border bg-background hover:bg-muted flex items-center justify-center shrink-0 shadow-sm z-10 transition-colors">
               <ChevronLeft className="h-4 w-4" />
             </button>
             
             <div className="flex-1 bg-muted/40 rounded-xl p-5 border border-border/50 flex items-center gap-6 relative overflow-hidden">
                <div className="flex flex-col gap-2 flex-1 z-10">
                  <h4 className="font-bold text-base">Review CSS Box Model</h4>
                  <p className="text-sm text-muted-foreground mb-2 max-w-[80%]">
                    You're slightly behind on this topic. Spend 30 minutes today to strengthen your understanding.
                  </p>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> 30 min
                    </div>
                    <div className="flex items-center gap-1 text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                      <Zap className="h-3 w-3" /> High Impact
                    </div>
                  </div>
                </div>
                
                <div className="hidden sm:flex h-20 w-20 rounded-2xl bg-indigo-500/10 items-center justify-center border border-indigo-500/20 shrink-0 z-10">
                   <BrainCircuit className="h-10 w-10 text-indigo-500" strokeWidth={1.5} />
                </div>
             </div>
             <button className="h-8 w-8 rounded-full border bg-background hover:bg-muted flex items-center justify-center shrink-0 shadow-sm z-10 transition-colors">
               <ChevronRight className="h-4 w-4" />
             </button>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-4">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          </div>
        </div>`;

const newRecComponent = `        {/* AI Study Recommendation */}
        <div className="lg:col-span-3 rounded-2xl border bg-card p-6 shadow-sm flex flex-col relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <h3 className="font-semibold text-sm">AI Study Recommendation</h3>
          </div>
          <p className="text-xs text-muted-foreground -mt-4 mb-4">Based on your recent activity</p>

          <div className="flex items-center gap-4">
             <button 
               onClick={prevRec}
               disabled={recommendations.length <= 1}
               className="h-8 w-8 rounded-full border bg-background hover:bg-muted flex items-center justify-center shrink-0 shadow-sm z-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
               <ChevronLeft className="h-4 w-4" />
             </button>
             
             <div 
               onClick={() => navigate(recommendations[currentRecIndex].link)}
               className="flex-1 bg-muted/40 rounded-xl p-5 border border-border/50 flex items-center gap-6 relative overflow-hidden cursor-pointer hover:bg-muted/60 transition-colors">
                <div className="flex flex-col gap-2 flex-1 z-10">
                  <h4 className="font-bold text-base">{recommendations[currentRecIndex].title}</h4>
                  <p className="text-sm text-muted-foreground mb-2 max-w-[100%] sm:max-w-[80%]">
                    {recommendations[currentRecIndex].description}
                  </p>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {recommendations[currentRecIndex].time}
                    </div>
                    <div className="flex items-center gap-1 text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                      <Zap className="h-3 w-3" /> {recommendations[currentRecIndex].impact}
                    </div>
                  </div>
                </div>
                
                <div className="hidden sm:flex h-20 w-20 rounded-2xl bg-indigo-500/10 items-center justify-center border border-indigo-500/20 shrink-0 z-10">
                   {recommendations[currentRecIndex].icon}
                </div>
             </div>
             <button 
               onClick={nextRec}
               disabled={recommendations.length <= 1}
               className="h-8 w-8 rounded-full border bg-background hover:bg-muted flex items-center justify-center shrink-0 shadow-sm z-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
               <ChevronRight className="h-4 w-4" />
             </button>
          </div>
          {recommendations.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {recommendations.map((_, idx) => (
                <div 
                  key={idx}
                  onClick={() => setCurrentRecIndex(idx)}
                  className={\`w-1.5 h-1.5 rounded-full cursor-pointer transition-colors \${idx === currentRecIndex ? 'bg-foreground' : 'bg-muted-foreground/30'}\`} 
                />
              ))}
            </div>
          )}
        </div>`;

code = code.replace(oldRecComponent, newRecComponent);
fs.writeFileSync('src/components/Dashboard.tsx', code);
