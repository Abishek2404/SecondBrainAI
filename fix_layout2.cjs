const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const lines = code.split('\n');

const progressStartIdx = lines.findIndex(line => line.includes("{/* This Week's Progress */}"));
const bottomSectionIdx = lines.findIndex(line => line.includes("{/* Bottom Section */}"));

if (progressStartIdx !== -1 && bottomSectionIdx !== -1) {
    let progressEndIdx = -1;
    for (let i = progressStartIdx; i < lines.length; i++) {
        if (lines[i].includes('      </div>') && lines[i+1].includes('      </div>') && lines[i+2].includes('        {/* Right Column */}')) {
            progressEndIdx = i; // The first </div>
            break;
        }
    }

    if (progressEndIdx !== -1) {
        const progressLines = lines.slice(progressStartIdx, progressEndIdx + 1);
        
        let newLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            if (i === bottomSectionIdx) {
                // Insert progress lines here
                newLines.push(...progressLines);
                // Add some spacing
                newLines.push('');
                newLines.push(lines[i]);
            } else if (i >= progressStartIdx && i <= progressEndIdx) {
                // Skip these lines as they were moved
            } else {
                newLines.push(lines[i]);
            }
        }
        
        fs.writeFileSync('src/components/Dashboard.tsx', newLines.join('\n'));
        console.log("Moved Progress Section!");
    } else {
        console.log("Could not find progressEndIdx");
    }
} else {
    console.log("Could not find indices");
}
