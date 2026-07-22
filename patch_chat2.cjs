const fs = require('fs');
let code = fs.readFileSync('src/components/Chat.tsx', 'utf8');

code = code.replace(
  /<div className="p-1\.5 bg-primary\/10 rounded-lg">[\s\S]*?<FileText className="h-4 w-4 shrink-0 text-primary" \/>[\s\S]*?<\/div>/m,
  `{attachedDoc.isImage ? (
                    <img src={attachedDoc.url} alt="Attached" className="h-8 w-8 rounded object-cover shrink-0" />
                  ) : (
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <FileText className="h-4 w-4 shrink-0 text-primary" />
                    </div>
                  )}`
);

fs.writeFileSync('src/components/Chat.tsx', code);
