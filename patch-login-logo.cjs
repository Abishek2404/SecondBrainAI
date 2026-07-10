const fs = require('fs');
const file = 'src/components/Login.tsx';
let content = fs.readFileSync(file, 'utf8');

// replace emoji with Logo
if (!content.includes('import { Logo }')) {
    content = content.replace(
        "import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';",
        "import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';\nimport { Logo } from './Logo';"
    );
}

content = content.replace(
    '<span className="text-4xl mr-3" role="img" aria-label="brain">🧠</span>',
    '<Logo className="w-12 h-12 mr-3 text-foreground" />'
);

fs.writeFileSync(file, content);
console.log("Login patched");
