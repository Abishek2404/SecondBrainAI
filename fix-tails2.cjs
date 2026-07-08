const fs = require('fs');
const files = ['src/components/Documents.tsx', 'src/components/Flashcards.tsx', 'src/components/SmartNotes.tsx', 'src/components/Quizzes.tsx'];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Remove the badly appended ConfirmDialog block
  const idx = code.indexOf('      <ConfirmDialog ');
  if (idx !== -1 && idx > code.lastIndexOf('}')) {
     // Wait, the '}' is before the ConfirmDialog in the bad append
     // actually let's just use a regex to replace everything after `;\n}`
     let fix = code.replace(/;\n\}\s*<ConfirmDialog[\s\S]*$/, ';\n}\n');
     if (fix !== code) {
       fs.writeFileSync(file, fix);
       console.log('Fixed', file);
     } else {
       console.log('Could not fix', file, 'with regex 1');
       let fix2 = code.replace(/<\/div>\n  \);\n\}\n\s*<ConfirmDialog[\s\S]*/, '</div>\n  );\n}\n');
       if (fix2 !== code) {
         fs.writeFileSync(file, fix2);
         console.log('Fixed', file, 'with regex 2');
       }
     }
  }
}
