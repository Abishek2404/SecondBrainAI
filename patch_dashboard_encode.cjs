const fs = require('fs');
let file = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');
file = file.replace(/\/Doc File\.png/g, '/Doc%20File.png');
fs.writeFileSync('src/components/Dashboard.tsx', file);
console.log("Encoded URL in Dashboard.");
