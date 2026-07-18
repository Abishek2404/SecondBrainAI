const fs = require('fs');
let code = fs.readFileSync('src/components/Documents.tsx', 'utf8');

const classMapCode = `
const getColorClasses = (color) => {
  const map = {
    indigo: { text: 'text-indigo-500', fill: 'fill-indigo-500/20', bg: 'bg-indigo-500/10' },
    emerald: { text: 'text-emerald-500', fill: 'fill-emerald-500/20', bg: 'bg-emerald-500/10' },
    rose: { text: 'text-rose-500', fill: 'fill-rose-500/20', bg: 'bg-rose-500/10' },
    amber: { text: 'text-amber-500', fill: 'fill-amber-500/20', bg: 'bg-amber-500/10' },
    blue: { text: 'text-blue-500', fill: 'fill-blue-500/20', bg: 'bg-blue-500/10' },
    purple: { text: 'text-purple-500', fill: 'fill-purple-500/20', bg: 'bg-purple-500/10' },
  };
  return map[color] || map.indigo;
};
`;

if(!code.includes('getColorClasses')) {
    code = code.replace('export function Documents() {', classMapCode + '\nexport function Documents() {');
    
    code = code.replace(/\{renderFolderIcon\(f\.folderType, \`h-8 w-8 text-\\\$\{(f\.color \|\| 'indigo')\}-500 fill-\\\$\{\1\}-500\/20 group-hover:scale-110 transition-transform shrink-0\`\)\}/g, 
                        "{renderFolderIcon(f.folderType, `h-8 w-8 ${getColorClasses(f.color).text} ${getColorClasses(f.color).fill} group-hover:scale-110 transition-transform shrink-0`)}");

    code = code.replace(/className=\{\`h-8 w-8 rounded-lg bg-\\\$\{(f\.color \|\| 'indigo')\}-500\/10 flex items-center justify-center shrink-0\`\}/g,
                        "className={`h-8 w-8 rounded-lg ${getColorClasses(f.color).bg} flex items-center justify-center shrink-0`}");

    code = code.replace(/\{renderFolderIcon\(f\.folderType, \`h-4 w-4 text-\\\$\{(f\.color \|\| 'indigo')\}-500 fill-\\\$\{\1\}-500\/20\`\)\}/g,
                        "{renderFolderIcon(f.folderType, `h-4 w-4 ${getColorClasses(f.color).text} ${getColorClasses(f.color).fill}`)}");
}

fs.writeFileSync('src/components/Documents.tsx', code);
