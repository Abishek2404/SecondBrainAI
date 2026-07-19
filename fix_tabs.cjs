const fs = require('fs');
let file = fs.readFileSync('src/components/Quizzes.tsx', 'utf-8');

file = file.replace(/else if \(activeTab === 'In Progress'\) matchesTab = q.attemptsCount > 0; \/\/ Mocking this/, "else if (activeTab === 'In Progress') matchesTab = q.attemptsCount > 0 && Math.round((q.avgScore / q.questionsCount) * 100) < 100;");
file = file.replace(/else if \(tab === 'In Progress'\) count = 2; \/\/ mock/, "else if (tab === 'In Progress') count = quizzes.filter(q => q.attemptsCount > 0 && Math.round((q.avgScore / q.questionsCount) * 100) < 100).length;");

fs.writeFileSync('src/components/Quizzes.tsx', file);
console.log("Fixed tabs mock");
