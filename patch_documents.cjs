const fs = require('fs');

let file = fs.readFileSync('src/components/Documents.tsx', 'utf-8');

// 1. Remove handleAddTag and handleRemoveTag
file = file.replace(/const handleAddTag = async \([\s\S]*?\};\n/g, '');
file = file.replace(/const handleRemoveTag = async \([\s\S]*?\};\n/g, '');

// 2. Remove tags rendering in list view
file = file.replace(/\{doc\.tags && doc\.tags\.length > 0 && \([\s\S]*?\}\)\}\s*<\/div>\s*\)\}/g, '');

// 3. Remove tags rendering in grid view
file = file.replace(/\{doc\.tags && doc\.tags\.length > 0 && \([\s\S]*?<\/div>\s*\)\}/g, '');

// 4. Remove tags rendering in preview panel
file = file.replace(/<div className="flex justify-between items-start text-\[13px\] py-3 border-b border-slate-100">[\s\S]*?<span className="text-slate-500 font-medium mt-1">Tags<\/span>[\s\S]*?<\/div>\s*<\/div>/g, '');

// 5. Update placeholder
file = file.replace(/Search documents by name, content, or tags.../g, 'Search documents by name or content...');

fs.writeFileSync('src/components/Documents.tsx', file);
console.log("Patched Documents.tsx");
