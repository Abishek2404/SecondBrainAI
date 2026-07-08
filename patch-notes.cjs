const fs = require('fs');
let code = fs.readFileSync('src/components/SmartNotes.tsx', 'utf8');

if (!code.includes('ConfirmDialog')) {
    code = code.replace(
        'import { Button } from "./ui/button";',
        `import { Button } from "./ui/button";\nimport { ConfirmDialog } from "./ui/confirm-dialog";`
    );
}

if (!code.includes('itemToDelete')) {
    code = code.replace(
        'const [notes, setNotes] = useState<any[]>([]);',
        `const [notes, setNotes] = useState<any[]>([]);\n  const [itemToDelete, setItemToDelete] = useState<string | null>(null);`
    );
}

code = code.replace(
    'const handleDelete = async (e: React.MouseEvent, id: string) => {\n    e.stopPropagation();\n    if (!confirm("Are you sure you want to delete this note?")) return;\n',
    'const handleDelete = async (id: string) => {\n'
);
code = code.replace(
    /onClick=\{\(e\) => \{ e\.preventDefault\(\); handleDelete\(e, note\._id\); \}\}/g,
    'onClick={(e) => { e.preventDefault(); e.stopPropagation(); setItemToDelete(note._id); }}'
);
code = code.replace(
    /onClick=\{\(e\) => handleDelete\(e, note\._id\)\}/g,
    'onClick={(e) => { e.preventDefault(); e.stopPropagation(); setItemToDelete(note._id); }}'
);

const parts = code.split(/<\/div>\s*$/);
code = parts[0] + `
      <ConfirmDialog 
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        destructive={true}
        onConfirm={() => {
          if (itemToDelete) {
            handleDelete(itemToDelete);
          }
          setItemToDelete(null);
        }}
      />
    </div>
`;
fs.writeFileSync('src/components/SmartNotes.tsx', code);
