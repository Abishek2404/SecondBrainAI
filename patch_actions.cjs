const fs = require('fs');
let code = fs.readFileSync('src/components/Documents.tsx', 'utf-8');

const targetActions = `
              <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Actions</h4>
                <div className="flex justify-between gap-2">
                   <button onClick={() => setMoveDocState({ id: previewDoc._id, open: true })} className="flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-[16px] border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                     <Folder className="w-5 h-5 text-slate-600" />
                     <span className="text-[11px] font-bold text-slate-700">Move</span>
                   </button>
                   <button onClick={() => setRenameState({ id: previewDoc._id, name: previewDoc.title, type: 'document', open: true })} className="flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-[16px] border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                     <Edit2 className="w-5 h-5 text-slate-600" />
                     <span className="text-[11px] font-bold text-slate-700">Rename</span>
                   </button>
                   <button className="flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-[16px] border border-red-100 bg-red-50 hover:bg-red-100 transition-colors">
                     <Trash className="w-5 h-5 text-red-500" />
                     <span className="text-[11px] font-bold text-red-600">Delete</span>
                   </button>
                </div>
              </div>
`;

const newActions = `
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
              </div>
              
              <div className="mb-8">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Actions</h4>
                <div className="flex justify-between gap-2">
                   <button onClick={() => setRenameState({ id: previewDoc._id, name: previewDoc.title, type: 'document', open: true })} className="flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-[16px] border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                     <Edit2 className="w-5 h-5 text-slate-600" />
                     <span className="text-[11px] font-bold text-slate-700">Rename</span>
                   </button>
                   <button onClick={() => handleDeleteDocument(previewDoc._id)} className="flex-1 flex flex-col items-center justify-center gap-2 p-3 rounded-[16px] border border-red-100 bg-red-50 hover:bg-red-100 transition-colors">
                     <Trash className="w-5 h-5 text-red-500" />
                     <span className="text-[11px] font-bold text-red-600">Delete</span>
                   </button>
                </div>
              </div>
`;

code = code.replace(targetActions.trim(), newActions.trim());
fs.writeFileSync('src/components/Documents.tsx', code);
