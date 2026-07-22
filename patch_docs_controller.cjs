const fs = require('fs');
let code = fs.readFileSync('src/server/controllers/documents.controller.ts', 'utf8');

code = code.replace(
  /if \(attempt < 2 && \(errStr\.includes\('429'\) \|\| errStr\.includes\('503'\) \|\| errStr\.includes\('quota'\)\)\) \{\s*console\.warn\("Retrying subject generation\.\.\."\);\s*await new Promise\(r => setTimeout\(r, 2000\)\);\s*\}/g,
  `if (attempt < 2 && (errStr.includes('429') || errStr.includes('quota'))) {
                                console.warn("Quota limit reached, retrying in 60 seconds...");
                                await new Promise(r => setTimeout(r, 61000));
                            } else if (attempt < 2 && errStr.includes('503')) {
                                console.warn("503 error, retrying in 5 seconds...");
                                await new Promise(r => setTimeout(r, 5000));
                            }`
);

fs.writeFileSync('src/server/controllers/documents.controller.ts', code);
