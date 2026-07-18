const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const target2 = '{/* AI Study Recommendation */}\n        <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col relative overflow-hidden group">';
const replace2 = '{/* AI Study Recommendation */}\n        <div className="lg:col-span-3 rounded-2xl border bg-card p-6 shadow-sm flex flex-col relative overflow-hidden group">';

content = content.replace(target2, replace2);
fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log('done2');
