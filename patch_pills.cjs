const fs = require('fs');
let file = fs.readFileSync('src/components/SmartNotes.tsx', 'utf-8');

const oldPill = `<Badge 
                   key={cat}
                   variant={isActive ? "default" : "outline"} 
                   onClick={() => setActiveCategory(cat)}
                   className={\`rounded-full px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors \${isActive ? 'bg-black text-white hover:bg-black/90' : 'bg-card hover:bg-slate-50 text-slate-600 border-border/60'}\`}
                 >
                   {cat} ({count})
                 </Badge>`;

const newPill = `<button 
                   key={cat}
                   onClick={() => setActiveCategory(cat)}
                   className={\`rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-colors \${isActive ? 'bg-black text-white hover:bg-black/90' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-transparent'}\`}
                 >
                   {cat} ({count})
                 </button>`;

file = file.replace(oldPill, newPill);
fs.writeFileSync('src/components/SmartNotes.tsx', file);
console.log("Patched pills");
