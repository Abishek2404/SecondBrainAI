const fs = require('fs');
let code = fs.readFileSync('src/components/StudyPlanner.tsx', 'utf8');

code = code.replace(
    /<span className="uppercase tracking-wider text-\[10px\]">\{task\.type\}<\/span>/,
    `<span className="uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                              {task.type === 'Reading' && <img src="/Reading.png" alt="Reading" className="w-3 h-3 object-contain" />}
                              {task.type === 'Practice' && <img src="/Practise.png" alt="Practice" className="w-3 h-3 object-contain" />}
                              {task.type}
                            </span>`
);

fs.writeFileSync('src/components/StudyPlanner.tsx', code);
