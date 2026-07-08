const fs = require('fs');
let code = fs.readFileSync('src/components/Quizzes.tsx', 'utf8');

code = code.replace(
    'const handleDelete = async (id: string) => {\n    e.stopPropagation();\n    if (!confirm("Are you sure you want to delete this quiz?")) return;\n',
    'const handleDelete = async (id: string) => {\n'
);
// It might be e: React.MouseEvent
code = code.replace(
    'const handleDelete = async (e: React.MouseEvent, id: string) => {\n    e.stopPropagation();\n    if (!confirm("Are you sure you want to delete this quiz?")) return;\n',
    'const handleDelete = async (id: string) => {\n'
);
code = code.replace(
    'if (!confirm("Are you sure you want to delete this quiz?")) return;\n',
    ''
);

fs.writeFileSync('src/components/Quizzes.tsx', code);
