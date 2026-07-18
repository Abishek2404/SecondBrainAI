const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const quickActions = `          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-5 py-2">
            <Zap className="h-4 w-4" />
            Quick Actions
            <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
          </button>`;

code = code.replace(quickActions, '');

const weeklyStudyGoal = `        {/* Weekly Study Goal */}
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
           <div className="flex flex-col justify-between w-full">
             <div className="flex flex-row items-center justify-between mb-4 sm:mb-8">
               <h3 className="font-semibold text-sm">Weekly Study Goal</h3>
               <Target className="h-4 w-4 text-emerald-500" />
             </div>
             
             <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                {/* Progress Ring (Recharts) */}
                <div className="relative h-32 w-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: 24.6, fill: '#10b981' },
                          { name: 'Remaining', value: Math.max(0, 30 - 24.6), fill: 'hsl(var(--muted))' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={55}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={10}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-2xl font-bold tracking-tighter">82%</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full text-center sm:text-left">
                  <h4 className="font-bold text-lg">Great progress!</h4>
                  <p className="text-sm text-muted-foreground mb-2">24.6 of 30 hours completed</p>
                  <Link to="/planner" className="inline-flex items-center justify-center sm:justify-start gap-2 whitespace-nowrap rounded-lg text-sm font-medium bg-foreground text-background hover:bg-foreground/90 h-10 px-4 w-full sm:w-auto transition-all hover:gap-3">
                    Continue Learning <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
             </div>
           </div>
        </div>`;

code = code.replace(weeklyStudyGoal, '');

code = code.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-5 gap-4">',
  '<div className="grid grid-cols-1 gap-4">'
);
code = code.replace(
  '<div className="lg:col-span-3 rounded-2xl border bg-card p-6 shadow-sm flex flex-col relative overflow-hidden group">',
  '<div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col relative overflow-hidden group">'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Done");
