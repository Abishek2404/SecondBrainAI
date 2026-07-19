const fs = require('fs');
let file = fs.readFileSync('src/components/Quizzes.tsx', 'utf-8');

file = file.replace(/<Brain className="h-4 w-4" \/>/, `<Plus className="h-4 w-4" />`);
file = file.replace(/import \{ Brain,/, `import { Brain, Plus,`);

fs.writeFileSync('src/components/Quizzes.tsx', file);
console.log("Patched btn icon");
