const fs = require('fs');
let file = fs.readFileSync('src/components/Quizzes.tsx', 'utf-8');

file = file.replace(/const \[documents, setDocuments\] = useState<any\[\]>\(\[\]\);/, `const [documents, setDocuments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("All Quizzes");
  const [filterSubject, setFilterSubject] = useState("all");`);

fs.writeFileSync('src/components/Quizzes.tsx', file);
console.log("Patched states");
