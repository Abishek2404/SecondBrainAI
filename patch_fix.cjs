const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const oldStr = `         </div>
      </div>
      
      {/* Bottom Section */}`;

const newStr = `         </div>
      </div>
      </div>
      
      {/* Bottom Section */}`;

code = code.replace(oldStr, newStr);
fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log("Patched correctly");
