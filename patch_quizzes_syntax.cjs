const fs = require('fs');
let file = fs.readFileSync('src/components/Quizzes.tsx', 'utf-8');

// Replace the end of my new Return block
const badEnding = `      </div>
    </div>
      <ConfirmDialog`;

const goodEnding = `      </div>
      <ConfirmDialog`;

file = file.replace(badEnding, goodEnding);
fs.writeFileSync('src/components/Quizzes.tsx', file);
console.log("Patched syntax error");
