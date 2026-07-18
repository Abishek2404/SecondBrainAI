import sys
import re

with open("src/components/Dashboard.tsx", "r") as f:
    content = f.read()

target = """         {/* Upcoming Quiz */}
         <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
               <h3 className="font-semibold text-[16px] tracking-tight">Upcoming Quiz</h3>
               <Link to="/quizzes" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View all</Link>
            </div>
            <div className="bg-card border rounded-[20px] p-5 shadow-sm flex flex-col items-center text-center gap-4 group hover:shadow-md transition-all cursor-pointer">
               <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 group-hover:scale-110 transition-transform">
                  <BrainCircuit className="h-7 w-7 text-indigo-600" />
               </div>
               <div className="flex flex-col">
                  <h4 className="font-bold text-base mb-1">JavaScript Basics Quiz</h4>
                  <p className="text-xs text-muted-foreground mb-3">20 Questions • 15 min</p>
                  <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-foreground bg-muted rounded-full px-3 py-1">
                     <CalendarDays className="h-3 w-3" /> Tomorrow, 10:00 AM
                  </div>
               </div>
               <Button className="w-full rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 mt-2 font-semibold">
                  Start Quiz <ArrowRight className="h-4 w-4 ml-1.5" />
               </Button>
            </div>
         </div>"""

replacement = """         {/* Daily Quiz */}
         <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
               <h3 className="font-semibold text-[16px] tracking-tight">Daily Refresher</h3>
               <Link to="/quizzes" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View all</Link>
            </div>
            
            {loadingDailyQuiz ? (
               <div className="bg-card border rounded-[20px] p-5 shadow-sm flex flex-col items-center text-center gap-4 h-full min-h-[220px] justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="text-sm text-muted-foreground">Preparing your daily quiz...</p>
               </div>
            ) : dailyQuiz ? (
               <div className="bg-card border rounded-[20px] p-5 shadow-sm flex flex-col items-center text-center gap-4 group hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(`/quizzes/${dailyQuiz._id}`)}>
                  <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 group-hover:scale-110 transition-transform">
                     <BrainCircuit className="h-7 w-7 text-indigo-600" />
                  </div>
                  <div className="flex flex-col">
                     <h4 className="font-bold text-base mb-1 truncate px-2">{dailyQuiz.title}</h4>
                     <p className="text-xs text-muted-foreground mb-3">{dailyQuiz.questions?.length || 0} Questions • ~5 min</p>
                     <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-foreground bg-muted rounded-full px-3 py-1">
                        <CalendarDays className="h-3 w-3" /> Today
                     </div>
                  </div>
                  <Button className="w-full rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 mt-2 font-semibold">
                     Start Quiz <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
               </div>
            ) : (
               <div className="bg-card border rounded-[20px] p-5 shadow-sm flex flex-col items-center text-center gap-4 h-full min-h-[220px] justify-center">
                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                     <BrainCircuit className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <div className="flex flex-col">
                     <h4 className="font-bold text-base mb-1">No Daily Quiz</h4>
                     <p className="text-xs text-muted-foreground">Upload documents to get daily quizzes.</p>
                  </div>
                  <Button variant="outline" className="w-full rounded-xl font-semibold" onClick={() => navigate('/documents')}>
                     Upload Documents
                  </Button>
               </div>
            )}
         </div>"""

content = content.replace(target, replacement)

with open("src/components/Dashboard.tsx", "w") as f:
    f.write(content)
