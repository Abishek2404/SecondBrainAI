import sys

with open("src/components/Dashboard.tsx", "r") as f:
    content = f.read()

# Fix calculations
calc_target = """  const notesPct = totalItemsCount > 0 ? Math.round((notesCount / totalItemsCount) * 100) : 25;
  const quizzesPct = totalItemsCount > 0 ? Math.round((quizzesCount / totalItemsCount) * 100) : 25;
  const flashcardsPct = totalItemsCount > 0 ? Math.round((flashcardsCount / totalItemsCount) * 100) : 25;
  const documentsPct = totalItemsCount > 0 ? Math.round((documentsCount / totalItemsCount) * 100) : 25;

  const notesMinutes = notesCount * 15;
  const quizzesMinutes = quizzesCount * 15;
  const flashcardsMinutes = flashcardsCount * 2;
  const documentsMinutes = documentsCount * 30;
  const totalStudyMinutes = notesMinutes + quizzesMinutes + flashcardsMinutes + documentsMinutes;

  const displayHours = Math.floor(totalStudyMinutes / 60);
  const displayMins = totalStudyMinutes % 60;

  const formatMins = (mins: number) => {
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return hrs > 0 ? `${hrs}h ${m}m` : `${m}m`;
  };"""

calc_replacement = """  const hasData = totalItemsCount > 0;
  const chartData = hasData ? [
    { name: 'Notes', value: notesCount, color: '#6366f1' },
    { name: 'Quizzes', value: quizzesCount, color: '#3b82f6' },
    { name: 'Flashcards', value: flashcardsCount, color: '#cbd5e1' },
    { name: 'Documents', value: documentsCount, color: '#d946ef' },
  ] : [
    { name: 'Empty', value: 1, color: '#e2e8f0' }
  ];"""

content = content.replace(calc_target, calc_replacement)

# Fix chart rendering
chart_target = """                      <PieChart>
                         <Pie
                           data={[
                             { name: 'Notes', value: notesPct, color: '#6366f1' },
                             { name: 'Quizzes', value: quizzesPct, color: '#3b82f6' },
                             { name: 'Flashcards', value: flashcardsPct, color: '#cbd5e1' },
                             { name: 'Documents', value: documentsPct, color: '#d946ef' },
                           ]}
                           cx="50%" cy="50%"
                           innerRadius={55}
                           outerRadius={75}
                           paddingAngle={2}
                           dataKey="value"
                           stroke="none"
                         >
                           { [
                             { name: 'Notes', value: notesPct, color: '#6366f1' },
                             { name: 'Quizzes', value: quizzesPct, color: '#3b82f6' },
                             { name: 'Flashcards', value: flashcardsPct, color: '#cbd5e1' },
                             { name: 'Documents', value: documentsPct, color: '#d946ef' },
                           ].map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                         </Pie>
                      </PieChart>"""

chart_replacement = """                      <PieChart>
                         <Pie
                           data={chartData}
                           cx="50%" cy="50%"
                           innerRadius={55}
                           outerRadius={75}
                           paddingAngle={hasData ? 2 : 0}
                           dataKey="value"
                           stroke="none"
                         >
                           { chartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                         </Pie>
                      </PieChart>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                       <span className="text-2xl font-bold tracking-tight">{totalItemsCount}</span>
                       <span className="text-[10px] text-muted-foreground font-medium uppercase mt-1">Total Items</span>
                    </div>"""

content = content.replace(chart_target, chart_replacement)

# Fix legend mapping
legend_target = """                    {[
                       { label: 'Notes',  color: 'bg-indigo-500' },
                       { label: 'Quizzes',   color: 'bg-blue-500' },
                       { label: 'Flashcards',  color: 'bg-slate-300' },
                       { label: 'Documents',  color: 'bg-fuchsia-500' },
                    ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                             <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                             <span className="font-medium text-foreground">{item.label}</span>
                          </div>
                        
                       </div>
                    ))}"""

legend_replacement = """                    {[
                       { label: 'Notes', count: notesCount, color: 'bg-indigo-500' },
                       { label: 'Quizzes', count: quizzesCount, color: 'bg-blue-500' },
                       { label: 'Flashcards', count: flashcardsCount, color: 'bg-slate-300' },
                       { label: 'Documents', count: documentsCount, color: 'bg-fuchsia-500' },
                    ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                             <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                             <span className="font-medium text-foreground">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="text-foreground font-medium">{item.count}</span>
                          </div>
                       </div>
                    ))}"""

content = content.replace(legend_target, legend_replacement)

with open("src/components/Dashboard.tsx", "w") as f:
    f.write(content)
