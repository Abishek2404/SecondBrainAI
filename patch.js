const fs = require('fs');
let code = fs.readFileSync('src/components/Documents.tsx', 'utf8');

const oldContent = `              className="rounded-xl h-12"
            />
          </div>
          <DialogFooter>`;

const newContent = `              className="rounded-xl h-12 mb-4"
            />
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">Subject Color</span>
              <div className="flex gap-2">
                {folderColors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setNewFolderColor(c.value)}
                    className={\`h-8 w-8 rounded-full \${c.class} transition-all \${newFolderColor === c.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'opacity-70 hover:opacity-100'}\`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>`;

code = code.replace(oldContent, newContent);
fs.writeFileSync('src/components/Documents.tsx', code);
