import { apiFetch } from '../lib/api';
import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, Folder, MoreVertical, Search, Plus, Filter, 
  Download, Trash, Edit2, ChevronLeft, ExternalLink, 
  LayoutGrid, List, FileType, CheckCircle2, CloudUpload, Clock,
  Image as ImageIcon, FileSpreadsheet, File, X, ZoomIn, ZoomOut, Maximize,
  Share2, ArrowRightLeft, PenTool, Loader2, Paperclip, 
  ChevronDown, Minus, Upload
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
  const [previewDocInfo, setPreviewDocInfo] = useState<{ notesCount: number; summary: string } | null>(null);
  const [loadingPreviewInfo, setLoadingPreviewInfo] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("indigo");
  const [activeTab, setActiveTab] = useState("All Documents");
  const [sidebarTab, setSidebarTab] = useState("Details");
  const [newTag, setNewTag] = useState("");
  const [addingTagTo, setAddingTagTo] = useState<string | null>(null);
  
  const folderColors = [
    { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
    { name: 'Emerald', value: 'emerald', class: 'bg-emerald-500' },
    { name: 'Rose', value: 'rose', class: 'bg-rose-500' },
    { name: 'Amber', value: 'amber', class: 'bg-amber-500' },
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  ];
  const [moveDocState, setMoveDocState] = useState<{ id: string, open: boolean }>({ id: "", open: false });
  const [renameState, setRenameState] = useState<{ id: string, name: string, type: 'document' | 'folder', open: boolean }>({ id: "", name: "", type: "document", open: false });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');
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

  
  useEffect(() => {
    if (previewDoc) {
      setLoadingPreviewInfo(true);
      setPreviewDocInfo(null);
      apiFetch(`/api/documents/${previewDoc._id}/info`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPreviewDocInfo(data.data);
          }
        })
        .finally(() => {
          setLoadingPreviewInfo(false);
        });
    } else {
      setPreviewDocInfo(null);
    }
  }, [previewDoc]);

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
        if (previewDoc?._id === id) setPreviewDoc(null);
      } else {
        toast.error("Failed to delete document");
      }
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };

  const handleRenameSubmit = () => {
    if (renameState.type === 'document') {
      handleRenameDocument(renameState.id, renameState.name);
    } else {
      handleRenameFolder(renameState.id, renameState.name);
    }
    setRenameState({ ...renameState, open: false });
  };

  const handleRenameDocument = async (id: string, newTitle: string) => {
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
        if (previewDoc?._id === id) {
          setPreviewDoc({ ...previewDoc, title: newTitle });
        }
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

  const handleRenameFolder = async (id: string, newName: string) => {
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
    (doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.originalName?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (activeTab === 'All Documents' || 
     (activeTab === 'PDF' && doc.originalName?.toLowerCase().endsWith('.pdf')) ||
     (activeTab === 'Images' && ['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(doc.originalName?.toLowerCase().split('.').pop() || '')) ||
     (activeTab === 'Others' && !doc.originalName?.toLowerCase().endsWith('.pdf') && !['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(doc.originalName?.toLowerCase().split('.').pop() || ''))
    )
  );

  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'name') return a.title.localeCompare(b.title);
    if (sortBy === 'size') return b.size - a.size;
    return 0;
  });

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

  const fileTypeTabs = [
    { name: "All Documents", count: documents.length },
    { name: "PDF", count: documents.filter(d => d.originalName?.toLowerCase().endsWith('.pdf')).length },
    { name: "Images", count: documents.filter(d => ['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(d.originalName?.toLowerCase().split('.').pop() || '')).length },
    { name: "Others", count: documents.filter(d => !d.originalName?.toLowerCase().endsWith('.pdf') && !['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(d.originalName?.toLowerCase().split('.').pop() || '')).length },
  ];

  return (
    <div className="flex h-full w-full bg-[#FAFAFA] overflow-hidden">
      <div 
        className={`flex-1 flex flex-col relative transition-all duration-300 ${isDragging ? 'bg-indigo-50/50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <AnimatePresence>
          {isDragging && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm m-6 rounded-3xl border-2 border-dashed border-indigo-400 shadow-2xl"
            >
              <div className="flex flex-col items-center">
                <div className="p-6 bg-indigo-50 rounded-full mb-6">
                  <CloudUpload className="w-16 h-16 text-indigo-500" />
                </div>
                <h3 className="text-3xl font-bold tracking-tight mb-2 text-slate-800">Drop files to upload</h3>
                <p className="text-slate-500">Add documents to your SecondBrain.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 md:p-8 max-w-[1200px] w-full mx-auto flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-[28px] font-bold text-slate-900 tracking-tight mb-1">Documents</h1>
              <p className="text-slate-500 text-[15px]">Manage and organize all your study materials in one place.</p>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
                multiple
              />
              <Button className="gap-2 rounded-xl h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 shadow-sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                Upload File
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search documents by name or content..." 
                className="pl-10 h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-indigo-500 text-[15px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="h-11 rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm px-4 gap-2 font-semibold inline-flex items-center hover:bg-slate-50 transition-colors flex-1 sm:flex-none justify-center">
                  <ArrowRightLeft className="h-4 w-4 text-slate-400 rotate-90" /> 
                  Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)} 
                  <ChevronDown className="h-4 w-4 text-slate-400 ml-1" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest First</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('oldest')}>Oldest First</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name')}>Name (A-Z)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('size')}>Size (Largest)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex p-1 bg-white border border-slate-200 rounded-xl shadow-sm shrink-0">
                 <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700'}`}>
                   <LayoutGrid className="h-4 w-4" />
                 </button>
                 <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700'}`}>
                   <List className="h-4 w-4" />
                 </button>
              </div>
            </div>
          </div>


          <div className="border-b border-slate-200 mb-6 flex gap-6 overflow-x-auto hide-scrollbar">
             {fileTypeTabs.map(tab => (
               <button 
                 key={tab.name}
                 onClick={() => setActiveTab(tab.name)}
                 className={`pb-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                   activeTab === tab.name ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'
                 }`}
               >
                 {activeTab === tab.name ? (
                   <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs ml-0 inline-flex items-center">
                     {tab.name} ({tab.count})
                   </span>
                 ) : (
                   <span>{tab.name} ({tab.count})</span>
                 )}
               </button>
             ))}
          </div>

          {viewMode === 'list' ? (
            <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-4 text-[13px] font-bold text-slate-500">Name</th>
                      <th className="px-6 py-4 text-[13px] font-bold text-slate-500">Type</th>
                      <th className="px-6 py-4 text-[13px] font-bold text-slate-500">Size</th>
                      <th className="px-6 py-4 text-[13px] font-bold text-slate-500">Added On</th>
                      <th className="px-6 py-4 text-[13px] font-bold text-slate-500">Status</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                  {sortedDocs.map((doc, idx) => {
                    const isPdf = doc.originalName?.toLowerCase().endsWith('.pdf');
                    const ext = doc.originalName?.split('.').pop()?.toUpperCase() || 'FILE';
                    const folder = folders.find(f => f._id === doc.folderId || f._id === doc.folder);
                    const isReady = doc.status === 'ready';

                    return (
                    <tr key={idx} onClick={() => setPreviewDoc(doc)} className={`cursor-pointer hover:bg-slate-50 transition-colors ${previewDoc?._id === doc._id ? 'bg-indigo-50/50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {isPdf ? (
                            <img src="/pdf.svg.webp" alt="PDF" className="w-8 h-8 object-contain" />
                          ) : (
                            <img src="/Doc%20File.png" alt="Doc" className="w-8 h-8 object-contain" />
                          )}
                          <div>
                            <div className="font-bold text-[14px] text-slate-800">{doc.title}</div>
                            
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-slate-600 font-medium">{ext}</td>
                      <td className="px-6 py-4 text-[14px] text-slate-600 font-medium">{formatSize(doc.size)}</td>
                      <td className="px-6 py-4">
                        <div className="text-[13px] text-slate-800 font-medium leading-tight whitespace-pre-line">{new Date(doc.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        {isReady ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold">
                            Ready
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold">
                            <Loader2 className="w-3 h-3 animate-spin" /> Processing
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-2 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                            <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameState({ id: doc._id, name: doc.title, type: 'document', open: true }); }}>
                               <Edit2 className="h-4 w-4 mr-2" /> Rename
                             </DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem className="text-red-600 focus:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc._id); }}>
                               <Trash className="h-4 w-4 mr-2" /> Delete
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
              </div>
              
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <span className="text-[13px] font-medium text-slate-500">Showing {sortedDocs.length} documents</span>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedDocs.map((doc, idx) => {
                  const isPdf = doc.originalName?.toLowerCase().endsWith('.pdf');
                  const ext = doc.originalName?.split('.').pop()?.toUpperCase() || 'FILE';
                  const folder = folders.find(f => f._id === doc.folderId || f._id === doc.folder);
                  const isReady = doc.status === 'ready';

                  return (
                    <div 
                      key={idx} 
                      onClick={() => setPreviewDoc(doc)} 
                      className={`relative flex flex-col bg-white border rounded-[20px] shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all group ${previewDoc?._id === doc._id ? 'border-indigo-500 ring-1 ring-indigo-500/20' : 'border-slate-200 hover:border-indigo-100'}`}
                    >
                      <div className="absolute top-3 right-3 z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-2 bg-white/80 backdrop-blur-sm shadow-sm text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); }}>
                            <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameState({ id: doc._id, name: doc.title, type: 'document', open: true }); }}>
                               <Edit2 className="h-4 w-4 mr-2" /> Rename
                             </DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem className="text-red-600 focus:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc._id); }}>
                               <Trash className="h-4 w-4 mr-2" /> Delete
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="h-32 bg-slate-50 flex items-center justify-center border-b border-slate-100">
                        {isPdf ? (
                          <img src="/pdf.svg.webp" alt="PDF" className="w-16 h-16 object-contain" />
                        ) : (
                          <img src="/Doc%20File.png" alt="Doc" className="w-16 h-16 object-contain" />
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <div className="font-bold text-[15px] text-slate-800 mb-1 truncate pr-8">{doc.title}</div>
                        <div className="flex items-center gap-2 mb-3">
                          {isReady ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                          )}
                        </div>
                        
                        
                        
                        <div className="mt-auto flex items-center justify-between text-[12px] font-medium text-slate-400">
                          <span>{ext} • {formatSize(doc.size)}</span>
                          <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 px-2">
                <span className="text-[13px] font-medium text-slate-500">Showing {sortedDocs.length} documents</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Sidebar Preview */}
      <AnimatePresence>
        {previewDoc && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", maxWidth: "400px", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-slate-200 bg-white flex flex-col h-full shadow-[-4px_0_24px_rgba(0,0,0,0.02)] overflow-hidden shrink-0 absolute md:relative right-0 top-0 bottom-0 z-20"
          >
            <div className="p-6 pb-0 overflow-y-auto flex-1 hide-scrollbar w-full md:w-[400px]">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-[20px] text-slate-900 leading-tight pr-4">{previewDoc.title}</h3>
                <button onClick={() => setPreviewDoc(null)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 rounded-lg shrink-0 mt-[-4px] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-3 text-[13px] text-slate-500 font-medium mb-6">
                {previewDoc.originalName?.toLowerCase().endsWith('.pdf') ? (
                  <img src="/pdf.svg.webp" alt="PDF" className="w-4 h-4 object-contain" />
                ) : (
                  <img src="/Doc%20File.png" alt="Doc" className="w-4 h-4 object-contain" />
                )}
                <span>{previewDoc.originalName?.split('.').pop()?.toUpperCase() || 'FILE'}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>{formatSize(previewDoc.size)}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>Added on {new Date(previewDoc.createdAt).toLocaleDateString()}</span>
              </div>
              

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
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Last modified</span>
                    <span className="font-semibold text-slate-700">{new Date(previewDoc.createdAt).toLocaleDateString()}</span>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      

      

      <Dialog open={renameState.open} onOpenChange={(open) => setRenameState({ ...renameState, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {renameState.type === 'folder' ? 'Folder' : 'Document'}</DialogTitle>
            <DialogDescription>
              Enter a new name for this {renameState.type}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="rename" className="text-sm font-medium text-slate-700">New Name</label>
              <Input
                id="rename"
                value={renameState.name}
                onChange={(e) => setRenameState({ ...renameState, name: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleRenameSubmit();
                  }
                }}
                className="col-span-3 rounded-xl"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setRenameState({ ...renameState, open: false })}>Cancel</Button>
            <Button className="rounded-xl bg-slate-900 text-white" onClick={handleRenameSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
