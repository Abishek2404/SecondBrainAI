const fs = require('fs');
let code = fs.readFileSync('src/components/Documents.tsx', 'utf8');

const s1 = '{renderFolderIcon(currentFolder.folderType, "h-5 w-5 text-indigo-500 fill-indigo-500/20")}';
const n1 = '{renderFolderIcon(currentFolder.folderType, `h-5 w-5 ${getColorClasses(currentFolder.color).text} ${getColorClasses(currentFolder.color).fill}`)}';

code = code.split(s1).join(n1);

fs.writeFileSync('src/components/Documents.tsx', code);
