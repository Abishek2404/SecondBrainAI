const fs = require('fs');
let code = fs.readFileSync('src/components/Chat.tsx', 'utf8');

// Modify handleFileUpload
code = code.replace(
  /setAttachedDoc\(\{ id: data\.data\._id, name: data\.data\.originalName \|\| data\.data\.title \}\);/g,
  `const isImage = data.data.originalName.match(/\\.(jpg|jpeg|png|webp)$/i);
        setAttachedDoc({ 
          id: data.data._id, 
          name: data.data.originalName || data.data.title,
          url: data.data.url,
          isImage: !!isImage
        });`
);

// Modify attachedDoc state definition
code = code.replace(
  /const \[attachedDoc, setAttachedDoc\] = useState<\{ id: string; name: string \} \| null>\(null\);/g,
  'const [attachedDoc, setAttachedDoc] = useState<{ id: string; name: string; url?: string; isImage?: boolean } | null>(null);'
);

// Modify Message interface
code = code.replace(
  /attachedFile\?: string;/g,
  'attachedFile?: string;\n  imageUrl?: string;'
);

// Modify handleSend userMsg creation
code = code.replace(
  /const userMsg: Message = \{\s*id: Date\.now\(\)\.toString\(\),\s*role: "user",\s*content: userContent,\s*attachedFile: attachedDoc\?\.name\s*\};/m,
  `const userMsg: Message = { 
      id: Date.now().toString(), 
      role: "user", 
      content: userContent,
      attachedFile: attachedDoc?.isImage ? undefined : attachedDoc?.name,
      imageUrl: attachedDoc?.isImage ? attachedDoc?.url : undefined
    };`
);

// Modify handleSend apiFetch body
code = code.replace(
  /documentId: docIdToSend/g,
  `documentId: attachedDoc?.isImage ? undefined : docIdToSend,
          imageUrl: attachedDoc?.isImage ? attachedDoc?.url : undefined`
);

// Modify userMsg render to show image
code = code.replace(
  /\{msg\.attachedFile && \([\s\S]*?<\/[a-zA-Z]+>\s*\)\}/m,
  `{msg.attachedFile && (
                        <div className="flex items-center gap-2 mb-3 p-2 rounded-xl bg-white/50 border border-indigo-100 text-xs font-medium">
                          <FileText className="h-4 w-4 text-indigo-500" />
                          <span className="truncate">{msg.attachedFile}</span>
                        </div>
                      )}
                      {msg.imageUrl && (
                        <div className="mb-3">
                          <img src={msg.imageUrl} alt="Attached" className="max-w-[200px] rounded-lg border shadow-sm" />
                        </div>
                      )}`
);

// Add search toggle if needed. Actually we can just keep it automatic based on prompt.

fs.writeFileSync('src/components/Chat.tsx', code);
