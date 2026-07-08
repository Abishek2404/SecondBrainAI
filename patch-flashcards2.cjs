const fs = require('fs');
let code = fs.readFileSync('src/components/Flashcards.tsx', 'utf8');

// Add import
if (!code.includes('ConfirmDialog')) {
    code = code.replace(
        'import { Button } from "./ui/button";',
        `import { Button } from "./ui/button";\nimport { ConfirmDialog } from "./ui/confirm-dialog";`
    );
}

// Add state
if (!code.includes('itemToDelete')) {
    code = code.replace(
        'const [decks, setDecks] = useState<any[]>([]);',
        `const [decks, setDecks] = useState<any[]>([]);\n  const [itemToDelete, setItemToDelete] = useState<string | null>(null);`
    );
}

// Update handleDelete
code = code.replace(
    'const handleDelete = async (e: React.MouseEvent, id: string) => {\n    e.stopPropagation();\n    if (!confirm("Are you sure you want to delete this deck?")) return;\n',
    'const handleDelete = async (id: string) => {\n'
);
// wait, the previous sed might have changed onClick
code = code.replace(
    /onClick=\{\(e\) => \{ e\.preventDefault\(\); handleDelete\(e, deck\._id\); \}\}/g,
    'onClick={(e) => { e.preventDefault(); e.stopPropagation(); setItemToDelete(deck._id); }}'
);
// just in case
code = code.replace(
    /onClick=\{\(e\) => handleDelete\(e, deck\._id\)\}/g,
    'onClick={(e) => { e.preventDefault(); e.stopPropagation(); setItemToDelete(deck._id); }}'
);

const parts = code.split(/<\/div>\s*$/);
code = parts[0] + `
      <ConfirmDialog 
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Delete Deck"
        description="Are you sure you want to delete this deck? This action cannot be undone."
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
fs.writeFileSync('src/components/Flashcards.tsx', code);
