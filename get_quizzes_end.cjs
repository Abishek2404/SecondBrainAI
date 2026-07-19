const fs = require('fs');
let file = fs.readFileSync('src/components/Quizzes.tsx', 'utf-8');

const returnStartMarker = '  return (\n    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 min-h-screen">';
const startIdx = file.indexOf(returnStartMarker);

// Find the index of <ConfirmDialog
const dialogsIdx = file.indexOf('      <ConfirmDialog', startIdx);
if (dialogsIdx !== -1) {
   console.log("Dialogs found");
} else {
   console.log("Dialogs NOT found");
}
