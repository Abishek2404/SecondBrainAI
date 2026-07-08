const fs = require('fs');
let code = fs.readFileSync('src/components/Quizzes.tsx', 'utf8');

code = code.replace(
    /handleDelete\(e, quiz\._id\);/g,
    'handleDelete(quiz._id);'
);

fs.writeFileSync('src/components/Quizzes.tsx', code);
