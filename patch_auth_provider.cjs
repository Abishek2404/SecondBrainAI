const fs = require('fs');
let code = fs.readFileSync('src/components/AuthProvider.tsx', 'utf8');

code = code.replace(
  '  achievements?: string[];',
  '  achievements?: string[];\n  dailyTasksGoal?: number;\n  dailyHoursGoal?: number;'
);

fs.writeFileSync('src/components/AuthProvider.tsx', code);
console.log("Done");
