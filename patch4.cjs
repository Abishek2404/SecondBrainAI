const fs = require('fs');
let code = fs.readFileSync('src/components/Documents.tsx', 'utf8');

const s1 = "{renderFolderIcon(f.folderType, `h-8 w-8 text-${f.color || 'indigo'}-500 fill-${f.color || 'indigo'}-500/20 group-hover:scale-110 transition-transform shrink-0`)}";
const n1 = "{renderFolderIcon(f.folderType, `h-8 w-8 ${getColorClasses(f.color).text} ${getColorClasses(f.color).fill} group-hover:scale-110 transition-transform shrink-0`)}";

const s2 = "className={`h-8 w-8 rounded-lg bg-${f.color || 'indigo'}-500/10 flex items-center justify-center shrink-0`}";
const n2 = "className={`h-8 w-8 rounded-lg ${getColorClasses(f.color).bg} flex items-center justify-center shrink-0`}";

const s3 = "{renderFolderIcon(f.folderType, `h-4 w-4 text-${f.color || 'indigo'}-500 fill-${f.color || 'indigo'}-500/20`)}";
const n3 = "{renderFolderIcon(f.folderType, `h-4 w-4 ${getColorClasses(f.color).text} ${getColorClasses(f.color).fill}`)}";

code = code.split(s1).join(n1);
code = code.split(s2).join(n2);
code = code.split(s3).join(n3);

fs.writeFileSync('src/components/Documents.tsx', code);
