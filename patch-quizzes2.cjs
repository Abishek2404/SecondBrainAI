const fs = require('fs');
let code = fs.readFileSync('src/components/Quizzes.tsx', 'utf8');

// replace submit logic
code = code.replace(
    'const submitQuiz = async () => {\n    if (selectedAnswers.includes(-1)) {\n      if (!confirm("You have unanswered questions. Are you sure you want to submit?")) {\n        return;\n      }\n    }',
    'const submitQuiz = async (forceSubmit: boolean = false) => {\n    if (!forceSubmit && selectedAnswers.includes(-1)) {\n      setShowSubmitConfirm(true);\n      return;\n    }'
);

// replace exit logic
code = code.replace(
    'onClick={() => {\n            if (confirm("Are you sure you want to exit? Your progress will be lost.")) {\n              setActiveQuiz(null);\n            }\n          }}',
    'onClick={() => setShowExitConfirm(true)}'
);

const parts = code.split(/<\/div>\s*$/);
code = parts[0] + `
      <ConfirmDialog 
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
      />
    </div>
`;

fs.writeFileSync('src/components/Quizzes.tsx', code);
