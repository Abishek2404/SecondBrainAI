import { apiFetch } from '../lib/api';
import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, Folder, MoreVertical, Search, Plus, Filter, 
  Download, Trash, Edit2, ChevronLeft, ExternalLink, 
  LayoutGrid, List, FileType, CheckCircle2, CloudUpload, Clock,
  Image as ImageIcon, FileSpreadsheet, File
} from "lucide-react";
import { Button, buttonVariants } from "./ui/button";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { Input } from "./ui/input";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { useStreak } from "./StreakProvider";
import { motion, AnimatePresence } from "motion/react";

import { DashboardCardSkeleton, DataTableSkeleton, FolderSkeleton, DocumentCardSkeleton } from "./Skeletons";


const getColorClasses = (color) => {
  const map = {
    indigo: { text: 'text-indigo-500', fill: 'fill-indigo-500/20', bg: 'bg-indigo-500/10' },
    emerald: { text: 'text-emerald-500', fill: 'fill-emerald-500/20', bg: 'bg-emerald-500/10' },
    rose: { text: 'text-rose-500', fill: 'fill-rose-500/20', bg: 'bg-rose-500/10' },
    amber: { text: 'text-amber-500', fill: 'fill-amber-500/20', bg: 'bg-amber-500/10' },
    blue: { text: 'text-blue-500', fill: 'fill-blue-500/20', bg: 'bg-blue-500/10' },
    purple: { text: 'text-purple-500', fill: 'fill-purple-500/20', bg: 'bg-purple-500/10' },
  };
  return map[color] || map.indigo;
};

