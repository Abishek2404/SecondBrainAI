import sys

with open("src/components/Dashboard.tsx", "r") as f:
    content = f.read()

target = """         {/* Continue Learning Row (Horizontal View) */}
         <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
               <h3 className="font-semibold text-[16px] tracking-tight">Continue Learning</h3>
               <Link to="/planner" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View all</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {[
                 { title: "HTML & CSS Basics", progress: 78, icon: Code, color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30", bar: "bg-indigo-600" },
                 { title: "JavaScript Fundamentals", progress: 45, icon: PenTool, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", bar: "bg-amber-500" },
                 { title: "React Hooks & State", progress: 12, icon: Database, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", bar: "bg-emerald-500" },
               ].map((course, i) => (
                  <div key={i} className="flex flex-col p-4 rounded-[20px] bg-card border shadow-sm group hover:shadow-md transition-all gap-4 justify-between h-full" onClick={() => navigate('/planner')}>
                     <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                           <div className={`h-10 w-10 shrink-0 rounded-[14px] ${course.bg} flex items-center justify-center`}>
                              <course.icon className={`h-5 w-5 ${course.color}`} />
                           </div>
                           <div className="flex flex-col min-w-0">
                              <h4 className="font-semibold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{course.title}</h4>
                              <span className="text-[11px] text-muted-foreground mt-0.5">Keep pushing!</span>
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center justify-between text-xs">
                           <span className="text-muted-foreground font-medium">Progress</span>
                           <span className="font-bold">{course.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                           <div className={`h-full ${course.bar} rounded-full`} style={{ width: `${course.progress}%` }} />
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>"""

replacement = """         {/* Continue Learning Row (Horizontal View) */}
         {analytics?.upcomingTasks && analytics.upcomingTasks.length > 0 && (
           <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                 <h3 className="font-semibold text-[16px] tracking-tight">Continue Learning</h3>
                 <Link to="/planner" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View all</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {analytics.upcomingTasks.slice(0, 3).map((task: any, i: number) => {
                    let Icon = Sparkles;
                    let color = "text-indigo-600";
                    let bg = "bg-indigo-100 dark:bg-indigo-900/30";
                    
                    if (task.type === 'Flashcards') { Icon = BrainCircuit; color = "text-pink-600"; bg = "bg-pink-100 dark:bg-pink-900/30"; }
                    else if (task.type === 'Reading') { Icon = BookOpen; color = "text-blue-600"; bg = "bg-blue-100 dark:bg-blue-900/30"; }
                    else if (task.type === 'Quiz') { Icon = Target; color = "text-orange-600"; bg = "bg-orange-100 dark:bg-orange-900/30"; }
                    else if (task.type === 'Notes') { Icon = FileText; color = "text-emerald-600"; bg = "bg-emerald-100 dark:bg-emerald-900/30"; }

                    return (
                    <div key={i} className="flex flex-col p-4 rounded-[20px] bg-card border shadow-sm group hover:shadow-md transition-all gap-4 justify-between h-full cursor-pointer" onClick={() => navigate('/planner')}>
                       <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                             <div className={`h-10 w-10 shrink-0 rounded-[14px] ${bg} flex items-center justify-center`}>
                                <Icon className={`h-5 w-5 ${color}`} />
                             </div>
                             <div className="flex flex-col min-w-0">
                                <h4 className="font-semibold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{task.title}</h4>
                                <span className="text-[11px] text-muted-foreground mt-0.5">{task.type}</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex flex-col gap-2 mt-2">
                          <div className="flex items-center justify-between text-xs">
                             <span className="text-muted-foreground font-medium flex items-center gap-1"><Clock className="h-3 w-3"/> {task.duration}</span>
                             <span className="font-bold text-indigo-600 dark:text-indigo-400">{task.date === new Date().toISOString().split('T')[0] ? 'Today' : task.date}</span>
                          </div>
                       </div>
                    </div>
                 )})}
              </div>
           </div>
         )}"""

content = content.replace(target, replacement)
with open("src/components/Dashboard.tsx", "w") as f:
    f.write(content)
