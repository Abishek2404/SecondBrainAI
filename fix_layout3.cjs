const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const lines = code.split('\n');

const progressStartIdx = lines.findIndex(line => line.includes("{/* This Week's Progress */}"));
const bottomSectionIdx = lines.findIndex(line => line.includes("{/* Bottom Section */}"));

if (progressStartIdx !== -1 && bottomSectionIdx !== -1) {
    let rightColumnIdx = lines.findIndex(line => line.includes('{/* Right Column */}'));
    
    // The closing div of Left Column should be the line just before rightColumnIdx (ignoring empty lines)
    let leftColumnCloseIdx = rightColumnIdx - 1;
    while (leftColumnCloseIdx > 0 && lines[leftColumnCloseIdx].trim() === '') {
        leftColumnCloseIdx--;
    }
    
    // progress end is right above leftColumnCloseIdx
    let progressEndIdx = leftColumnCloseIdx - 1;
    
    console.log("Start: ", progressStartIdx, " End: ", progressEndIdx, " Right Col: ", rightColumnIdx);

    const progressLines = lines.slice(progressStartIdx, progressEndIdx + 1);
    
    let newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        if (i === bottomSectionIdx) {
            newLines.push(...progressLines);
            newLines.push('');
            newLines.push(lines[i]);
        } else if (i >= progressStartIdx && i <= progressEndIdx) {
            // Skip
        } else {
            newLines.push(lines[i]);
        }
    }
    
    fs.writeFileSync('src/components/Dashboard.tsx', newLines.join('\n'));
    console.log("Moved Progress Section!");
} else {
    console.log("Could not find indices");
}
