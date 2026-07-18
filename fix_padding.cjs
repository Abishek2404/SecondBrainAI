const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

// Replace container padding and gap
code = code.replace(
    /className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm flex flex-col gap-8"/g,
    'className="rounded-3xl border bg-card p-5 md:p-6 shadow-sm flex flex-col gap-6"'
);

// Replace grid gap
code = code.replace(
    /<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">/g,
    '<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">'
);

// Replace card padding and height
code = code.replace(
    /className="bg-slate-50\/50 dark:bg-muted\/10 border border-muted\/50 rounded-2xl p-5 flex flex-col h-\[180px\] relative overflow-hidden group"/g,
    'className="bg-slate-50/50 dark:bg-muted/10 border border-muted/50 rounded-2xl p-4 flex flex-col h-[140px] relative overflow-hidden group"'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Fixed padding and width");
