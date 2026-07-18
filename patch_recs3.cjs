const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
  "idx === currentRecIndex ? 'bg-foreground' : 'bg-muted-foreground/30'",
  "idx === safeIndex ? 'bg-foreground' : 'bg-muted-foreground/30'"
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
