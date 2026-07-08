import { apiFetch } from '../lib/api';
import { Layers, RotateCcw, BrainCircuit, Search, Plus, Filter, Play, MoreVertical, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { motion, AnimatePresence } from "motion/react";

export function Flashcards() {
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
    fetchDecks();
    fetchDocuments();
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
          toast.info("No cards to review in this deck.");
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
        toast.success("Review session complete!");
        setReviewDeck(null);
        fetchDecks();
      }
    } catch (error) {
      toast.error("Failed to save review");
    }
  };

  const filteredDecks = decks.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalDue = decks.reduce((sum, deck) => sum + (deck.due || 0), 0);

  if (reviewDeck) {
    const currentCard = reviewCards[currentCardIndex];
    return (
      <div className="p-4 sm:p-8 max-w-3xl mx-auto w-full flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">{reviewDeck.title}</h2>
            <p className="text-sm text-muted-foreground">Card {currentCardIndex + 1} of {reviewCards.length}</p>
          </div>
          <Button variant="ghost" onClick={() => { setReviewDeck(null); fetchDecks(); }}>End Review</Button>
        </div>
        
        <div 
          className="relative w-full h-80 cursor-pointer group [perspective:1000px]"
          onClick={() => !showAnswer && setShowAnswer(true)}
        >
          <motion.div
            className="w-full h-full relative [transform-style:preserve-3d]"
            initial={false}
            animate={{ rotateY: showAnswer ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 w-full h-full [backface-visibility:hidden]"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <Card 
                className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-xl shadow-md border-2 border-primary/20 bg-card"
              >
                <div className="flex-1 flex items-center justify-center">
                  {currentCard.front}
                </div>
                {!showAnswer && <p className="mt-4 text-xs text-muted-foreground">Click to reveal answer</p>}
              </Card>
            </div>
            
            {/* Back */}
            <div
              className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <Card 
                className="w-full h-full flex items-center justify-center p-8 text-center text-lg shadow-md border-2 border-emerald-500/30 overflow-y-auto bg-card"
              >
                <div className="prose dark:prose-invert">
                  {currentCard.back}
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
        
        {showAnswer && (
          <div className="w-full mt-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
            <p className="text-sm text-muted-foreground mb-4">How well did you know this?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
              <Button variant="outline" className="border-red-500/50 hover:bg-red-500/10 text-red-600" onClick={(e) => { e.stopPropagation(); handleReviewScore(1); }}>Again</Button>
              <Button variant="outline" className="border-orange-500/50 hover:bg-orange-500/10 text-orange-600" onClick={(e) => { e.stopPropagation(); handleReviewScore(3); }}>Hard</Button>
              <Button variant="outline" className="border-blue-500/50 hover:bg-blue-500/10 text-blue-600" onClick={(e) => { e.stopPropagation(); handleReviewScore(4); }}>Good</Button>
              <Button variant="outline" className="border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-600" onClick={(e) => { e.stopPropagation(); handleReviewScore(5); }}>Easy</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Flashcards</h1>
          <p className="text-muted-foreground">Master your concepts with spaced repetition.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="flex-1 sm:flex-none gap-2" onClick={() => setIsGenerateOpen(true)}>
            <BrainCircuit className="h-4 w-4" />
            AI Auto-Generate
          </Button>
          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Flashcard Deck</DialogTitle>
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
                  <Label>Number of Cards</Label>
                  <Select value={cardCount} onValueChange={setCardCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 cards</SelectItem>
                      <SelectItem value="20">20 cards</SelectItem>
                      <SelectItem value="30">30 cards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>Cancel</Button>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-3 rounded-xl border bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="h-12 w-12 rounded-full bg-background shadow-sm border flex items-center justify-center shrink-0">
              <RotateCcw className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Daily Review</h2>
              {totalDue > 0 ? (
                <p className="text-sm text-muted-foreground">You have <strong className="text-foreground">{totalDue}</strong> cards due for review today across all decks.</p>
              ) : (
                <p className="text-sm text-muted-foreground">You're all caught up! Practice any deck to continue learning.</p>
              )}
            </div>
          </div>
          <Button size="lg" className="w-full sm:w-auto gap-2 relative z-10 shadow-sm" disabled={decks.length === 0} onClick={() => {
            const dueDeck = decks.find(d => d.due > 0);
            if (dueDeck) {
              startReview(dueDeck, true);
            } else if (decks.length > 0) {
              startReview(decks[0], false);
            }
          }}>
            <Play className="h-4 w-4 fill-current" />
            {totalDue > 0 ? "Start Review Session" : "Practice Anyway"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b pb-6 mt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search decks..." 
            className="pl-9 bg-card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="shrink-0"><Filter className="h-4 w-4" /></Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDecks.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-10">
            No flashcard decks found. Auto-generate one from a document!
          </div>
        ) : (
          filteredDecks.map((deck) => (
            <Card key={deck._id} className="hover:shadow-md transition-all hover:border-primary/50 cursor-pointer group flex flex-col" onClick={() => startReview(deck, false)}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="font-normal">{deck.subject}</Badge>
                  <div className="flex items-center gap-2">
                    {deck.due > 0 && (
                      <Badge variant="destructive" className="font-medium">
                        {deck.due} due
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-red-500 focus:text-red-500 gap-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setItemToDelete(deck._id); }}>
                          <Trash className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardTitle className="leading-tight group-hover:text-primary transition-colors">{deck.title}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-1">
                  <Layers className="h-3.5 w-3.5" />
                  {deck.cards} cards
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <div className="flex flex-col gap-1.5 mt-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">Mastery</span>
                    <span>{deck.mastery}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${deck.mastery > 80 ? 'bg-emerald-500' : deck.mastery > 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                      style={{ width: `${deck.mastery}%` }} 
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                 <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" onClick={(e) => { e.stopPropagation(); startReview(deck, deck.due > 0); }}>
                   {deck.due > 0 ? "Review Due Now" : "Practice All"}
                 </Button>
              </CardFooter>
            </Card>
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
</div>
  );
}
