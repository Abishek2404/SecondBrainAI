import { apiFetch } from '../lib/api';
import { BookOpen, Search, Plus, Sparkles, Filter, SortDesc, MoreVertical, FileText, Trash, Edit2, Save, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

  // View state
  const [selectedNote, setSelectedNote] = useState<any>(null);
  
  // Edit & Auto-save state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        // Update local state without closing editor
        setNotes(prev => prev.map(n => n._id === noteId ? { ...n, content, summary: content.substring(0, 150) + '...' } : n));
      }
    } catch (error) {
      console.error("Failed to auto-save note", error);
    } finally {
      setIsSaving(false);
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
    }, 2000); // Auto-save after 2 seconds of inactivity
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
    fetchNotes();
    fetchDocuments();
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
      } else {
        toast.error("Failed to delete note");
      }
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Smart Notes</h1>
          <p className="text-muted-foreground">AI-generated summaries, cheat sheets, and study materials.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button className="w-full sm:w-auto gap-2 shadow-sm" onClick={() => setIsDialogOpen(true)}>
            <Sparkles className="h-4 w-4" />
            Generate Notes
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Smart Notes</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Source Document</Label>
                  <Select value={selectedDoc} onValueChange={setSelectedDoc}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a document" />
                    </SelectTrigger>
                    <SelectContent>
                      {documents.map(doc => (
                        <SelectItem key={doc._id} value={doc._id}>{doc.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Note Type</Label>
                  <Select value={noteType} onValueChange={setNoteType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Summary">Summary</SelectItem>
                      <SelectItem value="Key Points">Key Points</SelectItem>
                      <SelectItem value="Definitions">Definitions</SelectItem>
                      <SelectItem value="Important Questions">Important Questions</SelectItem>
                      <SelectItem value="Formula Sheet">Formula Sheet</SelectItem>
                      <SelectItem value="Revision Notes">Revision Notes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b pb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search your notes..." 
            className="pl-9 bg-card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="shrink-0"><Filter className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" className="shrink-0"><SortDesc className="h-4 w-4" /></Button>
      </div>

      {selectedNote ? (
        <Card className="flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <CardHeader className="border-b">
            <div className="flex justify-between items-start">
              <div>
                <Badge className="mb-2">{selectedNote.type}</Badge>
                <CardTitle className="text-2xl">{selectedNote.title}</CardTitle>
                <CardDescription className="mt-1 flex items-center gap-2">
                   <span>{selectedNote.subject}</span>
                   <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                   <span>{new Date(selectedNote.createdAt).toLocaleDateString()}</span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isEditing && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 mr-2">
                    {isSaving ? (
                      <><Loader2 className="h-3 w-3 animate-spin" /> Saving...</>
                    ) : lastSaved ? (
                      <><Save className="h-3 w-3" /> Saved at {lastSaved.toLocaleTimeString()}</>
                    ) : null}
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} className="gap-2">
                  <Edit2 className="h-4 w-4" />
                  {isEditing ? "Preview" : "Edit"}
                </Button>
                <Button variant="ghost" onClick={() => setSelectedNote(null)}>Close</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isEditing ? (
              <Textarea 
                value={editContent}
                onChange={handleEditContentChange}
                className="min-h-[500px] font-mono text-sm resize-y"
                placeholder="Write your notes here in Markdown..."
              />
            ) : (
             <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
               <Markdown remarkPlugins={[remarkGfm]}>{editContent || selectedNote.content}</Markdown>
             </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-10">
              No notes found. Click "Generate Notes" to create some.
            </div>
          ) : (
            filteredNotes.map((note) => (
              <Card key={note._id} className="hover:shadow-md transition-all hover:border-primary/50 cursor-pointer group flex flex-col" onClick={() => setSelectedNote(note)}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <Badge variant="secondary" className="font-normal mb-2">{note.type}</Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-red-500 focus:text-red-500 gap-2" onClick={() => { setItemToDelete(note._id); }}>
                          <Trash className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                  </div>
                  <CardTitle className="leading-tight group-hover:text-primary transition-colors">{note.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-foreground">{note.subject}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-sm text-muted-foreground line-clamp-3">
                    {note.summary || note.content.substring(0, 150)}
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t text-xs text-muted-foreground flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    {note.words} words
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Read Notes
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
    
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
