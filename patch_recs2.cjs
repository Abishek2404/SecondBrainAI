const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
  'const nextRec = () => {',
  'const safeIndex = currentRecIndex >= recommendations.length ? 0 : currentRecIndex;\n  const nextRec = () => {'
);

code = code.replace(
  '{recommendations[currentRecIndex].title}',
  '{recommendations[safeIndex]?.title}'
);
code = code.replace(
  '{recommendations[currentRecIndex].description}',
  '{recommendations[safeIndex]?.description}'
);
code = code.replace(
  '{recommendations[currentRecIndex].time}',
  '{recommendations[safeIndex]?.time}'
);
code = code.replace(
  '{recommendations[currentRecIndex].impact}',
  '{recommendations[safeIndex]?.impact}'
);
code = code.replace(
  '{recommendations[currentRecIndex].icon}',
  '{recommendations[safeIndex]?.icon}'
);
code = code.replace(
  'navigate(recommendations[currentRecIndex].link)',
  'navigate(recommendations[safeIndex]?.link)'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
