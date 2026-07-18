import { apiFetch } from '../lib/api';
import { Layers, RotateCcw, BrainCircuit, Search, Filter, Play, MoreVertical, Trash, CalendarClock, TrendingUp, ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { Input } from "./ui/input";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { DocumentCardSkeleton } from "./Skeletons";
import { motion, AnimatePresence } from "motion/react";
import { useStreak } from "./StreakProvider";

export function Flashcards() {
  const { triggerStreakCheck } = useStreak();
  const [decks, setDecks] = useState<any[]>([]);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [cardCount, setCardCount] = useState("10");

  const [reviewDeck, setReviewDeck] = useState<any>(null);
  const [reviewCards, setReviewCards] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const [loading, setLoading] = useState(true);

  const fetchDecks = async () => {
    try {
      const res = await apiFetch('/api/flashcards/decks');
      if (res.ok) {
        const data = await res.json();
        setDecks(data.data);
      }
    } catch (error) {
      console.error("Error fetching decks", error);
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
      await Promise.all([fetchDecks(), fetchDocuments()]);
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
    
    try {
      const res = await apiFetch('/api/flashcards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedDoc,
          count: parseInt(cardCount)
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("Deck generated successfully");
        setIsGenerateOpen(false);
        fetchDecks();
      } else {
        toast.error(data.error || "Failed to generate deck");
      }
    } catch (error) {
      toast.error("Failed to generate deck");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/api/flashcards/decks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Deck deleted");
        fetchDecks();
      } else {
        toast.error("Failed to delete deck");
      }
    } catch (error) {
      toast.error("Failed to delete deck");
    }
  };

  const startReview = async (deck: any, dueOnly: boolean = false) => {
    try {
      const res = await apiFetch(`/api/flashcards/decks/${deck._id}/cards${dueOnly ? '?dueOnly=true' : ''}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data.length === 0) {
          toast.info("No cards to review in this deck right now.");
          return;
        }
        setReviewCards(data.data);
        setReviewDeck(deck);
        setCurrentCardIndex(0);
        setShowAnswer(false);
      }
    } catch (error) {
      toast.error("Failed to start review");
    }
  };

  const handleReviewScore = async (score: number) => {
    const currentCard = reviewCards[currentCardIndex];
    
    try {
      await apiFetch(`/api/flashcards/cards/${currentCard._id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality: score })
      });
      
      if (currentCardIndex < reviewCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setShowAnswer(false);
      } else {
        toast.success("Review session complete! Great work.");
        setReviewDeck(null);
        fetchDecks();
        triggerStreakCheck('flashcards');
      }
    } catch (error) {
      toast.error("Failed to save review");
    }
  };

  const filteredDecks = decks.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalDue = decks.reduce((sum, deck) => sum + (deck.due || 0), 0);

  if (reviewDeck) {
    const currentCard = reviewCards[currentCardIndex];
    const progress = (currentCardIndex / reviewCards.length) * 100;
    
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full flex items-center justify-between mb-8">
           <Button variant="ghost" size="sm" onClick={() => { setReviewDeck(null); fetchDecks(); }} className="gap-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground">
             <ChevronLeft className="h-4 w-4" /> End Session
           </Button>
           <div className="flex-1 px-8">
             <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
               <div className="h-full bg-indigo-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
             </div>
           </div>
           <div className="text-sm font-bold text-muted-foreground w-16 text-right">
             {currentCardIndex + 1} / {reviewCards.length}
           </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl">
          <div 
            className="relative w-full h-[400px] cursor-pointer group [perspective:1500px]"
            onClick={() => !showAnswer && setShowAnswer(true)}
          >
            <motion.div
              className="w-full h-full relative [transform-style:preserve-3d]"
              initial={false}
              animate={{ rotateX: showAnswer ? -180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
            >
              {/* Front side */}
              <div
                className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-3xl border shadow-xl bg-card flex flex-col p-10 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold leading-relaxed mb-4">{currentCard.front}</h2>
                  {!showAnswer && (
                    <p className="mt-8 text-sm text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-2 animate-pulse">
                      Tap to reveal answer
                    </p>
                  )}
                </div>
              </div>
              
              {/* Back side */}
              <div
                className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateX(180deg)] rounded-3xl border border-emerald-500/20 shadow-xl bg-card flex flex-col p-10 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                <div className="flex-1 flex flex-col items-center justify-center text-center overflow-y-auto">
                   <div className="text-xl sm:text-2xl font-medium leading-relaxed prose dark:prose-invert">
                     {currentCard.back}
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="h-32 w-full mt-8">
            <AnimatePresence>
              {showAnswer && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: 20 }}
                  className="w-full flex flex-col items-center"
                >
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">How well did you know this?</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
                    <Button 
                      className="h-14 rounded-2xl bg-card border-2 border-red-500/20 hover:border-red-500 hover:bg-red-500/10 text-red-600 shadow-sm transition-all" 
                      onClick={(e) => { e.stopPropagation(); handleReviewScore(1); }}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-base">Again</span>
                        <span className="text-[10px] opacity-70">&lt; 1m</span>
                      </div>
                    </Button>
                    <Button 
                      className="h-14 rounded-2xl bg-card border-2 border-orange-500/20 hover:border-orange-500 hover:bg-orange-500/10 text-orange-600 shadow-sm transition-all" 
                      onClick={(e) => { e.stopPropagation(); handleReviewScore(3); }}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-base">Hard</span>
                        <span className="text-[10px] opacity-70">10m</span>
                      </div>
                    </Button>
                    <Button 
                      className="h-14 rounded-2xl bg-card border-2 border-blue-500/20 hover:border-blue-500 hover:bg-blue-500/10 text-blue-600 shadow-sm transition-all" 
                      onClick={(e) => { e.stopPropagation(); handleReviewScore(4); }}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-base">Good</span>
                        <span className="text-[10px] opacity-70">1d</span>
                      </div>
                    </Button>
                    <Button 
                      className="h-14 rounded-2xl bg-card border-2 border-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-500/10 text-emerald-600 shadow-sm transition-all" 
                      onClick={(e) => { e.stopPropagation(); handleReviewScore(5); }}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-base">Easy</span>
                        <span className="text-[10px] opacity-70">4d</span>
                      </div>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Flashcards</h1>
          <p className="text-muted-foreground text-sm">Master your concepts with AI-powered spaced repetition.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button className="w-full sm:w-auto gap-2 rounded-xl h-10 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setIsGenerateOpen(true)}>
            <BrainCircuit className="h-4 w-4" />
            Auto-Generate Deck
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-3 rounded-3xl border bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <RotateCcw className="h-7 w-7 text-indigo-500" />
            </div>
            <div>
              <h2 className="font-bold text-xl mb-1">Daily Review</h2>
              {totalDue > 0 ? (
                <p className="text-sm text-muted-foreground max-w-md">You have <strong className="text-foreground">{totalDue}</strong> cards due for review today across all decks. Keep your streak alive!</p>
              ) : (
                <p className="text-sm text-muted-foreground max-w-md">You're all caught up for today! You can practice any deck manually to continue learning.</p>
              )}
            </div>
          </div>
          <Button size="lg" className="w-full sm:w-auto gap-2 relative z-10 shadow-sm rounded-xl h-12 px-8 font-semibold text-base bg-foreground text-background hover:bg-foreground/90" disabled={decks.length === 0} onClick={() => {
            const dueDeck = decks.find(d => d.due > 0);
            if (dueDeck) {
              startReview(dueDeck, true);
            } else if (decks.length > 0) {
              startReview(decks[0], false);
            }
          }}>
            <Play className="h-5 w-5 fill-current" />
            {totalDue > 0 ? "Start Review Session" : "Practice Anyway"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-2 rounded-2xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search decks..." 
            className="pl-9 bg-transparent border-none shadow-none focus-visible:ring-0 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="hidden sm:block w-px h-6 bg-border mx-2" />
        <Button variant="ghost" className="rounded-xl shrink-0 h-9 px-3 gap-2 w-full sm:w-auto text-muted-foreground"><Filter className="h-4 w-4" /> Filter</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        {loading ? (
          <>
             <DocumentCardSkeleton />
             <DocumentCardSkeleton />
             <DocumentCardSkeleton />
             <DocumentCardSkeleton />
          </>
        ) : filteredDecks.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed rounded-3xl bg-muted/20 text-center mt-4">
             <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
               <Layers className="h-8 w-8 text-indigo-500" />
             </div>
             <h3 className="text-xl font-bold mb-2">No flashcards available</h3>
             <p className="text-muted-foreground mb-6 max-w-sm">Generate your first flashcard deck from any document to start memorizing.</p>
             <Button className="rounded-xl shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setIsGenerateOpen(true)}>
               Generate Deck
             </Button>
          </div>
        ) : (
          filteredDecks.map((deck) => (
            <motion.div 
              whileHover={{ y: -4 }}
              key={deck._id} 
              className="flex flex-col p-6 rounded-3xl border bg-card hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden" 
              onClick={() => startReview(deck, false)}
            >
              <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
              
              <div className="flex justify-between items-start mb-4 z-10">
                <div className="px-2.5 py-1 rounded-full bg-muted text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                  {deck.subject}
                </div>
                <div className="flex items-center gap-2">
                  {deck.due > 0 && (
                    <div className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 text-[10px] font-bold tracking-wider uppercase border border-red-500/20 shadow-sm animate-pulse">
                      {deck.due} due
                    </div>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <button className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors opacity-0 group-hover:opacity-100 -mr-2" onClick={e => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    } />
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem className="text-red-500 focus:text-red-500 gap-2 rounded-lg" onClick={() => { setItemToDelete(deck._id); }}>
                        <Trash className="h-4 w-4" /> Delete Deck
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <h3 className="font-bold text-xl leading-tight mb-2 group-hover:text-indigo-600 transition-colors z-10 line-clamp-2">
                {deck.title}
              </h3>
              
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-6 z-10">
                 <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> {deck.cards} cards</span>
                 <span className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> updated {new Date(deck.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="mt-auto pt-4 border-t border-border/50 flex flex-col gap-3 z-10">
                 <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider text-[10px]"><TrendingUp className="h-3.5 w-3.5 text-indigo-500" /> Mastery</span>
                    <span className={deck.mastery > 80 ? 'text-emerald-500' : deck.mastery > 50 ? 'text-orange-500' : 'text-red-500'}>{deck.mastery}%</span>
                 </div>
                 <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${deck.mastery > 80 ? 'bg-emerald-500' : deck.mastery > 50 ? 'bg-orange-500' : 'bg-red-500'}`} 
                      style={{ width: `${deck.mastery}%` }} 
                    />
                 </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    
      <ConfirmDialog 
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Delete Deck"
        description="Are you sure you want to delete this deck? This action cannot be undone."
        confirmText="Delete"
        destructive={true}
        onConfirm={() => {
          if (itemToDelete) {
            handleDelete(itemToDelete);
          }
          setItemToDelete(null);
        }}
      />

      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader className="mb-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
               <BrainCircuit className="h-6 w-6 text-indigo-500" />
            </div>
            <DialogTitle className="text-xl">Generate Flashcards</DialogTitle>
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
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Deck Size</Label>
              <Select value={cardCount} onValueChange={setCardCount}>
                <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-transparent hover:bg-muted focus:ring-indigo-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="10" className="rounded-lg">10 cards (Quick Review)</SelectItem>
                  <SelectItem value="20" className="rounded-lg">20 cards (Standard)</SelectItem>
                  <SelectItem value="30" className="rounded-lg">30 cards (Comprehensive)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-6 flex gap-3 sm:justify-start">
            <Button className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? "Generating Magic..." : "Generate AI Deck"}
            </Button>
            <Button variant="outline" className="flex-1 h-12 rounded-xl font-semibold text-sm" onClick={() => setIsGenerateOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
