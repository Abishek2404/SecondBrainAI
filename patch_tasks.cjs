const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const oldTasks = `          <div className="rounded-2xl border bg-card p-2 shadow-sm flex flex-col gap-1">
            {[
              { title: "Complete HTML Practice", time: "Today, 6:00 PM", tag: "Practice", color: "text-purple-500", bg: "bg-purple-500/10", tagCol: "text-purple-600 bg-purple-500/10", icon: CalendarDays },
              { title: "Review CSS Flexbox", time: "Today, 7:00 PM", tag: "Reading", color: "text-blue-500", bg: "bg-blue-500/10", tagCol: "text-blue-600 bg-blue-500/10", icon: BookOpen },
              { title: "JavaScript Quiz", time: "Tomorrow, 10:00 AM", tag: "Quiz", color: "text-emerald-500", bg: "bg-emerald-500/10", tagCol: "text-emerald-600 bg-emerald-500/10", icon: BrainCircuit },
              { title: "Flashcards Review", time: "Tomorrow, 4:00 PM", tag: "Review", color: "text-amber-500", bg: "bg-amber-500/10", tagCol: "text-amber-600 bg-amber-500/10", icon: Sparkles }
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={\`w-8 h-8 rounded-full \${task.bg} \${task.color} flex items-center justify-center shrink-0\`}>
                    <task.icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{task.title}</span>
                    <span className="text-xs text-muted-foreground">{task.time}</span>
                  </div>
                </div>
                <div className={\`px-2 py-0.5 rounded-md text-[10px] font-semibold \${task.tagCol}\`}>
                  {task.tag}
                </div>
              </div>
            ))}
          </div>`;

const newTasks = `          <div className="rounded-2xl border bg-card p-2 shadow-sm flex flex-col gap-1">
            {((analytics?.upcomingTasks && analytics.upcomingTasks.length > 0) ? analytics.upcomingTasks : [
              { title: "Complete HTML Practice", date: "Today", duration: "6:00 PM", type: "Practice" },
              { title: "Review CSS Flexbox", date: "Today", duration: "7:00 PM", type: "Reading" },
              { title: "JavaScript Quiz", date: "Tomorrow", duration: "10:00 AM", type: "Quiz" },
              { title: "Flashcards Review", date: "Tomorrow", duration: "4:00 PM", type: "Review" }
            ]).slice(0, 5).map((task: any, i: number) => {
              
              let Icon = CalendarDays;
              let colors = { color: "text-indigo-500", bg: "bg-indigo-500/10", tagCol: "text-indigo-600 bg-indigo-500/10" };
              
              switch (task.type?.toLowerCase()) {
                case 'reading': 
                  Icon = BookOpen;
                  colors = { color: "text-blue-500", bg: "bg-blue-500/10", tagCol: "text-blue-600 bg-blue-500/10" };
                  break;
                case 'quiz':
                  Icon = BrainCircuit;
                  colors = { color: "text-emerald-500", bg: "bg-emerald-500/10", tagCol: "text-emerald-600 bg-emerald-500/10" };
                  break;
                case 'flashcards':
                case 'review':
                  Icon = Sparkles;
                  colors = { color: "text-amber-500", bg: "bg-amber-500/10", tagCol: "text-amber-600 bg-amber-500/10" };
                  break;
                case 'practice':
                  Icon = CalendarDays;
                  colors = { color: "text-purple-500", bg: "bg-purple-500/10", tagCol: "text-purple-600 bg-purple-500/10" };
                  break;
              }

              return (
                <div key={i} onClick={() => navigate('/planner')} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={\`w-8 h-8 rounded-full \${colors.bg} \${colors.color} flex items-center justify-center shrink-0\`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{task.title}</span>
                      <span className="text-xs text-muted-foreground">{task.date === new Date().toISOString().split('T')[0] ? 'Today' : task.date} {task.duration ? \`• \${task.duration}\` : ''}</span>
                    </div>
                  </div>
                  <div className={\`px-2 py-0.5 rounded-md text-[10px] font-semibold \${colors.tagCol}\`}>
                    {task.type}
                  </div>
                </div>
              );
            })}
          </div>`;

code = code.replace(oldTasks, newTasks);
fs.writeFileSync('src/components/Dashboard.tsx', code);
