const fs = require('fs');
let code = fs.readFileSync('src/components/Documents.tsx', 'utf-8');

// Use regex to remove entire dialog blocks. Since they might be multiple lines and nested, we need careful matching or simple string replacement.
code = code.replace(/<Dialog open={createFolderOpen}[\s\S]*?<\/Dialog>/m, '');
code = code.replace(/<Dialog open={moveDocState\.open}[\s\S]*?<\/Dialog>/m, '');

fs.writeFileSync('src/components/Documents.tsx', code);
