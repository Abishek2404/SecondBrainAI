const fs = require('fs');
let code = fs.readFileSync('src/server/controllers/auth.controller.ts', 'utf8');

const target = 'const { name, bio, learningGoal, preferredLanguage, timeZone, avatar } = req.body;';
const replace = 'const { name, bio, learningGoal, preferredLanguage, timeZone, avatar, dailyTasksGoal, dailyHoursGoal } = req.body;';
code = code.replace(target, replace);

const target2 = '{ name, bio, learningGoal, preferredLanguage, timeZone, avatar },';
const replace2 = '{ name, bio, learningGoal, preferredLanguage, timeZone, avatar, dailyTasksGoal, dailyHoursGoal },';
code = code.replace(target2, replace2);

fs.writeFileSync('src/server/controllers/auth.controller.ts', code);
console.log("Done");
