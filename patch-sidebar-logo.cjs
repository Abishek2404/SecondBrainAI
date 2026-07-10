const fs = require('fs');
const file = 'src/components/Sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { Logo }')) {
    content = content.replace(
        "import { Link, useLocation } from 'react-router-dom';",
        "import { Link, useLocation } from 'react-router-dom';\nimport { Logo } from './Logo';"
    );
}

content = content.replace(
    '<BookOpen className="h-5 w-5" />',
    '<Logo className="h-6 w-6" />'
);

fs.writeFileSync(file, content);
console.log("Sidebar patched");
