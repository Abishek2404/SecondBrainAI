const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
    /else if \(task\.type === 'Notes'\) \{ Icon = FileText; color = "text-emerald-600"; bg = "bg-emerald-100 dark:bg-emerald-900\/30"; \}/,
    `else if (task.type === 'Notes') { Icon = FileText; color = "text-emerald-600"; bg = "bg-emerald-100 dark:bg-emerald-900/30"; }
                    else if (task.type === 'Practice') { Icon = Target; color = "text-purple-600"; bg = "bg-purple-100 dark:bg-purple-900/30"; }`
);

code = code.replace(
    /<Icon className=\{\`h-5 w-5 \$\{color\}\`\} \/>/,
    `{task.type === 'Reading' ? (
                                    <img src="/Reading.png" alt="Reading" className="w-6 h-6 object-contain" />
                                ) : task.type === 'Practice' ? (
                                    <img src="/Practise.png" alt="Practice" className="w-6 h-6 object-contain" />
                                ) : (
                                    <Icon className={\`h-5 w-5 \${color}\`} />
                                )}`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
