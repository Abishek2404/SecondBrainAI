const fs = require('fs');
let code = fs.readFileSync('src/components/Documents.tsx', 'utf8');

code = code.replace(
  '<DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-0">',
  '<DialogContent className="w-[95vw] sm:max-w-md rounded-3xl p-0 overflow-hidden border-0">'
);
code = code.replace(
  '<div className="grid grid-cols-2 gap-4">',
  '<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">'
);
fs.writeFileSync('src/components/Documents.tsx', code);

let dash = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');
dash = dash.replace(
  '<div className="flex items-center gap-4">',
  '<div className="flex items-center gap-2 sm:gap-4">'
);
dash = dash.replace(
  '<div \n               onClick={() => navigate(recommendations[safeIndex]?.link || \'/documents\')}\n               className="flex-1 bg-muted/40 rounded-xl p-5 border border-border/50 flex items-center gap-6 relative overflow-hidden cursor-pointer hover:bg-muted/60 transition-colors">',
  '<div \n               onClick={() => navigate(recommendations[safeIndex]?.link || \'/documents\')}\n               className="flex-1 bg-muted/40 rounded-xl p-4 sm:p-5 border border-border/50 flex items-center gap-4 sm:gap-6 relative overflow-hidden cursor-pointer hover:bg-muted/60 transition-colors">'
);

dash = dash.replace(
  'className="flex items-center justify-between mb-4 sm:mb-8"',
  'className="flex flex-row items-center justify-between mb-4 sm:mb-8"'
);

fs.writeFileSync('src/components/Dashboard.tsx', dash);
