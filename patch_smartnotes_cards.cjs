const fs = require('fs');
let file = fs.readFileSync('src/components/SmartNotes.tsx', 'utf-8');

const oldCardsRegex = /filteredNotes\.map\(\(note\) => \([\s\S]*?<\/motion\.div>\s*\)\)/;

const newCards = `filteredNotes.map((note) => {
                const sourceDoc = documents.find(d => d._id === note.document);
                const sourceName = sourceDoc?.originalName || "Source Document";
                
                let typeColor = "bg-purple-50 text-purple-600 border-purple-100";
                if (note.type?.toLowerCase().includes("question")) typeColor = "bg-orange-50 text-orange-600 border-orange-100";
                else if (note.type?.toLowerCase().includes("cheat")) typeColor = "bg-blue-50 text-blue-600 border-blue-100";
                else if (note.type?.toLowerCase().includes("mind map") || note.type?.toLowerCase().includes("map")) typeColor = "bg-emerald-50 text-emerald-600 border-emerald-100";

                let icon = <FileText className="h-3.5 w-3.5" />;
                let statText = \`\${note.words || 0} words\`;
                if (note.type?.toLowerCase().includes("question")) {
                  statText = \`\${Math.floor((note.words || 0) / 20) || 5} questions\`;
                } else if (note.type?.toLowerCase().includes("cheat")) {
                  statText = \`\${Math.floor((note.words || 0) / 300) || 1} pages\`;
                } else if (note.type?.toLowerCase().includes("map")) {
                  statText = "1 image";
                  icon = <ImageIcon className="h-3.5 w-3.5" />;
                }

                const dateStr = new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                return (
                  <motion.div 
                    whileHover={{ y: -4 }}
                    key={note._id} 
                    className={\`flex flex-col p-5 rounded-2xl border bg-card hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden \${viewMode === 'list' ? 'h-auto sm:flex-row sm:items-center sm:gap-6' : 'h-[300px]'}\`}
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className={\`flex justify-between items-start mb-4 \${viewMode === 'list' ? 'sm:mb-0 sm:w-48 sm:shrink-0' : ''}\`}>
                      <Badge variant="outline" className={\`font-semibold rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider \${typeColor}\`}>
                        {note.type}
                      </Badge>
                      <div className={\`flex items-center gap-1 \${viewMode === 'list' ? 'sm:hidden' : ''}\`}>
                        {note.importance === 'high' && <Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
                        {!note.importance || note.importance !== 'high' ? <Star className="h-4 w-4 text-muted-foreground/30 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" /> : null}
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <button className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors opacity-0 group-hover:opacity-100 -mr-2" onClick={e => e.stopPropagation()}>
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          } />
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem className="text-red-500 focus:text-red-500 gap-2 rounded-lg" onClick={(e) => { e.stopPropagation(); setItemToDelete(note._id); }}>
                              <Trash className="h-4 w-4" /> Delete Note
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className={\`flex flex-col flex-1 min-w-0 \${viewMode === 'list' ? '' : ''}\`}>
                      <h3 className="font-bold text-lg leading-tight mb-1.5 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {note.title}
                      </h3>
                      
                      <div className="text-[12px] font-medium text-muted-foreground mb-3 truncate">
                        {sourceName}
                      </div>
                      
                      <div className={\`flex-1 overflow-hidden relative \${viewMode === 'list' ? 'hidden sm:block' : ''}\`}>
                        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3">
                          {note.summary || note.content.substring(0, 150)}...
                        </p>
                      </div>
                      
                      <div className={\`mt-4 pt-4 flex items-center justify-between border-t border-border/50 \${viewMode === 'list' ? 'sm:border-t-0 sm:pt-0 sm:mt-0 sm:border-l sm:pl-6 sm:ml-6 sm:w-48 sm:shrink-0 sm:flex-col sm:items-start sm:justify-center sm:gap-2' : ''}\`}>
                         <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            {icon}
                            {statText}
                         </div>
                         <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {dateStr}
                         </div>
                      </div>
                    </div>
                    
                    {viewMode === 'list' && (
                      <div className="hidden sm:flex items-center gap-1 shrink-0 ml-4">
                        {note.importance === 'high' && <Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
                        {!note.importance || note.importance !== 'high' ? <Star className="h-4 w-4 text-muted-foreground/30 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" /> : null}
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <button className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors opacity-0 group-hover:opacity-100" onClick={e => e.stopPropagation()}>
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          } />
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem className="text-red-500 focus:text-red-500 gap-2 rounded-lg" onClick={(e) => { e.stopPropagation(); setItemToDelete(note._id); }}>
                              <Trash className="h-4 w-4" /> Delete Note
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </motion.div>
                )
              })`;

file = file.replace(oldCardsRegex, newCards);
fs.writeFileSync('src/components/SmartNotes.tsx', file);
console.log("Patched cards");
