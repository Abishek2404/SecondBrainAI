const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
    /<span className=\{\`text-\[10px\] font-semibold px-2 py-0\.5 rounded-md \$\{bg\} \$\{color\}\`\}>\{task\.type\}<\/span>/,
    `<span className={\`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md \${bg} \${color}\`}>
                                 {task.type === 'Reading' && <img src="/Reading.png" alt="Reading" className="w-3 h-3 object-contain" />}
                                 {task.type === 'Practice' && <img src="/Practise.png" alt="Practice" className="w-3 h-3 object-contain" />}
                                 {task.type}
                              </span>`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
