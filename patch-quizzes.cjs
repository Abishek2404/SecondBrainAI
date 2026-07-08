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

code = code.replace(
    'const handleDelete = async (e: React.MouseEvent, id: string) => {\n    e.stopPropagation();\n    if (!confirm("Are you sure you want to delete this quiz?")) return;\n',
    'const handleDelete = async (id: string) => {\n'
);
code = code.replace(
    /onClick=\{\(e\) => \{ e\.preventDefault\(\); handleDelete\(e, quiz\._id\); \}\}/g,
    'onClick={(e) => { e.preventDefault(); e.stopPropagation(); setItemToDelete(quiz._id); }}'
);
code = code.replace(
    /onClick=\{\(e\) => handleDelete\(e, quiz\._id\)\}/g,
    'onClick={(e) => { e.preventDefault(); e.stopPropagation(); setItemToDelete(quiz._id); }}'
);

code = code.replace(
    'if (!confirm("You have unanswered questions. Are you sure you want to submit?")) {\n        return;\n      }',
    'setShowSubmitConfirm(true);\n      return;'
);
// In this case, we have a submitQuiz function, if showSubmitConfirm is true, we should submit without checking or just have a separate submitConfirm.
// Wait, replacing it this way will make submitQuiz return. We need to extract the actual submit logic.
// Let's replace the whole submitQuiz body or just the confirm part.
// A better way is to do it manually in Quizzes.tsx, or write a smarter replacement.
