const fs = require('fs');
let code = fs.readFileSync('src/components/Documents.tsx', 'utf8');

const oldRender = `                    {renderFolderIcon(f.folderType, "h-8 w-8 text-indigo-500 fill-indigo-500/20 group-hover:scale-110 transition-transform shrink-0")}`;
const newRender = `                    {renderFolderIcon(f.folderType, \`h-8 w-8 text-\${f.color || 'indigo'}-500 fill-\${f.color || 'indigo'}-500/20 group-hover:scale-110 transition-transform shrink-0\`)}`;

code = code.replace(oldRender, newRender);

const oldMoveRender = `                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  {renderFolderIcon(f.folderType, "h-4 w-4 text-indigo-500 fill-indigo-500/20")}
                </div>`;
const newMoveRender = `                <div className={\`h-8 w-8 rounded-lg bg-\${f.color || 'indigo'}-500/10 flex items-center justify-center shrink-0\`}>
                  {renderFolderIcon(f.folderType, \`h-4 w-4 text-\${f.color || 'indigo'}-500 fill-\${f.color || 'indigo'}-500/20\`)}
                </div>`;

code = code.replace(oldMoveRender, newMoveRender);
fs.writeFileSync('src/components/Documents.tsx', code);
