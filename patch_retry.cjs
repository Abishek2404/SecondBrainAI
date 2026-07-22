const fs = require('fs');
let code = fs.readFileSync('src/server/services/rag.service.ts', 'utf8');

code = code.replace(
  /const errorStr = String\(error\);\s*if \(errorStr\.includes\('429'\) \|\| errorStr\.includes\('quota'\) \|\| errorStr\.includes\('RESOURCE_EXHAUSTED'\)\) \{/g,
  `const errorStr = String(error) + (error.message || '') + JSON.stringify(error, Object.getOwnPropertyNames(error));
      if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('503') || errorStr.includes('UNAVAILABLE')) {`
);

fs.writeFileSync('src/server/services/rag.service.ts', code);
