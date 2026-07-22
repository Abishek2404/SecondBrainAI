const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
    /<span className="text-\[11px\] text-muted-foreground mt-0\.5">\{task\.type\}<\/span>/,
    `<span className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                  {task.type === 'Reading' && <img src="/Reading.png" alt="Reading" className="w-2.5 h-2.5 object-contain" />}
                                  {task.type === 'Practice' && <img src="/Practise.png" alt="Practice" className="w-2.5 h-2.5 object-contain" />}
                                  {task.type}
                                </span>`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
