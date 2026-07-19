const fs = require('fs');
let code = fs.readFileSync('src/components/Documents.tsx', 'utf-8');

const targetInfo = `
              <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Document Info</h4>
                <div className="flex flex-col gap-4 text-[13px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Folder</span>
                    <span className="bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded-md">{folders.find(f => f._id === previewDoc.folderId || f._id === previewDoc.folder)?.name || 'None'}</span>
                  </div>
`;

const replacementInfo = `
              <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Document Info</h4>
                <div className="flex flex-col gap-4 text-[13px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Notes created</span>
                    {loadingPreviewInfo ? (
                      <span className="text-slate-400"><Loader2 className="w-3 h-3 animate-spin" /></span>
                    ) : (
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded-md">{previewDocInfo?.notesCount || 0}</span>
                    )}
                  </div>
`;

code = code.replace(targetInfo, replacementInfo);

const targetSummary = `                            onKeyDown={e => {                              if (e.key === 'Enter') handleAddTag(previewDoc._id, previewDoc.tags || []);                            }}                          />                          <button onClick={() => setAddingTagTo(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400"><X className="w-3 h-3" /></button>                        </div>                      ) : (                        <button onClick={() => setAddingTagTo(previewDoc._id)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded-md border border-dashed border-indigo-200 transition-colors">                          + Add tag                        </button>                      )}                    </div>                  </div>                </div>              </div>`;

const newSummary = `                            onKeyDown={e => {
                              if (e.key === 'Enter') handleAddTag(previewDoc._id, previewDoc.tags || []);
                            }}
                          />
                          <button onClick={() => setAddingTagTo(null)} className="p-1 hover:bg-slate-100 rounded text-slate-400"><X className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <button onClick={() => setAddingTagTo(previewDoc._id)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded-md border border-dashed border-indigo-200 transition-colors">
                          + Add tag
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-900 mb-4">AI Summary</h4>
                <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed border border-slate-100">
                  {loadingPreviewInfo ? (
                    <div className="flex items-center justify-center py-4">
                       <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    </div>
                  ) : (
                    previewDocInfo?.summary || "No summary available."
                  )}
                </div>
              </div>`;

// Since it's hard to match exactly with spaces, I'll use regex for the summary block
const regexSummary = /<button onClick=\{\(\) => setAddingTagTo\(previewDoc\._id\)\} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded-md border border-dashed border-indigo-200 transition-colors">\s*\+ Add tag\s*<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div className="mb-8">/m;

code = code.replace(regexSummary, (match) => {
    return `                        <button onClick={() => setAddingTagTo(previewDoc._id)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded-md border border-dashed border-indigo-200 transition-colors">                          + Add tag                        </button>                      )}                    </div>                  </div>                </div>              </div>                            <div className="mb-8">                <h4 className="text-sm font-bold text-slate-900 mb-4">AI Summary</h4>                <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed border border-slate-100">                  {loadingPreviewInfo ? (                    <div className="flex items-center justify-center py-4">                       <Loader2 className="w-5 h-5 animate-spin text-slate-400" />                    </div>                  ) : (                    previewDocInfo?.summary || "No summary available."                  )}                </div>              </div>              <div className="mb-8">`;
});

fs.writeFileSync('src/components/Documents.tsx', code);
