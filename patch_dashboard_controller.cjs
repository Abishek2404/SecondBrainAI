const fs = require('fs');
let code = fs.readFileSync('src/server/controllers/dashboard.controller.ts', 'utf8');

code = code.replace(
  '    let completedTasks = 0;\n    let totalTasks = 0;',
  '    let completedTasks = 0;\n    let totalTasks = 0;\n    let todayCompletedTasks = 0;'
);

const match = `        if (t.status === 'completed') completedTasks++;
        else if (plan.date >= today) {`;

const replace = `        if (t.status === 'completed') {
          completedTasks++;
          if (plan.date === today) todayCompletedTasks++;
        } else if (plan.date >= today) {`;

code = code.replace(match, replace);

const matchReturn = `        completedTasks,
        totalTasks,`;

const replaceReturn = `        completedTasks,
        todayCompletedTasks,
        totalTasks,`;

code = code.replace(matchReturn, replaceReturn);

fs.writeFileSync('src/server/controllers/dashboard.controller.ts', code);
console.log("Done");
