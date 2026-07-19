const fs = require('fs');
let file = fs.readFileSync('src/components/SmartNotes.tsx', 'utf-8');

file = file.replace(/const \[filterImportance, setFilterImportance\] = useState<string>\("all"\);/, `const [filterType, setFilterType] = useState<string>("all");
  const [filterImportance, setFilterImportance] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("latest");
  const [viewMode, setViewMode] = useState<"grid"|"list">("grid");
  const [activeCategory, setActiveCategory] = useState<string>("All Notes");`);

fs.writeFileSync('src/components/SmartNotes.tsx', file);
console.log("Patched states");
