const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const oldCode = `          <Flame className="absolute bottom-4 right-4 h-16 w-16 text-orange-500/80 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" strokeWidth={1} />`;
const newCode = `          <img src="/learning-streak.svg" alt="Learning Streak" className="absolute -bottom-2 -right-2 h-24 w-24 object-contain pointer-events-none drop-shadow-md" />`;

if (code.includes(oldCode)) {
  code = code.replace(oldCode, newCode);
  fs.writeFileSync('src/components/Dashboard.tsx', code);
  console.log("Replaced Flame with SVG");
} else {
  console.log("Could not find Flame to replace");
}
