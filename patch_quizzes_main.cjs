const fs = require('fs');
let file = fs.readFileSync('src/components/Quizzes.tsx', 'utf-8');

const returnStartMarker = '  return (\n    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 min-h-screen">';
const startIdx = file.indexOf(returnStartMarker);

// Find the index of <ConfirmDialog
const dialogsIdx = file.indexOf('      <ConfirmDialog', startIdx);
if (dialogsIdx === -1) {
   console.log("Dialogs not found");
   process.exit(1);
}

const oldStart = file.substring(0, startIdx);
const oldEnd = file.substring(dialogsIdx);

// Build new ui
const newReturn = `  // Calculate mock stats
  const totalQuizzesTaken = quizzes.filter(q => q.attemptsCount > 0).length;
  const avgScore = quizzes.filter(q => q.attemptsCount > 0).reduce((acc, q) => acc + (q.avgScore / q.questionsCount), 0) / (totalQuizzesTaken || 1) * 100;
  const bestScore = quizzes.filter(q => q.attemptsCount > 0).sort((a, b) => (b.avgScore / b.questionsCount) - (a.avgScore / a.questionsCount))[0];
  const totalQuestions = quizzes.reduce((acc, q) => acc + q.questionsCount, 0);

  return (
    <div className="flex flex-col xl:flex-row gap-8 p-6 md:p-8 max-w-[1600px] mx-auto w-full min-h-screen">
      {/* Left Column (Main Content) */}
      <div className="flex-1 flex flex-col gap-6 md:gap-8 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1 text-foreground">Quizzes</h1>
              <p className="text-muted-foreground text-sm font-medium">Test your knowledge and track your learning progress.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button className="w-full sm:w-auto gap-2 rounded-xl h-11 px-6 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium" onClick={() => setIsGenerateOpen(true)}>
              <Brain className="h-4 w-4" />
              Generate Quiz
            </Button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-2 p-5 rounded-2xl border bg-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Quizzes Taken</p>
                <h3 className="text-2xl font-bold text-foreground mb-1">{totalQuizzesTaken || 24}</h3>
                <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <span className="text-[10px]">▲</span> 6 this week
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-5 rounded-2xl border bg-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Target className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Average Score</p>
                <h3 className="text-2xl font-bold text-foreground mb-1">{Math.round(avgScore) || 87}%</h3>
                <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <span className="text-[10px]">▲</span> 9% this week
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-5 rounded-2xl border bg-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Best Score</p>
                <h3 className="text-2xl font-bold text-foreground mb-1">{bestScore ? Math.round((bestScore.avgScore / bestScore.questionsCount) * 100) : 100}%</h3>
                <p className="text-xs font-medium text-muted-foreground truncate">{bestScore ? bestScore.title : 'HTML_CSS Quiz'}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-5 rounded-2xl border bg-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <ClipboardList className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total Questions</p>
                <h3 className="text-2xl font-bold text-foreground mb-1">{totalQuestions || 482}</h3>
                <p className="text-xs font-medium text-muted-foreground">Across all quizzes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters / Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 mt-2">
          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {['All Quizzes', 'Completed', 'In Progress', 'Not Attempted'].map((tab) => {
              const isActive = activeTab === tab;
              
              let count = 0;
              if (tab === 'All Quizzes') count = quizzes.length;
              else if (tab === 'Completed') count = quizzes.filter(q => q.attemptsCount > 0).length;
              else if (tab === 'In Progress') count = 2; // mock
              else if (tab === 'Not Attempted') count = quizzes.filter(q => !q.attemptsCount).length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={\`rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-colors \${isActive ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-muted text-muted-foreground bg-transparent'}\`}
                >
                  {tab} ({count})
                </button>
              )
            })}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-auto h-10 rounded-xl bg-transparent border-none font-semibold text-foreground focus:ring-0">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Subjects</SelectItem>
                {uniqueSubjects.map(sub => (
                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="rounded-xl shrink-0 h-10 w-10 text-muted-foreground border-border bg-card shadow-sm"><Filter className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Quiz List */}
        <div className="flex flex-col gap-3 pb-12">
          {loading ? (
             <div className="p-12 text-center text-muted-foreground">Loading...</div>
          ) : filteredQuizzes.length === 0 ? (
             <div className="p-12 text-center text-muted-foreground">No quizzes found.</div>
          ) : (
            filteredQuizzes.map((quiz) => {
              const score = quiz.attemptsCount > 0 ? Math.round((quiz.avgScore / quiz.questionsCount) * 100) : 0;
              let scoreColor = "text-muted-foreground border-border";
              if (quiz.attemptsCount > 0) {
                 if (score >= 80) scoreColor = "text-emerald-500 border-emerald-500/20";
                 else if (score >= 60) scoreColor = "text-amber-500 border-amber-500/20";
                 else scoreColor = "text-red-500 border-red-500/20";
              }

              return (
                <div key={quiz._id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border bg-card hover:shadow-md transition-all cursor-pointer group" onClick={() => startQuiz(quiz)}>
                  <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-6 w-6 text-indigo-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-base text-foreground truncate group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
                      {quiz.subject && <Badge variant="secondary" className="text-[10px] uppercase font-bold text-muted-foreground bg-muted hover:bg-muted tracking-wider rounded-md px-1.5 py-0.5">{quiz.subject}</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
                      <span>{quiz.questionsCount} Questions</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>{quiz.questionsCount * 1.5} min</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>Created on {new Date(quiz.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="flex items-center gap-4">
                      <div className="relative w-10 h-10 flex flex-col items-center justify-center shrink-0">
                         {quiz.attemptsCount > 0 ? (
                           <>
                             <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                               <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/30" />
                               <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - score/100)} className={score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-blue-500"} strokeLinecap="round" />
                             </svg>
                             <div className="absolute inset-0 flex items-center justify-center">
                               <span className="text-[10px] font-bold text-foreground">_</span>
                             </div>
                           </>
                         ) : (
                           <>
                             <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                               <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
                             </svg>
                             <div className="absolute inset-0 flex items-center justify-center">
                               <span className="text-[10px] font-bold text-muted-foreground/40">-</span>
                             </div>
                           </>
                         )}
                      </div>
                      <div className="flex flex-col w-12">
                        <span className="text-sm font-bold text-foreground leading-none mb-0.5">{quiz.attemptsCount > 0 ? \`\${score}%\` : '0%'}</span>
                        <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">Score</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                       <Button 
                         variant={quiz.attemptsCount > 0 ? "outline" : "default"}
                         className={\`rounded-full px-5 h-9 text-xs font-bold \${quiz.attemptsCount === 0 ? 'bg-black hover:bg-black/90 text-white' : 'text-indigo-600 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50'}\`}
                         onClick={(e) => { e.stopPropagation(); startQuiz(quiz); }}
                       >
                         {quiz.attemptsCount > 0 ? (score >= 100 ? "Completed" : "Retake Quiz") : "Start Quiz"}
                       </Button>
                       <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <button className="h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors" onClick={e => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        } />
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem className="text-red-500 focus:text-red-500 gap-2 rounded-lg" onClick={(e) => { e.stopPropagation(); setItemToDelete(quiz._id); }}>
                            <Trash className="h-4 w-4" /> Delete Quiz
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          <div className="flex justify-between items-center mt-4">
             <span className="text-sm font-semibold text-muted-foreground">Showing 1 to {Math.min(8, filteredQuizzes.length)} of {quizzes.length} quizzes</span>
             <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-border/50 text-muted-foreground hover:bg-muted"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="default" className="h-8 w-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-0 font-bold shadow-sm">1</Button>
                <Button variant="ghost" className="h-8 w-8 rounded-lg px-0 font-bold text-muted-foreground">2</Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-border/50 text-muted-foreground hover:bg-muted"><ChevronRight className="h-4 w-4" /></Button>
             </div>
          </div>
        </div>
      </div>

      {/* Right Column (Sidebar) */}
      <div className="w-full xl:w-[320px] 2xl:w-[340px] shrink-0 flex flex-col gap-6">
        
        {/* Your Performance Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-foreground">Your Performance</h3>
             <Select defaultValue="this-week">
               <SelectTrigger className="w-auto h-8 rounded-lg bg-muted/50 border-transparent hover:bg-muted text-[11px] font-bold px-3 focus:ring-0">
                 <SelectValue placeholder="This Week" />
               </SelectTrigger>
               <SelectContent className="rounded-xl">
                 <SelectItem value="this-week">This Week</SelectItem>
                 <SelectItem value="last-week">Last Week</SelectItem>
                 <SelectItem value="this-month">This Month</SelectItem>
               </SelectContent>
             </Select>
           </div>
           
           <div className="flex items-center gap-6 mb-6">
             <div className="relative w-[100px] h-[100px] shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                   <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/30" />
                   {/* Correct - Green */}
                   <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="263.89" strokeDashoffset={263.89 * (1 - 0.87)} className="text-emerald-500" />
                   {/* Incorrect - Red (starts after green) */}
                   <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="263.89" strokeDashoffset={263.89 * (1 - 0.13)} className="text-red-500" style={{ transformOrigin: 'center', transform: \`rotate(\${0.87 * 360}deg)\` }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-2xl font-bold text-foreground leading-none">87%</span>
                   <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5">Average Score</span>
                </div>
             </div>
             
             <div className="flex flex-col gap-2.5 flex-1">
                <div className="flex items-center justify-between text-xs">
                   <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                     <span className="font-bold text-foreground">Correct</span>
                   </div>
                   <div className="flex items-center gap-1 font-bold">
                     <span className="text-foreground">186</span>
                     <span className="text-muted-foreground/60">(87%)</span>
                   </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                   <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                     <span className="font-bold text-foreground">Incorrect</span>
                   </div>
                   <div className="flex items-center gap-1 font-bold">
                     <span className="text-foreground">28</span>
                     <span className="text-muted-foreground/60">(13%)</span>
                   </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                   <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                     <span className="font-bold text-foreground">Skipped</span>
                   </div>
                   <div className="flex items-center gap-1 font-bold">
                     <span className="text-foreground">12</span>
                     <span className="text-muted-foreground/60">(6%)</span>
                   </div>
                </div>
             </div>
           </div>
           
           <div className="w-full py-2.5 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-bold text-center flex items-center justify-center gap-1">
              <span>↑</span> 9% improvement from last week
           </div>
        </div>

        {/* Subject Performance Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-foreground">Subject Performance</h3>
             <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View all</a>
           </div>
           
           <div className="flex flex-col gap-5">
              {[
                { name: 'HTML', progress: 92, color: 'bg-emerald-500' },
                { name: 'CSS', progress: 88, color: 'bg-emerald-500' },
                { name: 'JavaScript', progress: 75, color: 'bg-blue-500' },
                { name: 'Data Structures', progress: 90, color: 'bg-indigo-600' },
                { name: 'Python', progress: 80, color: 'bg-amber-500' },
              ].map(sub => (
                <div key={sub.name} className="flex flex-col gap-2">
                   <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-foreground">{sub.name}</span>
                      <span className="text-foreground">{sub.progress}%</span>
                   </div>
                   <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={\`h-full rounded-full \${sub.color}\`} style={{ width: \`\${sub.progress}%\` }} />
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-foreground">Recent Activity</h3>
             <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View all</a>
           </div>
           
           <div className="flex flex-col gap-5">
              {[
                { icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />, bg: "bg-emerald-50", title: "Completed CSS Notes Quiz", subtitle: "Score: 92% • 25/27", time: "Today, 10:30 AM" },
                { icon: <Play className="h-4 w-4 text-blue-600 ml-0.5" />, bg: "bg-blue-50", title: "Started JavaScript Basics Quiz", subtitle: "Progress: 8/15", time: "Today, 09:15 AM" },
                { icon: <Trophy className="h-4 w-4 text-amber-500" />, bg: "bg-amber-50", title: "Achieved 100% in HTML Quiz", subtitle: "Perfect score!", time: "Yesterday, 08:45 PM" },
                { icon: <Flame className="h-4 w-4 text-indigo-500" />, bg: "bg-indigo-50", title: "New best score in Data Structures Quiz", subtitle: "Score: 90%", time: "Yesterday, 07:20 PM" },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4">
                   <div className={\`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 \${activity.bg}\`}>
                     {activity.icon}
                   </div>
                   <div className="flex flex-col min-w-0 flex-1">
                      <h4 className="text-[13px] font-bold text-foreground truncate mb-0.5">{activity.title}</h4>
                      <p className="text-[11px] font-semibold text-muted-foreground">{activity.subtitle}</p>
                   </div>
                   <div className="text-[10px] font-bold text-muted-foreground text-right shrink-0 mt-1">
                      {activity.time}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Daily Goal Card */}
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
        </div>
      </div>
    </div>
`;

const finalFile = oldStart + newReturn + oldEnd;
fs.writeFileSync('src/components/Quizzes.tsx', finalFile);
console.log("Patched the complete layout successfully.");
