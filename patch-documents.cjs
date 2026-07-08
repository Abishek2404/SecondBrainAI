const fs = require('fs');
let code = fs.readFileSync('src/components/Documents.tsx', 'utf8');

// Add import
if (!code.includes('ConfirmDialog')) {
    code = code.replace(
        'import { Button, buttonVariants } from "./ui/button";',
        `import { Button, buttonVariants } from "./ui/button";\nimport { ConfirmDialog } from "./ui/confirm-dialog";`
    );
}

// Add state
if (!code.includes('itemToDelete')) {
    code = code.replace(
        'const [searchQuery, setSearchQuery] = useState("");',
        `const [searchQuery, setSearchQuery] = useState("");\n  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'document' | 'folder'} | null>(null);`
    );
}

// Update handleDeleteDocument
code = code.replace(
    'const handleDeleteDocument = async (id: string) => {\n    if (!confirm("Are you sure you want to delete this document?")) return;\n',
    'const handleDeleteDocument = async (id: string) => {\n'
);

// Update handleDeleteFolder
code = code.replace(
    'const handleDeleteFolder = async (e: React.MouseEvent, id: string) => {\n    e.stopPropagation();\n    if (!confirm("Are you sure you want to delete this folder? Documents will be moved to root.")) return;',
    'const handleDeleteFolder = async (id: string) => {'
);

// Update document delete onClick
code = code.replace(
    /onClick=\{\(e\) => \{ e\.preventDefault\(\); e\.stopPropagation\(\); handleDeleteDocument\(doc\._id\); \}\}/g,
    'onClick={(e) => { e.preventDefault(); e.stopPropagation(); setItemToDelete({ id: doc._id, type: \'document\' }); }}'
);

// Update folder delete onClick
code = code.replace(
    /onClick=\{\(e\) => handleDeleteFolder\(e, f\._id\)\}/g,
    'onClick={(e) => { e.preventDefault(); e.stopPropagation(); setItemToDelete({ id: f._id, type: \'folder\' }); }}'
);

// Inject ConfirmDialog at the end before </div> (the root div)
// We'll search for the last </div>
const parts = code.split(/<\/div>\s*$/);
code = parts[0] + `
      <ConfirmDialog 
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title={itemToDelete?.type === 'document' ? "Delete Document" : "Delete Folder"}
        description={itemToDelete?.type === 'document' 
          ? "Are you sure you want to delete this document? This action cannot be undone."
          : "Are you sure you want to delete this folder? Any documents inside will be moved to the root level. This action cannot be undone."
        }
        confirmText="Delete"
        destructive={true}
        onConfirm={() => {
          if (itemToDelete?.type === 'document') {
            handleDeleteDocument(itemToDelete.id);
          } else if (itemToDelete?.type === 'folder') {
            handleDeleteFolder(itemToDelete.id);
          }
          setItemToDelete(null);
        }}
      />
    </div>
`;
fs.writeFileSync('src/components/Documents.tsx', code);
