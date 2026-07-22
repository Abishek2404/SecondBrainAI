const fs = require('fs');
let code = fs.readFileSync('src/components/SmartNotes.tsx', 'utf8');

code = code.replace(
    /<Select value=\{filterType\}[\s\S]*?<\/Select>\s*<Select value=\{filterSubject\}[\s\S]*?<\/Select>/,
    ''
);

fs.writeFileSync('src/components/SmartNotes.tsx', code);