export function Documents() {
  const { triggerStreakCheck } = useStreak();
  const [folders, setFolders] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'document' | 'folder'} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("indigo");
  const folderColors = [
    { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
    { name: 'Emerald', value: 'emerald', class: 'bg-emerald-500' },
    { name: 'Rose', value: 'rose', class: 'bg-rose-500' },
    { name: 'Amber', value: 'amber', class: 'bg-amber-500' },
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  ];
  const [moveDocState, setMoveDocState] = useState<{ id: string, open: boolean }>({ id: "", open: false });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadingFiles, setUploadingFiles] = useState<{name: string, progress: number}[]>([]);
  const [loading, setLoading] = useState(true);
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
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([fetchFolders(), fetchDocuments()]);
      setLoading(false);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const loadFolderDocs = async () => {
       setLoading(true);
       await fetchDocuments();
       setLoading(false);
    };
    if (currentFolder !== null) {
       loadFolderDocs();
    }
  }, [currentFolder]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const res = await apiFetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName, color: newFolderColor }),
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

    const fileUploadState = { name: file.name, progress: 0 };
    setUploadingFiles(prev => [...prev, fileUploadState]);
    
    // Simulate progress for UI
    const progressInterval = setInterval(() => {
      setUploadingFiles(prev => prev.map(u => 
        u.name === file.name && u.progress < 90 ? { ...u, progress: u.progress + 10 } : u
      ));
    }, 200);

    try {
      const res = await apiFetch('/api/documents', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      setUploadingFiles(prev => prev.map(u => u.name === file.name ? { ...u, progress: 100 } : u));
      
      if (res.ok) {
        toast.success(`Uploaded ${file.name}`);
        fetchDocuments();
        fetchFolders();
        triggerStreakCheck('document');
      } else {
        const data = await res.json();
        toast.error(data.error || "Upload failed");
      }
    } catch (error) {
      clearInterval(progressInterval);
      toast.error("Upload failed");
    } finally {
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(u => u.name !== file.name));
      }, 1000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    for (let i = 0; i < e.target.files.length; i++) {
       await uploadFile(e.target.files[i]);
    }
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
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        await uploadFile(e.dataTransfer.files[i]);
      }
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

  const handleMoveDocument = async (id: string, targetFolderId: string | 'root') => {
    try {
      const res = await apiFetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId: targetFolderId }),
      });
      
      if (res.ok) {
        toast.success("Document moved");
        fetchDocuments();
        fetchFolders();
      } else {
        toast.error("Failed to move document");
      }
    } catch (error) {
      toast.error("Failed to move document");
    }
  };

  const handleRenameFolder = async (id: string, currentName: string) => {
    const newName = prompt("Enter new name:", currentName);
    if (!newName) return;

    try {
      const res = await apiFetch(`/api/folders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      
      if (res.ok) {
        toast.success("Folder renamed");
        fetchFolders();
        if (currentFolder?._id === id) {
          setCurrentFolder({ ...currentFolder, name: newName });
        }
      } else {
        toast.error("Failed to rename folder");
      }
    } catch (error) {
      toast.error("Failed to rename folder");
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
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.originalName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFolderIcon = (type: string, className: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className={className} />;
      case 'image':
        return <ImageIcon className={className} />;
      case 'text':
      case 'document':
        return <File className={className} />;
      case 'spreadsheet':
        return <FileSpreadsheet className={className} />;
      default:
        return <Folder className={className} />;
    }
  };

  return (
    <div 
      className={`relative p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 min-h-[calc(100vh-4rem)] transition-colors ${isDragging ? 'bg-primary/5' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl m-4 border-2 border-dashed border-primary"
          >
            <div className="flex flex-col items-center p-8 bg-card border rounded-2xl shadow-2xl">
              <div className="p-5 bg-primary/10 rounded-full mb-6">
                <CloudUpload className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">Drop files here</h3>
              <p className="text-muted-foreground">Upload documents to your SecondBrain.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Documents</h1>
          <p className="text-muted-foreground text-sm">Organize and manage your knowledge base.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="flex-1 sm:flex-none gap-2 rounded-xl h-10" onClick={() => setCreateFolderOpen(true)}>
            <Folder className="h-4 w-4 text-indigo-500" />
            New Folder
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
            multiple
          />
          <Button className="flex-1 sm:flex-none gap-2 rounded-xl h-10 bg-foreground hover:bg-foreground/90 text-background" onClick={() => fileInputRef.current?.click()}>
            <Plus className="h-4 w-4" />
            Upload File
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-2 rounded-2xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search documents..." 
            className="pl-9 bg-transparent border-none shadow-none focus-visible:ring-0 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="hidden sm:block w-px h-6 bg-border mx-2" />
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl w-full sm:w-auto shrink-0">
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex-1 sm:flex-none p-1.5 rounded-lg flex justify-center transition-colors ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex-1 sm:flex-none p-1.5 rounded-lg flex justify-center transition-colors ${viewMode === 'list' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          {uploadingFiles.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl border bg-card/50 shadow-sm">
              <div className="flex items-center gap-3 truncate">
                 <FileText className="h-4 w-4 text-primary shrink-0" />
                 <span className="text-sm font-medium truncate">{file.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                 <span className="text-xs text-muted-foreground">{file.progress}%</span>
                 <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                   <div className="h-full bg-primary transition-all duration-300" style={{ width: `${file.progress}%` }} />
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentFolder ? (
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" onClick={() => setCurrentFolder(null)} className="gap-1 hover:bg-muted/50 rounded-xl">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2 text-sm font-semibold">
            {renderFolderIcon(currentFolder.folderType, "h-4 w-4 text-indigo-500 fill-indigo-500/20")}
            {currentFolder.name}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">Folders</h2>
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                <FolderSkeleton />
                <FolderSkeleton />
                <FolderSkeleton />
             </div>
          ) : folders.length === 0 ? (
            <div className="text-muted-foreground text-sm py-4 pl-1">No folders yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {folders.map(f => (
                <motion.div 
                  whileHover={{ y: -2 }}
                  key={f._id} 
                  className="flex items-center justify-between p-3.5 rounded-2xl border bg-card hover:shadow-md cursor-pointer transition-all group"
                  onClick={() => setCurrentFolder(f)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {renderFolderIcon(f.folderType, `h-8 w-8 ${getColorClasses(f.color).text} ${getColorClasses(f.color).fill} group-hover:scale-110 transition-transform shrink-0`)}
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{f.name}</span>
                      <span className="text-[11px] text-muted-foreground">{f.files} files</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger 
                      onClick={(e) => e.stopPropagation()} 
                      render={
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      } 
                    />
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="rounded-xl">
                      <DropdownMenuItem className="gap-2 rounded-lg" onClick={() => { handleRenameFolder(f._id, f.name); }}>
                        <Edit2 className="h-4 w-4" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-500 gap-2 focus:text-red-500 rounded-lg" onClick={() => { setItemToDelete({ id: f._id, type: 'folder' }); }}>
                        <Trash className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 mt-2">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
          {currentFolder ? 'Folder Documents' : 'All Documents'}
        </h2>
        
        {loading ? (
          viewMode === 'grid' ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <DocumentCardSkeleton />
                <DocumentCardSkeleton />
                <DocumentCardSkeleton />
                <DocumentCardSkeleton />
             </div>
          ) : (
             <DataTableSkeleton />
          )
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-2xl bg-muted/20 text-center">
             <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
               <FileText className="h-6 w-6 text-primary" />
             </div>
             <h3 className="text-lg font-semibold mb-1">No documents found</h3>
             <p className="text-sm text-muted-foreground mb-4">Upload some files to get started.</p>
             <Button variant="outline" className="rounded-xl" onClick={() => fileInputRef.current?.click()}>
               Upload Document
             </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDocs.map((doc) => (
              <motion.div 
                whileHover={{ y: -2 }}
                key={doc._id} 
                className="flex flex-col rounded-2xl border bg-card p-4 hover:shadow-md transition-all group cursor-pointer"
                onClick={() => setPreviewDoc(doc)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-[10px] tracking-wider shadow-sm
                    ${doc.type === 'pdf' ? 'bg-red-500' : doc.type === 'txt' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                    {doc.type === 'pdf' ? 'PDF' : doc.type === 'txt' ? 'TXT' : 'DOC'}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} render={
                      <button className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    } />
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="rounded-xl">
                      <DropdownMenuItem className="gap-2 rounded-lg" render={
                        <a href={doc.url} download={doc.originalName} target="_blank" rel="noopener noreferrer" className="flex w-full items-center gap-2">
                          <Download className="h-4 w-4" /> Download
                        </a>
                      } />
                      <DropdownMenuItem className="gap-2 rounded-lg" onClick={() => { handleRenameDocument(doc._id, doc.title); }}>
                        <Edit2 className="h-4 w-4" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 rounded-lg" onClick={() => { setMoveDocState({ id: doc._id, open: true }); }}>
                        <Folder className="h-4 w-4" /> Move
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-500 gap-2 focus:text-red-500 rounded-lg" onClick={() => { setItemToDelete({ id: doc._id, type: 'document' }); }}>
                        <Trash className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <h3 className="font-semibold text-sm line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors flex-1">
                  {doc.title}
                </h3>
                
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                    <CheckCircle2 className="h-3 w-3" /> Ready
                  </div>
                  <span>{formatSize(doc.size)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-muted/50 text-muted-foreground border-b text-[11px] uppercase font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4">Date Added</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDocs.map((doc) => (
                  <tr key={doc._id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => setPreviewDoc(doc)}>
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-[8px] tracking-wider shrink-0
                        ${doc.type === 'pdf' ? 'bg-red-500' : doc.type === 'txt' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                        {doc.type === 'pdf' ? 'PDF' : doc.type === 'txt' ? 'TXT' : 'DOC'}
                      </div>
                      <span className="hover:underline group-hover:text-primary truncate max-w-[200px] sm:max-w-xs transition-colors">
                        {doc.title}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">{formatSize(doc.size)}</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="rounded-xl">
                          <DropdownMenuItem className="gap-2 rounded-lg" render={
                            <a href={doc.url} download={doc.originalName} target="_blank" rel="noopener noreferrer" className="flex w-full items-center gap-2">
                              <Download className="h-4 w-4" /> Download
                            </a>
                          } />
                          <DropdownMenuItem className="gap-2 rounded-lg" onClick={() => { handleRenameDocument(doc._id, doc.title); }}>
                            <Edit2 className="h-4 w-4" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 rounded-lg" onClick={() => { setMoveDocState({ id: doc._id, open: true }); }}>
                            <Folder className="h-4 w-4" /> Move
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500 gap-2 focus:text-red-500 rounded-lg" onClick={() => { setItemToDelete({ id: doc._id, type: 'document' }); }}>
                            <Trash className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-3xl p-0 overflow-hidden border-0">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-white/10 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
             <div className={`h-20 w-20 rounded-2xl flex items-center justify-center text-white font-bold text-xl tracking-wider shadow-xl z-10 mb-4 border border-white/20
                ${previewDoc?.type === 'pdf' ? 'bg-red-500' : previewDoc?.type === 'txt' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                {previewDoc?.type === 'pdf' ? 'PDF' : previewDoc?.type === 'txt' ? 'TXT' : 'DOC'}
             </div>
             <h3 className="font-bold text-xl truncate w-full text-center z-10">{previewDoc?.title}</h3>
             <p className="text-white/80 mt-2 text-sm z-10 flex items-center gap-2">
               {formatSize(previewDoc?.size)} <span className="w-1 h-1 rounded-full bg-white/50" /> {new Date(previewDoc?.createdAt || Date.now()).toLocaleDateString()}
             </p>
          </div>
          <div className="p-6 bg-card flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl border bg-background hover:bg-muted transition-colors">
                 <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                   <Download className="h-5 w-5 text-primary" />
                 </div>
                 <span className="text-sm font-medium text-foreground">Download</span>
               </button>
               <button className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-2xl border bg-background hover:bg-muted transition-colors">
                 <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                   <ExternalLink className="h-5 w-5 text-indigo-500" />
                 </div>
                 <span className="text-sm font-medium text-foreground">View Original</span>
               </button>
            </div>
            
            <div className="bg-muted/50 rounded-2xl p-4 flex flex-col gap-3">
               <div className="flex items-center justify-between">
                 <span className="text-sm font-medium">AI Status</span>
                 <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full text-xs font-medium">
                   <CheckCircle2 className="h-3.5 w-3.5" /> Ready for Analysis
                 </div>
               </div>
               <div className="text-xs text-muted-foreground leading-relaxed">
                 This document has been processed and is ready to be used in AI Chat, Quizzes, and Flashcards.
               </div>
            </div>
          </div>
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
        <DialogContent className="sm:max-w-md rounded-2xl">
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
              className="rounded-xl h-12 mb-4"
            />
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">Subject Color</span>
              <div className="flex gap-2">
                {folderColors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setNewFolderColor(c.value)}
                    className={`h-8 w-8 rounded-full ${c.class} transition-all ${newFolderColor === c.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'opacity-70 hover:opacity-100'}`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setCreateFolderOpen(false)}>Cancel</Button>
            <Button className="rounded-xl" onClick={handleCreateFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={moveDocState.open} onOpenChange={(open) => setMoveDocState({ ...moveDocState, open })}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Move Document</DialogTitle>
            <DialogDescription>
              Select a destination folder for this document.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 flex flex-col gap-1 max-h-[50vh] overflow-y-auto">
            <div 
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted cursor-pointer border border-transparent hover:border-border transition-colors"
              onClick={() => {
                handleMoveDocument(moveDocState.id, 'root');
                setMoveDocState({ id: "", open: false });
              }}
            >
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Folder className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="font-medium text-sm">Root Directory</span>
            </div>
            {folders.map(f => (
              <div 
                key={f._id} 
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted cursor-pointer border border-transparent hover:border-border transition-colors"
                onClick={() => {
                  handleMoveDocument(moveDocState.id, f._id);
                  setMoveDocState({ id: "", open: false });
                }}
              >
                <div className={`h-8 w-8 rounded-lg ${getColorClasses(f.color).bg} flex items-center justify-center shrink-0`}>
                  {renderFolderIcon(f.folderType, `h-4 w-4 ${getColorClasses(f.color).text} ${getColorClasses(f.color).fill}`)}
                </div>
                <span className="font-medium text-sm">{f.name}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
