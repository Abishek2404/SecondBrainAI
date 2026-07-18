const fs = require('fs');

let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const targetStr = `                   {/* Goal */}
                   <div className="flex items-center gap-3 bg-white dark:bg-card border shadow-sm rounded-2xl p-3 pr-6 hover:-translate-y-1 transition-transform cursor-pointer">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                          <Target className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div className="flex flex-col">
                         <span className="font-bold text-lg leading-none mb-1">{goalProgressPct}%</span>
                         <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Today's Goal</span>
                      </div>
                   </div>`;

const dialogCode = `                   {/* Goal with Dialog */}
                   <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                     <DialogTrigger asChild>
                       <div className="flex items-center gap-3 bg-white dark:bg-card border shadow-sm rounded-2xl p-3 pr-6 hover:-translate-y-1 transition-transform cursor-pointer">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                              <Target className="h-5 w-5 text-indigo-500" />
                          </div>
                          <div className="flex flex-col">
                             <span className="font-bold text-lg leading-none mb-1">{goalProgressPct}%</span>
                             <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Today's Goal</span>
                          </div>
                       </div>
                     </DialogTrigger>
                     <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Set Daily Goal</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="target-tasks" className="text-right text-sm font-medium">Tasks</label>
                            <input
                              id="target-tasks"
                              type="number"
                              value={dailyTasksGoal}
                              onChange={(e) => setDailyTasksGoal(Number(e.target.value))}
                              className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="target-hours" className="text-right text-sm font-medium">Hours</label>
                            <input
                              id="target-hours"
                              type="number"
                              value={dailyHoursGoal}
                              onChange={(e) => setDailyHoursGoal(Number(e.target.value))}
                              className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button onClick={handleSaveGoal} disabled={isGoalSaving}>
                            {isGoalSaving ? "Saving..." : "Save changes"}
                          </Button>
                        </div>
                     </DialogContent>
                   </Dialog>`;

code = code.replace(targetStr, dialogCode);

const imports = `import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";`;
code = code.replace(`import { Button } from "./ui/button";`, `import { Button } from "./ui/button";\n${imports}`);

const handleSaveGoalCode = `
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isGoalSaving, setIsGoalSaving] = useState(false);

  const handleSaveGoal = async () => {
    setIsGoalSaving(true);
    try {
      const res = await apiFetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyTasksGoal, dailyHoursGoal }),
      });
      if (res.ok) {
        const json = await res.json();
        updateUser(json.data);
        setIsGoalDialogOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGoalSaving(false);
    }
  };
`;

code = code.replace(
    `const [dailyHoursGoal, setDailyHoursGoal] = useState<number>(user?.dailyHoursGoal || 2);`,
    `const [dailyHoursGoal, setDailyHoursGoal] = useState<number>(user?.dailyHoursGoal || 2);\n${handleSaveGoalCode}`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Added dialog back");
