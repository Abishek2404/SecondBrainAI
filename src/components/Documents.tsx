import { apiFetch } from '../lib/api';
import React, { useState, useEffect, useRef } from "react";
import { FileText, Folder, MoreVertical, Search, Plus, Filter, SortDesc, Download, Trash, Share2, Edit2, ChevronLeft, ExternalLink } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { Input } from "./ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";

export function Documents() {
  const [folders, setFolders] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'document' | 'folder'} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFolders = async () => {
    try {
      const res = await apiFetch('/api/folders');
      if (res.ok) {
        const data = await res.json();
        setFolders(data.data);
      }
    } catch (error) {
      console.error("Error fetching folders", error);
    }
  };

  const fetchDocuments = async (folderId?: string) => {
    try {
      let url = '/api/documents';
      if (folderId) url += `?folderId=${folderId}`;
      else if (currentFolder) url += `?folderId=${currentFolder._id}`;

      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.data);
      }
    } catch (error) {
      console.error("Error fetching documents", error);
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchDocuments();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [currentFolder]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const res = await apiFetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName }),
      });
      if (res.ok) {
        toast.success("Folder created");
        setNewFolderName("");
        setCreateFolderOpen(false);
        fetchFolders();
      } else {
        toast.error("Failed to create folder");
      }
    } catch (error) {
      toast.error("Failed to create folder");
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    if (currentFolder) {
      formData.append('folderId', currentFolder._id);
    }

    const uploadToast = toast.loading("Uploading document...");
    
    try {
      const res = await apiFetch('/api/documents', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        toast.success("Document uploaded successfully", { id: uploadToast });
        fetchDocuments();
        fetchFolders(); // update counts
      } else {
        const data = await res.json();
        toast.error(data.error || "Upload failed", { id: uploadToast });
      }
    } catch (error) {
      toast.error("Upload failed", { id: uploadToast });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    await uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await uploadFile(file);
    }
  };

  const handleDeleteDocument = async (id: string) => {

    try {
      const res = await apiFetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Document deleted");
        fetchDocuments();
        fetchFolders();
      } else {
        toast.error("Failed to delete document");
      }
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };

  const handleRenameDocument = async (id: string, currentName: string) => {
    const newTitle = prompt("Enter new name:", currentName);
    if (!newTitle) return;

    try {
      const res = await apiFetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      
      if (res.ok) {
        toast.success("Document renamed");
        fetchDocuments();
      } else {
        toast.error("Failed to rename document");
      }
    } catch (error) {
      toast.error("Failed to rename document");
    }
  };

  const handleDeleteFolder = async (id: string) => {
    
    try {
      const res = await apiFetch(`/api/folders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Folder deleted");
        fetchFolders();
        if (currentFolder?._id === id) setCurrentFolder(null);
      } else {
        toast.error("Failed to delete folder");
      }
    } catch (error) {
      toast.error("Failed to delete folder");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className={`relative p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 transition-colors ${isDragging ? 'bg-primary/5 border-2 border-dashed border-primary rounded-xl' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
          <div className="flex flex-col items-center p-8 bg-card border rounded-2xl shadow-xl">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <Download className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-2">Drop to Upload</h3>
            <p className="text-muted-foreground">Release your file here to save it to your documents.</p>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Documents</h1>
          <p className="text-muted-foreground">Manage and organize all your study materials.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="flex-1 sm:flex-none gap-2" onClick={() => setCreateFolderOpen(true)}>
            <Folder className="h-4 w-4" />
            New Folder
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
          />
          <Button className="flex-1 sm:flex-none gap-2 shadow-sm" onClick={() => fileInputRef.current?.click()}>
            <Plus className="h-4 w-4" />
            Upload File
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b pb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search documents by name, content, or tags..." 
            className="pl-9 bg-card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="shrink-0"><Filter className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" className="shrink-0"><SortDesc className="h-4 w-4" /></Button>
      </div>

      {currentFolder ? (
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setCurrentFolder(null)} className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Back to root
          </Button>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{currentFolder.name}</h2>
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Folders</h2>
          {folders.length === 0 ? (
            <div className="text-muted-foreground text-sm py-4">No folders yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {folders.map(f => (
                <div 
                  key={f._id} 
                  className="flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/50 cursor-pointer transition-colors group shadow-sm"
                  onClick={() => setCurrentFolder(f)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Folder className="h-8 w-8 text-blue-500 fill-blue-500/20 group-hover:scale-110 transition-transform shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm truncate">{f.name}</span>
                      <span className="text-xs text-muted-foreground">{f.files} files</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setItemToDelete({ id: f._id, type: 'folder' }); }}>
                    <Trash className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 mt-4">
          {currentFolder ? 'Folder Files' : 'All Files'}
        </h2>
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground border-b text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Size</th>
                <th className="px-6 py-3">Date Added</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No documents found. Upload a file to get started.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc._id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <button onClick={() => setPreviewDoc(doc)} className="hover:underline text-primary truncate max-w-[200px] sm:max-w-xs text-left">
                        {doc.title}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="font-normal">{doc.subject}</Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{formatSize(doc.size)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" render={
                            <a href={doc.url} download={doc.originalName} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" /> Download
                            </a>
                          } />
                          <DropdownMenuItem className="gap-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRenameDocument(doc._id, doc.title); }}>
                            <Edit2 className="h-4 w-4" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500 gap-2 focus:text-red-500" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setItemToDelete({ id: doc._id, type: 'document' }); }}>
                            <Trash className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
            <DialogDescription>
              Details and metadata for this document.
            </DialogDescription>
          </DialogHeader>
          {previewDoc && (
            <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-dashed my-2">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg truncate w-full text-center">{previewDoc.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">{formatSize(previewDoc.size)} • {new Date(previewDoc.createdAt).toLocaleDateString()}</p>
              
              <div className="w-full grid grid-cols-2 gap-4 text-sm mt-2">
                <div className="bg-background p-3 rounded border">
                  <div className="text-muted-foreground text-xs mb-1">Subject</div>
                  <div className="font-medium">{previewDoc.subject}</div>
                </div>
                <div className="bg-background p-3 rounded border">
                  <div className="text-muted-foreground text-xs mb-1">File Type</div>
                  <div className="font-medium truncate">{previewDoc.mimeType?.split('/')[1]?.toUpperCase() || 'Document'}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-between flex-row">
            <Button variant="secondary" onClick={() => setPreviewDoc(null)}>Close</Button>
            <div className="flex gap-2">
              <a href={previewDoc?.url} download={previewDoc?.originalName} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline" })}>
                <Download className="w-4 h-4 mr-2" /> Download
              </a>
              <a href={previewDoc?.url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "default" })}>
                <ExternalLink className="w-4 h-4 mr-2" /> Open
              </a>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    
      <ConfirmDialog 
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title={itemToDelete?.type === 'document' ? "Delete Document" : "Delete Folder"}
        description={itemToDelete?.type === 'document' 
          ? "Are you sure you want to delete this document? This action cannot be undone."
          : "Are you sure you want to delete this folder? Any documents inside will be moved to the root level. This action cannot be undone."
        }
        confirmText="Delete"
        destructive={true}
        onConfirm={() => {
          if (itemToDelete?.type === 'document') {
            handleDeleteDocument(itemToDelete.id);
          } else if (itemToDelete?.type === 'folder') {
            handleDeleteFolder(itemToDelete.id);
          }
          setItemToDelete(null);
        }}
      />

      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder to organize documents.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. History Notes"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateFolderOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
