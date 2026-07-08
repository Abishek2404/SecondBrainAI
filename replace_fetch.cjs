const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src/components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('fetch(')) {
    // Only add import if it doesn't have it
    if (!content.includes('import { apiFetch }')) {
        content = "import { apiFetch } from '../lib/api';\n" + content;
    }
    // Simple replace fetch( with apiFetch(
    // We only replace exact 'fetch('
    content = content.replace(/\bfetch\(/g, 'apiFetch(');
    fs.writeFileSync(filePath, content);
    console.log('Replaced fetch in ' + file);
  }
}
