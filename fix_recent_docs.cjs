const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// 1. Move "This Week's Progress" to the bottom.
const progressStart = `      {/* This Week's Progress */}`;
const bottomSectionStart = `      {/* Bottom Section */}`;

let lines = code.split('\n');
const progressStartIdx = lines.findIndex(l => l.includes(progressStart));
const bottomSectionIdx = lines.findIndex(l => l.includes(bottomSectionStart));

if (progressStartIdx !== -1 && bottomSectionIdx !== -1) {
    // Find the end of Progress Section (which is right before Bottom Section)
    // Actually, in the current file, it is:
    // This Week's Progress
    //   <div className="mt-4 flex flex-col gap-4">
    //     ...
    //   </div>
    // {/* Bottom Section */}
    // It's already right above Bottom section. We need to swap them.
    // Let's find exactly where Progress ends.
    let progressEndIdx = bottomSectionIdx - 1;
    while (progressEndIdx > 0 && lines[progressEndIdx].trim() === '') progressEndIdx--;
    
    // Check if it ends with </div>
    if (lines[progressEndIdx].includes('</div>')) {
        let progressSection = lines.slice(progressStartIdx, progressEndIdx + 1);
        
        // Find end of Bottom Section. Bottom Section ends just before {/* Quick Action Floating Menu */}
        const quickActionIdx = lines.findIndex(l => l.includes(`{/* Quick Action Floating Menu */}`));
        
        if (quickActionIdx !== -1) {
            let bottomSectionEndIdx = quickActionIdx - 1;
            while (bottomSectionEndIdx > 0 && lines[bottomSectionEndIdx].trim() === '') bottomSectionEndIdx--;
            
            let bottomSection = lines.slice(bottomSectionIdx, bottomSectionEndIdx + 1);
            
            let newLines = [
                ...lines.slice(0, progressStartIdx),
                ...bottomSection,
                '',
                ...progressSection,
                ...lines.slice(quickActionIdx)
            ];
            code = newLines.join('\n');
        }
    }
}

// 2. Change "Recent Documents" to horizontal layout
code = code.replace(
    `<div className="flex flex-col gap-3">
            {documents.map((doc, i) => (
              <motion.div whileHover={{ x: 2 }} key={i} className="group flex items-center justify-between p-3 rounded-2xl border bg-card hover:shadow-sm hover:border-primary/30 transition-all cursor-pointer">
                 <div className="flex items-center gap-4 overflow-hidden">
                   <div className="h-10 w-10 shrink-0 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 font-bold text-[10px] tracking-wider shadow-sm">
                     {doc.type === 'pdf' || doc.mimeType?.includes('pdf') ? 'PDF' : doc.type === 'txt' || doc.mimeType?.includes('text') ? 'TXT' : 'DOC'}
                   </div>
                   <div className="flex flex-col min-w-0">
                     <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                       {doc.title}
                     </h4>
                     <span className="text-xs text-muted-foreground mt-0.5">
                        {new Date(doc.createdAt).toLocaleDateString()}
                     </span>
                   </div>
                 </div>
                 <a 
                   href={doc.url} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   onClick={(e) => e.stopPropagation()}
                   className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-muted transition-all shrink-0 ml-2"
                 >
                   <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                 </a>
              </motion.div>
            ))}

            {/* Upload Card */}
            <motion.div 
              whileHover={{ y: -2 }} 
              onClick={() => navigate('/documents')}
              className="flex items-center justify-center p-4 rounded-2xl border border-dashed bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer gap-3 group mt-2"
            >
              <div className="h-8 w-8 rounded-xl bg-background border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                 <UploadCloud className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-medium text-sm">Upload Document</span>
              </div>
            </motion.div>
          </div>`,
    `<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {documents.slice(0, 3).map((doc, i) => (
              <motion.div whileHover={{ y: -2 }} key={i} className="group flex flex-col p-4 rounded-2xl border bg-card hover:shadow-sm hover:border-primary/30 transition-all cursor-pointer relative">
                 <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 font-bold text-[10px] tracking-wider shadow-sm mb-3">
                   {doc.type === 'pdf' || doc.mimeType?.includes('pdf') ? 'PDF' : doc.type === 'txt' || doc.mimeType?.includes('text') ? 'TXT' : 'DOC'}
                 </div>
                 <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-2">
                   {doc.title}
                 </h4>
                 <div className="mt-auto flex items-center justify-between">
                   <span className="text-xs text-muted-foreground">
                      {new Date(doc.createdAt).toLocaleDateString()}
                   </span>
                   <a 
                     href={doc.url} 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     onClick={(e) => e.stopPropagation()}
                     className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-muted transition-all"
                   >
                     <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                   </a>
                 </div>
              </motion.div>
            ))}

            {/* Upload Card */}
            <motion.div 
              whileHover={{ y: -2 }} 
              onClick={() => navigate('/documents')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border border-dashed bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group h-full min-h-[140px]"
            >
              <div className="h-10 w-10 rounded-xl bg-background border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-3">
                 <UploadCloud className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <span className="font-semibold text-sm text-center">Upload Document</span>
              <span className="text-xs text-muted-foreground text-center mt-1">or drag and drop</span>
            </motion.div>
          </div>`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Updated layout.");
