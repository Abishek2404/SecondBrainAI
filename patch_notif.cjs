const fs = require('fs');
let code = fs.readFileSync('src/components/NotificationsPopover.tsx', 'utf8');

code = code.replace(
    /\{task\.type\} • \{task\.duration\}/,
    `
                      <span className="flex items-center gap-1">
                        {task.type === 'Reading' && <img src="/Reading.png" alt="Reading" className="w-3 h-3 object-contain" />}
                        {task.type === 'Practice' && <img src="/Practise.png" alt="Practice" className="w-3 h-3 object-contain" />}
                        {task.type} • {task.duration}
                      </span>
    `
);

fs.writeFileSync('src/components/NotificationsPopover.tsx', code);
