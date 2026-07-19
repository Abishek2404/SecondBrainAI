const fs = require('fs');
let file = fs.readFileSync('src/components/Quizzes.tsx', 'utf-8');

const oldFilter = `  const filteredQuizzes = quizzes.filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()));`;

const newFilter = `  const uniqueSubjects = Array.from(new Set(quizzes.map(q => q.subject).filter(Boolean)));
  const filteredQuizzes = quizzes.filter(q => {
     const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
     const matchesSubject = filterSubject === 'all' || q.subject === filterSubject;
     let matchesTab = true;
     if (activeTab === 'Completed') matchesTab = q.attemptsCount > 0;
     else if (activeTab === 'In Progress') matchesTab = q.attemptsCount > 0; // Mocking this
     else if (activeTab === 'Not Attempted') matchesTab = !q.attemptsCount;
     return matchesSearch && matchesSubject && matchesTab;
  });`;

file = file.replace(oldFilter, newFilter);
fs.writeFileSync('src/components/Quizzes.tsx', file);
console.log("Patched filteredQuizzes");
