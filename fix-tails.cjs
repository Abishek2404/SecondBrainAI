const fs = require('fs');

const files = ['src/components/Documents.tsx', 'src/components/Flashcards.tsx', 'src/components/SmartNotes.tsx'];
for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.trim().endsWith('}')) {
    code = code + '\n  );\n}';
    fs.writeFileSync(file, code);
  }
}
