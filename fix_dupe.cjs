const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const lines = code.split('\n');

// Find the line index for the SECOND `{/* Bottom Section */}`
let bottomSectionIndices = [];
lines.forEach((line, i) => {
    if (line.includes('{/* Bottom Section */}')) {
        bottomSectionIndices.push(i);
    }
});

// Find the line index for `{/* Right Column */}`
let rightColumnIndex = lines.findIndex(line => line.includes('{/* Right Column */}'));

if (bottomSectionIndices.length === 2 && rightColumnIndex !== -1) {
    const startIndex = bottomSectionIndices[1];
    
    // We want to delete from startIndex up to (rightColumnIndex - 1)
    const newLines = [
        ...lines.slice(0, startIndex),
        ...lines.slice(rightColumnIndex)
    ];
    
    fs.writeFileSync('src/components/Dashboard.tsx', newLines.join('\n'));
    console.log("Fixed duplication!");
} else {
    console.log("Could not find patterns. bottomSectionIndices: " + bottomSectionIndices.length + ", rightColumnIndex: " + rightColumnIndex);
}
