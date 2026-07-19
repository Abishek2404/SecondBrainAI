const fs = require('fs');
let file = fs.readFileSync('src/components/SmartNotes.tsx', 'utf-8');

const oldFilter = `  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesImportance = filterImportance === "all" || n.importance === filterImportance;
    const matchesSubject = filterSubject === "all" || n.subject === filterSubject;
    return matchesSearch && matchesImportance && matchesSubject;
  });`;

const newFilter = `  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesImportance = filterImportance === "all" || n.importance === filterImportance;
    const matchesSubject = filterSubject === "all" || n.subject === filterSubject;
    const matchesType = filterType === "all" || (n.type && n.type.toLowerCase().includes(filterType.toLowerCase()));
    const matchesCategory = activeCategory === "All Notes" || (n.type && n.type.toLowerCase().includes(activeCategory.replace(/s$/, '').toLowerCase()));
    
    return matchesSearch && matchesImportance && matchesSubject && matchesType && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'a-z') return a.title.localeCompare(b.title);
    return 0;
  });`;

file = file.replace(oldFilter, newFilter);
fs.writeFileSync('src/components/SmartNotes.tsx', file);
console.log("Patched filteredNotes");
