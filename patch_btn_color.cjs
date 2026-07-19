const fs = require('fs');
let file = fs.readFileSync('src/components/Quizzes.tsx', 'utf-8');

const oldBtn = `                       <Button 
                         variant={quiz.attemptsCount > 0 ? "outline" : "default"}
                         className={\`rounded-full px-5 h-9 text-xs font-bold \${quiz.attemptsCount === 0 ? 'bg-black hover:bg-black/90 text-white' : 'text-indigo-600 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50'}\`}
                         onClick={(e) => { e.stopPropagation(); startQuiz(quiz); }}
                       >
                         {quiz.attemptsCount > 0 ? (score >= 100 ? "Completed" : "Retake Quiz") : "Start Quiz"}
                       </Button>`;

const newBtn = `                       <Button 
                         variant={quiz.attemptsCount > 0 ? "outline" : "default"}
                         className={\`rounded-full px-5 h-9 text-xs font-bold \${quiz.attemptsCount === 0 ? 'bg-black hover:bg-black/90 text-white' : (score >= 100 ? 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100' : 'text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100')}\`}
                         onClick={(e) => { e.stopPropagation(); startQuiz(quiz); }}
                       >
                         {quiz.attemptsCount > 0 ? (score >= 100 ? "Completed" : "Retake Quiz") : "Start Quiz"}
                       </Button>`;

file = file.replace(oldBtn, newBtn);
fs.writeFileSync('src/components/Quizzes.tsx', file);
console.log("Patched btn color");
