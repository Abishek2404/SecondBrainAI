const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const oldHeatmap = `                {/* Heatmap Dummy */}
                <TooltipProvider>
                  <div className="flex flex-col justify-end">
                     <div className="flex text-[10px] text-muted-foreground justify-between mb-2 px-1">
                       <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                     </div>
                     <div className="grid grid-cols-7 gap-1">
                       {[
                         { day: 'Mon', hours: 1, opacity: 'bg-emerald-500/20' },
                         { day: 'Tue', hours: 2, opacity: 'bg-emerald-500/40' },
                         { day: 'Wed', hours: 0, opacity: 'bg-emerald-500/10' },
                         { day: 'Thu', hours: 3, opacity: 'bg-emerald-500/60' },
                         { day: 'Fri', hours: 1, opacity: 'bg-emerald-500/20' },
                         { day: 'Sat', hours: 5, opacity: 'bg-emerald-500' },
                         { day: 'Sun', hours: 0, opacity: 'bg-emerald-500/10' },
                         { day: 'Mon', hours: 3, opacity: 'bg-emerald-500/60' },
                         { day: 'Tue', hours: 1, opacity: 'bg-emerald-500/20' },
                         { day: 'Wed', hours: 4, opacity: 'bg-emerald-500/80' },
                         { day: 'Thu', hours: 2, opacity: 'bg-emerald-500/40' },
                         { day: 'Fri', hours: 0, opacity: 'bg-emerald-500/10' },
                         { day: 'Sat', hours: 5, opacity: 'bg-emerald-500' },
                         { day: 'Sun', hours: 1, opacity: 'bg-emerald-500/20' },
                       ].map((cell, i) => (
                         <Tooltip key={i}>
                           <TooltipTrigger render={<div className={\`aspect-square \${cell.opacity} rounded-sm transition-transform hover:scale-110 cursor-pointer\`} />} />
                           <TooltipContent>
                             <p>{cell.hours} {cell.hours === 1 ? 'hour' : 'hours'} studied on {cell.day}</p>
                           </TooltipContent>
                         </Tooltip>
                       ))}
                     </div>
                     <div className="flex items-center justify-between mt-2 text-[9px] text-muted-foreground">
                       <span>Less</span>
                       <div className="flex gap-0.5">
                         <div className="w-2 h-2 bg-emerald-500/10 rounded-[1px]" />
                         <div className="w-2 h-2 bg-emerald-500/40 rounded-[1px]" />
                         <div className="w-2 h-2 bg-emerald-500/60 rounded-[1px]" />
                         <div className="w-2 h-2 bg-emerald-500/80 rounded-[1px]" />
                         <div className="w-2 h-2 bg-emerald-500 rounded-[1px]" />
                       </div>
                       <span>More</span>
                     </div>
                  </div>
                </TooltipProvider>`;

const newHeatmap = `                {/* This Week's Progress (GitHub Style) */}
                <TooltipProvider>
                  <div className="flex flex-col justify-end">
                     <div className="grid grid-cols-7 gap-2">
                       {((analytics?.studyDistribution && analytics.studyDistribution.length === 7) 
                         ? analytics.studyDistribution 
                         : [
                           { day: 'Mon', hours: 1 },
                           { day: 'Tue', hours: 2 },
                           { day: 'Wed', hours: 0 },
                           { day: 'Thu', hours: 3 },
                           { day: 'Fri', hours: 1 },
                           { day: 'Sat', hours: 5 },
                           { day: 'Sun', hours: 0 },
                         ]).map((cell: any, i: number) => {
                           let opacityClass = 'bg-emerald-500/10';
                           if (cell.hours > 0 && cell.hours < 1) opacityClass = 'bg-emerald-500/20';
                           else if (cell.hours >= 1 && cell.hours < 2) opacityClass = 'bg-emerald-500/40';
                           else if (cell.hours >= 2 && cell.hours < 4) opacityClass = 'bg-emerald-500/60';
                           else if (cell.hours >= 4 && cell.hours < 6) opacityClass = 'bg-emerald-500/80';
                           else if (cell.hours >= 6) opacityClass = 'bg-emerald-500';
                           
                           const isToday = i === 6;

                           return (
                             <div key={i} className="flex flex-col items-center gap-2">
                               <Tooltip>
                                 <TooltipTrigger render={<div className={\`w-10 h-10 \${opacityClass} rounded-xl transition-transform hover:scale-110 cursor-pointer shadow-sm\`} />} />
                                 <TooltipContent>
                                   <p>{cell.hours} {cell.hours === 1 ? 'hour' : 'hours'} studied on {cell.day}</p>
                                 </TooltipContent>
                               </Tooltip>
                               {isToday && (
                                 <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-blue-600 mt-1"></div>
                               )}
                             </div>
                           );
                       })}
                     </div>
                  </div>
                </TooltipProvider>`;

code = code.replace(oldHeatmap, newHeatmap);
fs.writeFileSync('src/components/Dashboard.tsx', code);
