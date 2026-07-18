const fs = require('fs');
let code = fs.readFileSync('src/server/models/User.ts', 'utf8');
code = code.replace(
  '  achievements: string[];',
  '  achievements: string[];\n  dailyTasksGoal: number;\n  dailyHoursGoal: number;'
);
code = code.replace(
  '    achievements: {\n      type: [String],\n      default: [],\n    },',
  '    achievements: {\n      type: [String],\n      default: [],\n    },\n    dailyTasksGoal: {\n      type: Number,\n      default: 4,\n    },\n    dailyHoursGoal: {\n      type: Number,\n      default: 2,\n    },'
);
fs.writeFileSync('src/server/models/User.ts', code);
console.log("Done");
