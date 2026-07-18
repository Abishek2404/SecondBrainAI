import { useState, useEffect, useRef } from "react";
import { Search, FileText, BookOpen, BrainCircuit, Layers, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";

export function CommandMenu({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    documents: any[];
    notes: any[];
    quizzes: any[];
    flashcards: any[];
  } | null>(null);
  
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setResults(null);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setResults(null);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const response = await apiFetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        if (data.success) {
          setResults(data.data);
        }
      } catch (error) {
        console.error("Search error", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, open]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onOpenChange(false);
    setSearchQuery("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleNavigate(`/chat?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const totalResults = results ? 
    results.documents.length + results.notes.length + results.quizzes.length + results.flashcards.length 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-xl">
        <DialogTitle className="sr-only">Command Menu</DialogTitle>
        <DialogDescription className="sr-only">Search across documents, notes, quizzes, and flashcards.</DialogDescription>
        
        <form onSubmit={handleSearchSubmit} className="flex items-center border-b px-3">
          <Search className="h-5 w-5 text-muted-foreground mr-2 shrink-0" />
          <input 
            ref={inputRef}
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, documents, or ask AI..." 
            className="flex h-14 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={() => { setSearchQuery(""); setResults(null); }}
              className="p-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden">
          {searchQuery.trim().length < 2 ? (
             <div className="py-6 text-center text-sm text-muted-foreground">
               Type at least 2 characters to search...
             </div>
          ) : loading ? (
            <div className="py-6 flex items-center justify-center text-muted-foreground gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching...
            </div>
          ) : results && totalResults > 0 ? (
            <div className="p-2 space-y-2">
              {results.documents.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wider">Documents</h3>
                  {results.documents.map((doc: any) => (
                    <button 
                      key={doc._id}
                      onClick={() => handleNavigate('/documents')}
                      className="w-full text-left px-2 py-2 hover:bg-muted/60 rounded-md flex items-start gap-3 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{doc.title}</span>
                        {doc.subject && <span className="text-xs text-muted-foreground line-clamp-1">{doc.subject}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.notes.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wider">Notes</h3>
                  {results.notes.map((note: any) => (
                    <button 
                      key={note._id}
                      onClick={() => handleNavigate('/notes')}
                      className="w-full text-left px-2 py-2 hover:bg-muted/60 rounded-md flex items-start gap-3 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-md bg-green-500/10 flex items-center justify-center shrink-0">
                        <BookOpen className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{note.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.quizzes.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wider">Quizzes</h3>
                  {results.quizzes.map((quiz: any) => (
                    <button 
                      key={quiz._id}
                      onClick={() => handleNavigate('/quizzes')}
                      className="w-full text-left px-2 py-2 hover:bg-muted/60 rounded-md flex items-start gap-3 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-md bg-purple-500/10 flex items-center justify-center shrink-0">
                         <BrainCircuit className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{quiz.title}</span>
                        {quiz.subject && <span className="text-xs text-muted-foreground line-clamp-1">{quiz.subject}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.flashcards.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wider">Flashcards</h3>
                  {results.flashcards.map((deck: any) => (
                    <button 
                      key={deck._id}
                      onClick={() => handleNavigate('/flashcards')}
                      className="w-full text-left px-2 py-2 hover:bg-muted/60 rounded-md flex items-start gap-3 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-md bg-orange-500/10 flex items-center justify-center shrink-0">
                        <Layers className="h-4 w-4 text-orange-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{deck.title}</span>
                        {deck.subject && <span className="text-xs text-muted-foreground line-clamp-1">{deck.subject}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="py-14 px-6 text-center flex flex-col items-center">
              <Search className="h-8 w-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">No results found</p>
              <p className="text-xs text-muted-foreground mb-4">We couldn't find anything matching "{searchQuery}"</p>
              <button 
                  onClick={() => handleNavigate(`/chat?q=${encodeURIComponent(searchQuery)}`)}
                  className="inline-flex items-center justify-center rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-indigo-600 text-white hover:bg-indigo-700 h-9 px-4 py-2"
              >
                Ask AI Assistant Instead
              </button>
            </div>
          )}
          
          {searchQuery && totalResults > 0 && (
            <div className="p-3 border-t bg-muted/20">
               <button 
                  onClick={() => handleNavigate(`/chat?q=${encodeURIComponent(searchQuery)}`)}
                  className="w-full flex items-center justify-between text-sm font-medium text-foreground py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                     <BrainCircuit className="h-4 w-4 text-indigo-500" />
                     Ask AI about "{searchQuery}"
                  </span>
                  <span className="text-xs text-muted-foreground">↵</span>
                </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
