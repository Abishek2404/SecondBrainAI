import sys

with open("src/components/Dashboard.tsx", "r") as f:
    content = f.read()

target = """                {/* Study Time */}
                <div className="flex flex-col gap-1.5 border-l-2 border-indigo-500 pl-4">
                   <div className="flex items-center gap-2">
                     <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                       <Clock className="h-3 w-3 text-indigo-600" />
                     </div>
                     <span className="text-xs text-muted-foreground font-medium">Study Time</span>
                   </div>
                   <div className="text-2xl font-bold tracking-tight">
                     {Math.floor(analytics?.totalStudyHours || 24)}h {Math.round(((analytics?.totalStudyHours || 24.6) % 1) * 60)}m
                   </div>
                   <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                     <ArrowRight className="h-3 w-3 -rotate-45" /> 4h 12m vs last week
                   </span>
                </div>
                {/* Tasks Completed */}
                <div className="flex flex-col gap-1.5 border-l-2 border-emerald-500 pl-4">
                   <div className="flex items-center gap-2">
                     <div className="h-6 w-6 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                       <CircleCheck className="h-3 w-3 text-emerald-600" />
                     </div>
                     <span className="text-xs text-muted-foreground font-medium">Tasks Completed</span>
                   </div>
                   <div className="text-2xl font-bold tracking-tight">
                     {analytics?.completedTasks || 84}
                   </div>
                   <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                     <ArrowRight className="h-3 w-3 -rotate-45" /> 17 vs last week
                   </span>
                </div>
                {/* Quiz Accuracy */}
                <div className="flex flex-col gap-1.5 border-l-2 border-pink-500 pl-4">
                   <div className="flex items-center gap-2">
                     <div className="h-6 w-6 rounded-full bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center shrink-0">
                       <TrendingUp className="h-3 w-3 text-pink-600" />
                     </div>
                     <span className="text-xs text-muted-foreground font-medium">Quiz Accuracy</span>
                   </div>
                   <div className="text-2xl font-bold tracking-tight">
                     {analytics?.avgQuizScore || 87}%
                   </div>
                   <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                     <ArrowRight className="h-3 w-3 -rotate-45" /> 9% vs last week
                   </span>
                </div>
                {/* Documents Processed */}
                <div className="flex flex-col gap-1.5 border-l-2 border-blue-500 pl-4">
                   <div className="flex items-center gap-2">
                     <div className="h-6 w-6 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                       <FileText className="h-3 w-3 text-blue-600" />
                     </div>
                     <span className="text-xs text-muted-foreground font-medium">Docs Processed</span>
                   </div>
                   <div className="text-2xl font-bold tracking-tight">
                     {analytics?.totalDocuments || 3}
                   </div>
                   <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                     <ArrowRight className="h-3 w-3 -rotate-45" /> 2 vs last week
                   </span>
                </div>"""

replacement = """                {/* Study Time */}
                <div className="flex flex-col gap-1.5 border-l-2 border-indigo-500 pl-4">
                   <div className="flex items-center gap-2">
                     <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                       <Clock className="h-3 w-3 text-indigo-600" />
                     </div>
                     <span className="text-xs text-muted-foreground font-medium">Study Time</span>
                   </div>
                   <div className="text-2xl font-bold tracking-tight">
                     {Math.floor(analytics?.totalStudyHours || 0)}h {Math.round(((analytics?.totalStudyHours || 0) % 1) * 60)}m
                   </div>
                </div>
                {/* Tasks Completed */}
                <div className="flex flex-col gap-1.5 border-l-2 border-emerald-500 pl-4">
                   <div className="flex items-center gap-2">
                     <div className="h-6 w-6 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                       <CircleCheck className="h-3 w-3 text-emerald-600" />
                     </div>
                     <span className="text-xs text-muted-foreground font-medium">Tasks Completed</span>
                   </div>
                   <div className="text-2xl font-bold tracking-tight">
                     {analytics?.completedTasks || 0}
                   </div>
                </div>
                {/* Quiz Accuracy */}
                <div className="flex flex-col gap-1.5 border-l-2 border-pink-500 pl-4">
                   <div className="flex items-center gap-2">
                     <div className="h-6 w-6 rounded-full bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center shrink-0">
                       <TrendingUp className="h-3 w-3 text-pink-600" />
                     </div>
                     <span className="text-xs text-muted-foreground font-medium">Quiz Accuracy</span>
                   </div>
                   <div className="text-2xl font-bold tracking-tight">
                     {analytics?.avgQuizScore || 0}%
                   </div>
                </div>
                {/* Documents Processed */}
                <div className="flex flex-col gap-1.5 border-l-2 border-blue-500 pl-4">
                   <div className="flex items-center gap-2">
                     <div className="h-6 w-6 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                       <FileText className="h-3 w-3 text-blue-600" />
                     </div>
                     <span className="text-xs text-muted-foreground font-medium">Docs Processed</span>
                   </div>
                   <div className="text-2xl font-bold tracking-tight">
                     {analytics?.totalDocuments || 0}
                   </div>
                </div>"""

content = content.replace(target, replacement)
with open("src/components/Dashboard.tsx", "w") as f:
    f.write(content)
