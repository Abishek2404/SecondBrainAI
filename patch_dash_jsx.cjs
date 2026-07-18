const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const oldJSX = `          <div className="flex items-center gap-4">
             <button className="h-8 w-8 rounded-full border bg-background hover:bg-muted flex items-center justify-center shrink-0 shadow-sm z-10 transition-colors">
               <ChevronLeft className="h-4 w-4" />
             </button>
             
             <div className="flex-1 bg-muted/40 rounded-xl p-5 border border-border/50 flex items-center gap-6 relative overflow-hidden">
                <div className="flex flex-col gap-2 flex-1 z-10">
                  <h4 className="font-bold text-base">Review CSS Box Model</h4>
                  <p className="text-sm text-muted-foreground mb-2 max-w-[80%]">
                    You're slightly behind on this topic. Spend 30 minutes today to strengthen your understanding.
                  </p>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> 30 min
                    </div>
                    <div className="flex items-center gap-1 text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                      <Zap className="h-3 w-3" /> High Impact
                    </div>
                  </div>
                </div>
                
                <div className="hidden sm:flex h-20 w-20 rounded-2xl bg-indigo-500/10 items-center justify-center border border-indigo-500/20 shrink-0 z-10">
                   <BrainCircuit className="h-10 w-10 text-indigo-500" strokeWidth={1.5} />
                </div>
             </div>
             <button className="h-8 w-8 rounded-full border bg-background hover:bg-muted flex items-center justify-center shrink-0 shadow-sm z-10 transition-colors">
               <ChevronRight className="h-4 w-4" />
             </button>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-4">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          </div>`;

const newJSX = `          <div className="flex items-center gap-4">
             <button 
               onClick={prevRec}
               disabled={recommendations.length <= 1}
               className="h-8 w-8 rounded-full border bg-background hover:bg-muted flex items-center justify-center shrink-0 shadow-sm z-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
               <ChevronLeft className="h-4 w-4" />
             </button>
             
             <div 
               onClick={() => navigate(recommendations[safeIndex]?.link || '/documents')}
               className="flex-1 bg-muted/40 rounded-xl p-5 border border-border/50 flex items-center gap-6 relative overflow-hidden cursor-pointer hover:bg-muted/60 transition-colors">
                <div className="flex flex-col gap-2 flex-1 z-10">
                  <h4 className="font-bold text-base">{recommendations[safeIndex]?.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2 max-w-[100%] sm:max-w-[80%]">
                    {recommendations[safeIndex]?.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs font-medium">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {recommendations[safeIndex]?.time}
                    </div>
                    <div className="flex items-center gap-1 text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                      <Zap className="h-3 w-3" /> {recommendations[safeIndex]?.impact}
                    </div>
                  </div>
                </div>
                
                <div className="hidden sm:flex h-20 w-20 rounded-2xl bg-indigo-500/10 items-center justify-center border border-indigo-500/20 shrink-0 z-10">
                   {recommendations[safeIndex]?.icon}
                </div>
             </div>
             <button 
               onClick={nextRec}
               disabled={recommendations.length <= 1}
               className="h-8 w-8 rounded-full border bg-background hover:bg-muted flex items-center justify-center shrink-0 shadow-sm z-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
               <ChevronRight className="h-4 w-4" />
             </button>
          </div>
          {recommendations.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {recommendations.map((_, idx) => (
                <div 
                  key={idx}
                  onClick={() => setCurrentRecIndex(idx)}
                  className={\`w-1.5 h-1.5 rounded-full cursor-pointer transition-colors \${idx === safeIndex ? 'bg-foreground' : 'bg-muted-foreground/30'}\`} 
                />
              ))}
            </div>
          )}`;

if (code.includes(oldJSX)) {
  code = code.replace(oldJSX, newJSX);
  fs.writeFileSync('src/components/Dashboard.tsx', code);
  console.log("Replaced successfully!");
} else {
  console.log("Could not find oldJSX block in file.");
  fs.writeFileSync('debug.txt', code);
}
