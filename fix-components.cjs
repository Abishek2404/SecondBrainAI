const fs = require('fs');

function insertBeforeLastDiv(file, injection) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Clean up any remaining bad appends just in case
  code = code.replace(/<\/div>\n  \);\n\}\n\s*<ConfirmDialog[\s\S]*/, '</div>\n  );\n}\n');
  code = code.replace(/;\n\}\s*<ConfirmDialog[\s\S]*$/, ';\n}\n');

  // Find the last "</div>" before ");\n}"
  const match = code.match(/<\/div>\s*\)\s*;\s*\}\s*$/);
  if (match) {
    code = code.substring(0, match.index) + '\n' + injection + '\n' + match[0];
    fs.writeFileSync(file, code);
    console.log('Successfully injected into', file);
  } else {
    console.log('Failed to match end of component in', file);
    // fallback: find last </div>\n  );\n}
    const fallbackMatch = code.lastIndexOf('</div>');
    if (fallbackMatch !== -1) {
       code = code.substring(0, fallbackMatch) + '\n' + injection + '\n' + code.substring(fallbackMatch);
       fs.writeFileSync(file, code);
       console.log('Successfully injected into', file, '(fallback)');
    }
  }
}

const docsInj = `      <ConfirmDialog 
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
      />`;

const flashInj = `      <ConfirmDialog 
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
      />`;

const notesInj = `      <ConfirmDialog 
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
      />`;

const quizInj = `      <ConfirmDialog 
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Delete Quiz"
        description="Are you sure you want to delete this quiz? This action cannot be undone."
        confirmText="Delete"
        destructive={true}
        onConfirm={() => {
          if (itemToDelete) {
            handleDelete(itemToDelete);
          }
          setItemToDelete(null);
        }}
      />
      <ConfirmDialog 
        open={showSubmitConfirm}
        onOpenChange={setShowSubmitConfirm}
        title="Submit Quiz"
        description="You have unanswered questions. Are you sure you want to submit?"
        confirmText="Submit"
        onConfirm={() => {
          submitQuiz(true);
          setShowSubmitConfirm(false);
        }}
      />
      <ConfirmDialog 
        open={showExitConfirm}
        onOpenChange={setShowExitConfirm}
        title="Exit Quiz"
        description="Are you sure you want to exit? Your progress will be lost."
        confirmText="Exit"
        destructive={true}
        onConfirm={() => {
          setActiveQuiz(null);
          setShowExitConfirm(false);
        }}
      />`;

insertBeforeLastDiv('src/components/Documents.tsx', docsInj);
insertBeforeLastDiv('src/components/Flashcards.tsx', flashInj);
insertBeforeLastDiv('src/components/SmartNotes.tsx', notesInj);
insertBeforeLastDiv('src/components/Quizzes.tsx', quizInj);

