const fs = require('fs');
let code = fs.readFileSync('src/server/services/rag.service.ts', 'utf8');

code = code.replace(
  /if \(errorStr\.includes\('429'\)[\s\S]*?\} else if \(errorStr\.includes\('503'\)[\s\S]*?\} else \{/g,
  `if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('503') || errorStr.includes('UNAVAILABLE')) {
        console.warn(\`\${modelToUse} rate limit or 503, retrying in 3 seconds...\`);
        if (attempt === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {`
);

code = code.replace(
  /if \(errorStr\.includes\('429'\)[\s\S]*?\} else if \(errorStr\.includes\('503'\)[\s\S]*?\} else \{/g,
  `if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('RESOURCE_EXHAUSTED') || errorStr.includes('503') || errorStr.includes('UNAVAILABLE')) {
        console.warn(\`generateContent rate limit or 503, retrying in 3 seconds...\`);
        if (attempt === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {`
);

fs.writeFileSync('src/server/services/rag.service.ts', code);
