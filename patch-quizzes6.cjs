const fs = require('fs');
let code = fs.readFileSync('src/components/Quizzes.tsx', 'utf8');

code = code.replace(
    'onClick={(e) => { e.preventDefault(); handleDelete(quiz._id); }}',
    'onClick={(e) => { e.preventDefault(); e.stopPropagation(); setItemToDelete(quiz._id); }}'
);

fs.writeFileSync('src/components/Quizzes.tsx', code);
