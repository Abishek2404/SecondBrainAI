const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
    '<div className="grid grid-cols-2 md:grid-cols-3 gap-4">',
    '<div className="grid grid-cols-2 md:grid-cols-4 gap-4">'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Fixed grid");
