const fs = require('fs');
let file = fs.readFileSync('src/components/SmartNotes.tsx', 'utf-8');

const oldFilter = `  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesImportance = filterImportance === "all" || n.importance === filterImportance;
    const matchesSubject = filterSubject === "all" || n.subject === filterSubject;
    const matchesType = filterType === "all" || (n.type && n.type.toLowerCase().includes(filterType.toLowerCase()));
    const matchesCategory = activeCategory === "All Notes" || (n.type && n.type.toLowerCase().includes(activeCategory.replace(/s$/, '').toLowerCase()));
    
    return matchesSearch && matchesImportance && matchesSubject && matchesType && matchesCategory;
  }).sort((a, b) => {`;

const newFilter = `  const getCategorySearch = (cat) => {
    if (cat === 'Summaries') return 'summary';
    if (cat === 'Important Questions') return 'important question';
    if (cat === 'Cheat Sheets') return 'cheat sheet';
    if (cat === 'Mind Maps') return 'mind map';
    return cat.toLowerCase();
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesImportance = filterImportance === "all" || n.importance === filterImportance;
    const matchesSubject = filterSubject === "all" || n.subject === filterSubject;
    const matchesType = filterType === "all" || (n.type && n.type.toLowerCase().includes(filterType.toLowerCase()));
    
    let matchesCategory = true;
    if (activeCategory === 'Others') {
       matchesCategory = !['summary', 'important question', 'cheat sheet', 'mind map'].some(t => n.type?.toLowerCase().includes(t));
    } else if (activeCategory !== 'All Notes') {
       matchesCategory = !!(n.type && n.type.toLowerCase().includes(getCategorySearch(activeCategory)));
    }
    
    return matchesSearch && matchesImportance && matchesSubject && matchesType && matchesCategory;
  }).sort((a, b) => {`;

file = file.replace(oldFilter, newFilter);

const oldMap = `               let count = 0;
               if (cat === 'All Notes') count = notes.length;
               else if (cat === 'Others') count = notes.filter(n => !['summary', 'important questions', 'cheat sheet', 'mind map'].includes(n.type?.toLowerCase())).length;
               else count = notes.filter(n => n.type?.toLowerCase().includes(cat.replace(/s$/, '').toLowerCase())).length;`;

const newMap = `               let count = 0;
               if (cat === 'All Notes') count = notes.length;
               else if (cat === 'Others') count = notes.filter(n => !['summary', 'important question', 'cheat sheet', 'mind map'].some(t => n.type?.toLowerCase().includes(t))).length;
               else count = notes.filter(n => n.type?.toLowerCase().includes(getCategorySearch(cat))).length;`;

file = file.replace(oldMap, newMap);

fs.writeFileSync('src/components/SmartNotes.tsx', file);
console.log("Patched category filters");
