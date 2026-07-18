const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const imports = `import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./ui/tooltip";`;
const newImports = `import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Settings } from "lucide-react";`;

code = code.replace(imports, newImports);

const indicator = `          {/* Daily Goal Progress Indicator */}
          <div className="flex items-center gap-3 bg-card border rounded-full pl-1.5 pr-4 py-1.5 shadow-sm">
            <div className="relative h-8 w-8 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" className="stroke-muted" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" className="stroke-emerald-500" strokeWidth="3" strokeDasharray="94.2" strokeDashoffset="23.55" strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">75%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold leading-none">Daily Goal</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">3/4 Tasks completed</span>
            </div>
          </div>`;

const newIndicator = `          {/* Daily Goal Progress Indicator */}
          <div className="flex items-center gap-3 bg-card border rounded-full pl-1.5 pr-4 py-1.5 shadow-sm">
            <div className="relative h-8 w-8 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" className="stroke-muted" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" className="stroke-emerald-500" strokeWidth="3" strokeDasharray="94.2" strokeDashoffset="23.55" strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">75%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold leading-none">Daily Goal</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">3/4 Tasks completed</span>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full h-10 px-4">
                <Settings className="w-4 h-4 mr-2" />
                Set Daily Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Set Daily Goal</DialogTitle>
                <DialogDescription>
                  Update your daily study target. This helps us personalize your recommendations.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="target-tasks" className="text-right">
                    Tasks
                  </Label>
                  <Input
                    id="target-tasks"
                    type="number"
                    defaultValue="4"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="target-hours" className="text-right">
                    Hours
                  </Label>
                  <Input
                    id="target-hours"
                    type="number"
                    defaultValue="2"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>`;

code = code.replace(indicator, newIndicator);
fs.writeFileSync('src/components/Dashboard.tsx', code);
