import { apiFetch } from '../lib/api';
import { LayoutGrid, List, Star, Image as ImageIcon, BookOpen, Search, Plus, Sparkles, Filter, MoreVertical, FileText, Trash, Edit2, Save, Loader2, Tag, X, AlertCircle, Maximize2, Minimize2, Check } from "lucide-react";
import { Button } from "./ui/button";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { DocumentCardSkeleton } from "./Skeletons";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';

export function SmartNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generation state
  const [selectedDoc, setSelectedDoc] = useState("");
  const [noteType, setNoteType] = useState("Summary");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter state
  const [filterType, setFilterType] = useState<string>("all");
  const [filterImportance, setFilterImportance] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("latest");
  const [viewMode, setViewMode] = useState<"grid"|"list">("grid");
  const [activeCategory, setActiveCategory] = useState<string>("All Notes");
  const [filterSubject, setFilterSubject] = useState<string>("all");

  // Tag input state
  const [tagInput, setTagInput] = useState("");

  // View state
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Edit & Auto-save state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedNote) {
      setEditContent(selectedNote.content);
      setIsEditing(false);
      setLastSaved(null);
    }
  }, [selectedNote]);

  const saveNote = async (content: string, noteId: string) => {
    setIsSaving(true);
    try {
      const res = await apiFetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        setLastSaved(new Date());
        setNotes(prev => prev.map(n => n._id === noteId ? { ...n, content, summary: content.substring(0, 150) + '...' } : n));
      }
    } catch (error) {
      console.error("Failed to auto-save note", error);
    } finally {
      setIsSaving(false);
    }
  };

    const saveNoteImportance = async (importance: string, noteId: string) => {
    try {
      const res = await apiFetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ importance })
      });
      if (res.ok) {
        setNotes(prev => prev.map(n => n._id === noteId ? { ...n, importance } : n));
        if (selectedNote && selectedNote._id === noteId) {
          setSelectedNote({ ...selectedNote, importance });
        }
      }
    } catch (error) {
      console.error("Failed to update importance", error);
    }
  };

  const handleEditContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditContent(newContent);
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      if (selectedNote) {
        saveNote(newContent, selectedNote._id);
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await apiFetch('/api/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(data.data);
      }
    } catch (error) {
      console.error("Error fetching notes", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await apiFetch('/api/documents');
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
      await Promise.all([fetchNotes(), fetchDocuments()]);
      setLoading(false);
    };
    loadInitialData();
  }, []);

  const handleGenerate = async () => {
    if (!selectedDoc) {
      toast.error("Please select a document");
      return;
    }

    setIsGenerating(true);
    const doc = documents.find(d => d._id === selectedDoc);
    
    try {
      const res = await apiFetch('/api/notes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedDoc,
          type: noteType,
          subject: doc?.subject || 'General'
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("Notes generated successfully");
        setIsDialogOpen(false);
        fetchNotes();
      } else {
        toast.error(data.error || "Failed to generate notes");
      }
    } catch (error) {
      toast.error("Failed to generate notes");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Note deleted");
        fetchNotes();
        if (selectedNote?._id === id) setSelectedNote(null);
      } else {
        toast.error("Failed to delete note");
      }
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const getCategorySearch = (cat) => {
    if (cat === 'Summaries') return 'summary';
    if (cat === 'Important Questions') return 'important question';
    if (cat === 'Cheat Sheets') return 'cheat sheet';
    if (cat === 'Mind Maps') return 'mind map';
    return cat.toLowerCase();
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesImportance = filterImportance === "all" || n.importance === filterImportance;
    const matchesSubject = filterSubject === "all" || n.subject === filterSubject;
    const matchesType = filterType === "all" || (n.type && n.type.toLowerCase().includes(filterType.toLowerCase()));
    
    let matchesCategory = true;
    if (activeCategory === 'Others') {
       matchesCategory = !['summary', 'important question', 'cheat sheet', 'mind map'].some(t => n.type?.toLowerCase().includes(t));
    } else if (activeCategory !== 'All Notes') {
       matchesCategory = !!(n.type && n.type.toLowerCase().includes(getCategorySearch(activeCategory)));
    }
    
    return matchesSearch && matchesImportance && matchesSubject && matchesType && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'a-z') return a.title.localeCompare(b.title);
    return 0;
  });

  const uniqueSubjects = Array.from(new Set(notes.map(n => n.subject).filter(Boolean)));

  return (
    <div className={`p-6 md:p-8 mx-auto w-full flex flex-col gap-6 md:gap-8 min-h-screen ${isFullscreen ? 'max-w-none' : 'max-w-7xl'}`}>
      
      {/* Header */}
      {!isFullscreen && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Smart Notes</h1>
            <p className="text-muted-foreground text-sm">AI-generated summaries, cheat sheets, and study materials.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button className="w-full sm:w-auto gap-2 rounded-xl h-10 shadow-sm bg-black hover:bg-black/90 text-white" onClick={() => setIsDialogOpen(true)}>
              <Sparkles className="h-4 w-4" />
              Generate Notes
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {selectedNote ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-col rounded-3xl border bg-card shadow-sm overflow-hidden flex-1 ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''}`}
        >
          <div className="flex items-start justify-between p-6 border-b bg-muted/20">
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <Badge variant="secondary" className="font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/20">{selectedNote.type}</Badge>
                {selectedNote.importance === 'high' && <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 gap-1"><AlertCircle className="h-3 w-3"/> High Priority</Badge>}
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                  <span>{selectedNote.subject}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>{new Date(selectedNote.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground truncate">{selectedNote.title}</h2>
              
              
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex text-xs font-medium text-muted-foreground items-center gap-1.5 mr-4 bg-muted/50 px-3 py-1.5 rounded-lg border">
                {isSaving ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Saving...</>
                ) : lastSaved ? (
                  <><Check className="h-3.5 w-3.5 text-emerald-500" /> Saved</>
                ) : (
                  <><Save className="h-3.5 w-3.5" /> Auto-save on</>
                )}
              </div>
              <Button variant={isEditing ? "default" : "outline"} size="sm" onClick={() => setIsEditing(!isEditing)} className="gap-2 rounded-xl">
                <Edit2 className="h-4 w-4" />
                {isEditing ? "Preview Mode" : "Edit Notes"}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)} className="rounded-xl text-muted-foreground">
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <Button variant="ghost" size="icon" onClick={() => { setSelectedNote(null); setIsFullscreen(false); }} className="rounded-xl text-muted-foreground">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className={`p-8 md:p-12 overflow-y-auto flex-1 ${isEditing ? 'bg-background' : 'bg-card'}`}>
            {isEditing ? (
              <Textarea 
                value={editContent}
                onChange={handleEditContentChange}
                className="w-full h-full min-h-[500px] font-mono text-[15px] resize-none border-0 focus-visible:ring-0 p-0 bg-transparent leading-relaxed"
                placeholder="Write your notes here in Markdown..."
              />
            ) : (
             <div className="prose prose-slate dark:prose-invert max-w-3xl mx-auto prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-a:text-indigo-500 prose-code:text-indigo-500 prose-code:bg-indigo-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-pre:bg-muted prose-pre:border">
               <Markdown remarkPlugins={[remarkGfm]}>{editContent || selectedNote.content}</Markdown>
             </div>
            )}
          </div>
        </motion.div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search your notes..." 
                className="pl-9 h-11 rounded-xl bg-card border shadow-sm focus-visible:ring-indigo-500 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
              
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] h-11 rounded-xl bg-card border shadow-sm font-medium focus:ring-indigo-500">
                  <SelectValue placeholder="Sort: Latest" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="latest">Sort: Latest</SelectItem>
                  <SelectItem value="oldest">Sort: Oldest</SelectItem>
                  <SelectItem value="a-z">Sort: A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-2 mb-4">
            {['All Notes', 'Summaries', 'Important Questions', 'Cheat Sheets', 'Mind Maps', 'Others'].map((cat) => {
               const isActive = activeCategory === cat;
               let count = 0;
               if (cat === 'All Notes') count = notes.length;
               else if (cat === 'Others') count = notes.filter(n => !['summary', 'important question', 'cheat sheet', 'mind map'].some(t => n.type?.toLowerCase().includes(t))).length;
               else count = notes.filter(n => n.type?.toLowerCase().includes(getCategorySearch(cat))).length;
               
               return (
                 <button 
                   key={cat}
                   onClick={() => setActiveCategory(cat)}
                   className={`rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-colors ${isActive ? 'bg-black text-white hover:bg-black/90' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-transparent'}`}
                 >
                   {cat} ({count})
                 </button>
               )
            })}
          </div>

          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6 pb-12`}>
            {loading ? (
              <>
                 <DocumentCardSkeleton />
                 <DocumentCardSkeleton />
                 <DocumentCardSkeleton />
                 <DocumentCardSkeleton />
              </>
            ) : filteredNotes.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed rounded-3xl bg-muted/20 text-center mt-4">
                 <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                   <BookOpen className="h-8 w-8 text-indigo-500" />
                 </div>
                 <h3 className="text-xl font-bold mb-2">No notes available</h3>
                 <p className="text-muted-foreground mb-6 max-w-sm">Generate beautiful AI notes from any document or write your own from scratch.</p>
                 <Button className="rounded-xl shadow-sm bg-black hover:bg-black/90 text-white" onClick={() => setIsDialogOpen(true)}>
                   Generate Notes
                 </Button>
              </div>
            ) : (
              filteredNotes.map((note) => {
                const sourceDoc = documents.find(d => d._id === note.document);
                const sourceName = sourceDoc?.originalName || "Source Document";
                
                let typeColor = "bg-purple-50 text-purple-600 border-purple-100";
                if (note.type?.toLowerCase().includes("question")) typeColor = "bg-orange-50 text-orange-600 border-orange-100";
                else if (note.type?.toLowerCase().includes("cheat")) typeColor = "bg-blue-50 text-blue-600 border-blue-100";
                else if (note.type?.toLowerCase().includes("mind map") || note.type?.toLowerCase().includes("map")) typeColor = "bg-emerald-50 text-emerald-600 border-emerald-100";

                let icon = <FileText className="h-3.5 w-3.5" />;
                let statText = `${note.words || 0} words`;
                if (note.type?.toLowerCase().includes("question")) {
                  statText = `${Math.floor((note.words || 0) / 20) || 5} questions`;
                } else if (note.type?.toLowerCase().includes("cheat")) {
                  statText = `${Math.floor((note.words || 0) / 300) || 1} pages`;
                } else if (note.type?.toLowerCase().includes("map")) {
                  statText = "1 image";
                  icon = <ImageIcon className="h-3.5 w-3.5" />;
                }

                const dateStr = new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                return (
                  <motion.div 
                    whileHover={{ y: -4 }}
                    key={note._id} 
                    className={`flex flex-col p-5 rounded-2xl border bg-card hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden ${viewMode === 'list' ? 'h-auto sm:flex-row sm:items-center sm:gap-6' : 'h-[300px]'}`}
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className={`flex justify-between items-start mb-4 ${viewMode === 'list' ? 'sm:mb-0 sm:w-48 sm:shrink-0' : ''}`}>
                      <Badge variant="outline" className={`font-semibold rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${typeColor}`}>
                        {note.type}
                      </Badge>
                      <div className={`flex items-center gap-1 ${viewMode === 'list' ? 'sm:hidden' : ''}`}>
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
                    
                    <div className={`flex flex-col flex-1 min-w-0 ${viewMode === 'list' ? '' : ''}`}>
                      <h3 className="font-bold text-lg leading-tight mb-1.5 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {note.title}
                      </h3>
                      
                      <div className="text-[12px] font-medium text-muted-foreground mb-3 truncate">
                        {sourceName}
                      </div>
                      
                      <div className={`flex-1 overflow-hidden relative ${viewMode === 'list' ? 'hidden sm:block' : ''}`}>
                        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3">
                          {note.summary || note.content.substring(0, 150)}...
                        </p>
                      </div>
                      
                      <div className={`mt-4 pt-4 flex items-center justify-between border-t border-border/50 ${viewMode === 'list' ? 'sm:border-t-0 sm:pt-0 sm:mt-0 sm:border-l sm:pl-6 sm:ml-6 sm:w-48 sm:shrink-0 sm:flex-col sm:items-start sm:justify-center sm:gap-2' : ''}`}>
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
              })
            )}
          </div>
        </>
      )}

      {/* Generation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader className="mb-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
               <Sparkles className="h-6 w-6 text-indigo-500" />
            </div>
            <DialogTitle className="text-xl">Generate Smart Notes</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5">
            <div className="grid gap-2.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Source Document</Label>
              <Select value={selectedDoc} onValueChange={setSelectedDoc}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-transparent hover:bg-muted focus:ring-indigo-500">
                  <SelectValue placeholder="Select a document" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {documents.map(doc => (
                    <SelectItem key={doc._id} value={doc._id} className="rounded-lg">{doc.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Note Type</Label>
              <Select value={noteType} onValueChange={setNoteType}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-transparent hover:bg-muted focus:ring-indigo-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Summary" className="rounded-lg">Summary (Overview)</SelectItem>
                  <SelectItem value="Key Points" className="rounded-lg">Key Points (Bullets)</SelectItem>
                  <SelectItem value="Definitions" className="rounded-lg">Definitions (Glossary)</SelectItem>
                  <SelectItem value="Important Questions" className="rounded-lg">Important Questions (Q&A)</SelectItem>
                  <SelectItem value="Formula Sheet" className="rounded-lg">Formula Sheet (Math/Science)</SelectItem>
                  <SelectItem value="Revision Notes" className="rounded-lg">Revision Notes (Exam Prep)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-6 flex gap-3 sm:justify-start">
            <Button className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? "Generating Magic..." : "Generate AI Notes"}
            </Button>
            <Button variant="outline" className="flex-1 h-12 rounded-xl font-semibold text-sm" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <ConfirmDialog 
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        destructive={true}
        onConfirm={() => {
          if (itemToDelete) {
            handleDelete(itemToDelete);
          }
          setItemToDelete(null);
        }}
      />
    </div>
  );
}
