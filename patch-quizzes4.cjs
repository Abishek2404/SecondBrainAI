const fs = require('fs');
let code = fs.readFileSync('src/components/Quizzes.tsx', 'utf8');

if (!code.includes('ConfirmDialog')) {
    code = code.replace(
        'import { Button } from "./ui/button";',
        `import { Button } from "./ui/button";\nimport { ConfirmDialog } from "./ui/confirm-dialog";`
    );
}

if (!code.includes('itemToDelete')) {
    code = code.replace(
        'const [quizzes, setQuizzes] = useState<any[]>([]);',
        `const [quizzes, setQuizzes] = useState<any[]>([]);\n  const [itemToDelete, setItemToDelete] = useState<string | null>(null);\n  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);\n  const [showExitConfirm, setShowExitConfirm] = useState(false);`
    );
}

fs.writeFileSync('src/components/Quizzes.tsx', code);
