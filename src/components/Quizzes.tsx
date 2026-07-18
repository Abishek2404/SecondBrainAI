import { apiFetch } from '../lib/api';
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { Brain, Filter, MoreVertical, Search, Trash, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Clock, Target, Trophy, Flame } from "lucide-react";
import { useStreak } from "./StreakProvider";
import { motion, AnimatePresence } from "motion/react";
import { DocumentCardSkeleton } from "./Skeletons";
import confetti from "canvas-confetti";

export function Quizzes() {
  const location = useLocation();
  const { triggerStreakCheck } = useStreak();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [questionCount, setQuestionCount] = useState("5");
  const [difficulty, setDifficulty] = useState("medium");

  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = async () => {
    try {
      const res = await apiFetch('/api/quizzes');
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.data);
      }
    } catch (error) {
      console.error("Error fetching quizzes", error);
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
      try {
        const res = await apiFetch('/api/quizzes');
        if (res.ok) {
          const data = await res.json();
          setQuizzes(data.data);
          
          if (location.state?.autoStartQuizId) {
             const quizToStart = data.data.find((q: any) => q._id === location.state.autoStartQuizId);
             if (quizToStart) {
                const fullRes = await apiFetch(`/api/quizzes/${quizToStart._id}`);
                if (fullRes.ok) {
                   const fullData = await fullRes.json();
                   setActiveQuiz(fullData.data);
                   setCurrentQuestionIndex(0);
                   if (fullData.data.questions) {
                       setSelectedAnswers(new Array(fullData.data.questions.length).fill(-1));
                   }
                   setQuizResult(null);
                }
             }
          }
        }
        await fetchDocuments();
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    loadInitialData();
  }, [location.state]);

  const handleGenerate = async () => {
    if (!selectedDoc) {
      toast.error("Please select a document");
      return;
    }

    setIsGenerating(true);
    
    try {
      const res = await apiFetch('/api/quizzes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedDoc,
          questionCount: parseInt(questionCount),
          difficulty
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("Quiz generated successfully");
        setIsGenerateOpen(false);
        fetchQuizzes();
      } else {
        toast.error(data.error || "Failed to generate quiz");
      }
    } catch (error) {
      toast.error("Failed to generate quiz");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/api/quizzes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Quiz deleted");
        fetchQuizzes();
      } else {
        toast.error("Failed to delete quiz");
      }
    } catch (error) {
      toast.error("Failed to delete quiz");
    }
  };

  const startQuiz = async (quizSummary: any) => {
    try {
      const res = await apiFetch(`/api/quizzes/${quizSummary._id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveQuiz(data.data);
        setCurrentQuestionIndex(0);
        setSelectedAnswers(new Array(data.data.questions.length).fill(-1));
        setQuizResult(null);
      }
    } catch (error) {
      toast.error("Failed to load quiz");
    }
  };

  const handleAnswerSelect = (index: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = index;
    setSelectedAnswers(newAnswers);
  };

  const submitQuiz = async (forceSubmit: boolean = false) => {
    if (!forceSubmit && selectedAnswers.includes(-1)) {
      setShowSubmitConfirm(true);
      return;
    }
    
    let score = 0;
    activeQuiz.questions.forEach((q: any, idx: number) => {
      if (q.correctAnswerIndex === selectedAnswers[idx]) {
        score++;
      }
    });

    try {
      await apiFetch(`/api/quizzes/${activeQuiz._id}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score,
          totalQuestions: activeQuiz.questions.length,
          answers: selectedAnswers
        })
      });
      
      setQuizResult({ score, total: activeQuiz.questions.length, xp: score * 10 });
      fetchQuizzes();
      triggerStreakCheck('quiz');

      if (score / activeQuiz.questions.length >= 0.7) {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
        
        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);
          const particleCount = 50 * (timeLeft / duration);
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
      }

    } catch (error) {
      toast.error("Failed to submit quiz attempt");
    }
  };

  const filteredQuizzes = quizzes.filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (activeQuiz) {
    if (quizResult) {
      const percentage = Math.round((quizResult.score / quizResult.total) * 100);
      const isSuccess = percentage >= 70;
      
      return (
        <div className="p-4 sm:p-8 max-w-3xl mx-auto w-full flex flex-col min-h-[calc(100vh-4rem)]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center pt-10"
          >
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl relative
               ${isSuccess ? 'bg-emerald-500' : 'bg-orange-500'}`}>
               <Trophy className="h-10 w-10 text-white" />
               <div className="absolute -bottom-2 -right-2 bg-background p-1.5 rounded-full shadow-sm">
                 <div className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold border border-primary/20">
                   +{quizResult.xp} XP
                 </div>
               </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-2 tracking-tight">
              {isSuccess ? 'Brilliant Work!' : 'Good Effort!'}
            </h1>
            <p className="text-muted-foreground mb-8">You scored {quizResult.score} out of {quizResult.total} points.</p>
            
            <div className="w-full max-w-md bg-card rounded-2xl border p-6 shadow-sm mb-10 flex flex-col gap-4">
               <div className="flex justify-between items-end">
                 <div className="flex flex-col">
                   <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Accuracy</span>
                   <span className="text-4xl font-black">{percentage}%</span>
                 </div>
                 <div className="h-20 w-20 relative">
                   <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                     <circle cx="50" cy="50" r="44" fill="none" className="stroke-muted" strokeWidth="12" />
                     <circle cx="50" cy="50" r="44" fill="none" className={isSuccess ? "stroke-emerald-500" : "stroke-orange-500"} strokeWidth="12" strokeDasharray="276" strokeDashoffset={276 - (276 * percentage) / 100} strokeLinecap="round" />
                   </svg>
                 </div>
               </div>
            </div>
            
            <div className="w-full flex flex-col gap-4">
              <h3 className="font-bold text-lg px-2">Detailed Review</h3>
              {activeQuiz.questions.map((q: any, i: number) => {
                const isCorrect = q.correctAnswerIndex === selectedAnswers[i];
                return (
                  <div key={i} className={`p-5 rounded-2xl border bg-card ${isCorrect ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
                    <div className="flex gap-3 font-medium mb-4 text-base">
                      {isCorrect ? <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="text-red-500 shrink-0 mt-0.5" />}
                      <span className="leading-relaxed">{i + 1}. {q.question}</span>
                    </div>
                    <div className="pl-9 space-y-3 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Your Answer</span> 
                        <span className={`p-3 rounded-xl border ${isCorrect ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400"}`}>
                          {selectedAnswers[i] !== -1 ? q.options[selectedAnswers[i]] : 'Not answered'}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="flex flex-col gap-1 mt-3">
                          <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Correct Answer</span> 
                          <span className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                            {q.options[q.correctAnswerIndex]}
                          </span>
                        </div>
                      )}
                      {q.explanation && (
                        <div className="mt-4 text-muted-foreground bg-muted p-4 rounded-xl text-sm leading-relaxed border border-border/50">
                          <strong className="text-foreground block mb-1">Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-10 mb-20 w-full">
              <Button onClick={() => setActiveQuiz(null)} className="w-full h-12 rounded-xl text-base" variant="outline">
                Back to Dashboard
              </Button>
            </div>
          </motion.div>
        </div>
      );
    }

    const currentQ = activeQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / activeQuiz.questions.length) * 100;
    
    return (
      <div className="p-4 sm:p-8 max-w-3xl mx-auto w-full flex flex-col min-h-[calc(100vh-4rem)]">
        <div className="w-full flex items-center justify-between mb-8">
           <button onClick={() => setShowExitConfirm(true)} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors text-muted-foreground">
             <XCircle className="h-6 w-6" />
           </button>
           <div className="flex-1 px-8">
             <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
               <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
             </div>
           </div>
           <div className="text-sm font-bold text-muted-foreground w-12 text-right">
             {currentQuestionIndex + 1}/{activeQuiz.questions.length}
           </div>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col mt-4"
          >
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-8">
              {currentQ.question}
            </h2>
            
            <div className="flex flex-col gap-3">
               {currentQ.options.map((opt: string, i: number) => {
                 const isSelected = selectedAnswers[currentQuestionIndex] === i;
                 return (
                  <button 
                    key={i} 
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-[0_0_0_2px_rgba(var(--primary),0.2)]' 
                        : 'border-border/60 bg-card hover:border-primary/50 hover:bg-muted/30'
                    }`}
                    onClick={() => handleAnswerSelect(i)}
                  >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                      isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30 text-muted-foreground'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className={`text-[15px] sm:text-base ${isSelected ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                      {opt}
                    </span>
                  </button>
                 )
               })}
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="mt-8 pt-6 border-t flex justify-between items-center pb-8">
           <Button 
              variant="ghost" 
              size="lg"
              className="rounded-xl px-2 hover:bg-transparent hover:text-foreground text-muted-foreground disabled:opacity-30"
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)} 
              disabled={currentQuestionIndex === 0}
           >
             <ArrowLeft className="h-5 w-5 mr-2" /> Previous
           </Button>
           
           {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
             <Button size="lg" className="rounded-xl px-8" onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
               Continue <ArrowRight className="h-5 w-5 ml-2" />
             </Button>
           ) : (
             <Button size="lg" className="rounded-xl px-8 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => submitQuiz()}>
               Submit Quiz <CheckCircle2 className="h-5 w-5 ml-2" />
             </Button>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Quizzes</h1>
          <p className="text-muted-foreground text-sm">Test your knowledge and earn XP with AI-generated quizzes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button className="w-full sm:w-auto gap-2 rounded-xl h-10 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setIsGenerateOpen(true)}>
            <Brain className="h-4 w-4" />
            Generate Quiz
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-2 rounded-2xl border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search quizzes..." 
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
        ) : filteredQuizzes.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed rounded-3xl bg-muted/20 text-center mt-4">
             <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
               <Brain className="h-8 w-8 text-indigo-500" />
             </div>
             <h3 className="text-xl font-bold mb-2">No quizzes available</h3>
             <p className="text-muted-foreground mb-6 max-w-sm">Generate your first quiz from any document to start testing your knowledge.</p>
             <Button className="rounded-xl shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setIsGenerateOpen(true)}>
               Generate Quiz
             </Button>
          </div>
        ) : (
          filteredQuizzes.map((quiz) => (
            <motion.div 
              whileHover={{ y: -4 }} 
              key={quiz._id} 
              className="flex flex-col p-5 rounded-3xl border bg-card hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden" 
              onClick={() => startQuiz(quiz)}
            >
              <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
              
              <div className="flex justify-between items-start mb-4 z-10">
                <div className="px-2.5 py-1 rounded-full bg-muted text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                  {quiz.subject}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <button className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors opacity-0 group-hover:opacity-100 -mr-2" onClick={e => e.stopPropagation()}>
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  } />
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem className="text-red-500 focus:text-red-500 gap-2 rounded-lg" onClick={() => { setItemToDelete(quiz._id); }}>
                      <Trash className="h-4 w-4" /> Delete Quiz
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-indigo-600 transition-colors z-10 line-clamp-2">
                {quiz.title}
              </h3>
              
              <div className="flex items-center gap-4 text-[11px] font-medium text-muted-foreground mb-6 z-10">
                 <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> {quiz.questionsCount} Qs</span>
                 <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> ~{quiz.questionsCount * 1.5}m</span>
                 <span className="flex items-center gap-1.5 text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded-md"><Flame className="h-3.5 w-3.5" /> {quiz.questionsCount * 10} XP</span>
              </div>
              
              <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between z-10">
                 <div className="flex flex-col">
                   {quiz.attemptsCount > 0 ? (
                     <>
                       <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Best Score</span>
                       <span className="text-sm font-bold text-foreground">
                         {Math.round((quiz.avgScore / quiz.questionsCount) * 100)}%
                       </span>
                     </>
                   ) : (
                     <>
                       <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Status</span>
                       <span className="text-sm font-bold text-foreground">Not Started</span>
                     </>
                   )}
                 </div>
                 
                 <div className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${quiz.attemptsCount > 0 ? 'bg-background border shadow-sm group-hover:border-primary group-hover:text-primary' : 'bg-primary text-primary-foreground shadow-sm group-hover:bg-primary/90'}`}>
                   {quiz.attemptsCount > 0 ? "Retake" : "Start"}
                 </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    
      <ConfirmDialog 
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title="Delete Quiz"
        description="Are you sure you want to delete this quiz? This action cannot be undone."
        confirmText="Delete"
        destructive={true}
        onConfirm={() => {
          if (itemToDelete) {
            handleDelete(itemToDelete);
          }
          setItemToDelete(null);
        }}
      />
      
      <ConfirmDialog 
        open={showSubmitConfirm}
        onOpenChange={setShowSubmitConfirm}
        title="Submit Quiz"
        description="You have unanswered questions. Are you sure you want to submit?"
        confirmText="Submit"
        onConfirm={() => {
          submitQuiz(true);
          setShowSubmitConfirm(false);
        }}
      />
      
      <ConfirmDialog 
        open={showExitConfirm}
        onOpenChange={setShowExitConfirm}
        title="Exit Quiz"
        description="Are you sure you want to exit? Your progress will be lost."
        confirmText="Exit"
        destructive={true}
        onConfirm={() => {
          setActiveQuiz(null);
          setShowExitConfirm(false);
        }}
      />

      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader className="mb-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
               <Brain className="h-6 w-6 text-indigo-500" />
            </div>
            <DialogTitle className="text-xl">Generate Quiz</DialogTitle>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Questions</Label>
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-transparent hover:bg-muted focus:ring-indigo-500"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="5" className="rounded-lg">5</SelectItem>
                    <SelectItem value="10" className="rounded-lg">10</SelectItem>
                    <SelectItem value="15" className="rounded-lg">15</SelectItem>
                    <SelectItem value="20" className="rounded-lg">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-transparent hover:bg-muted focus:ring-indigo-500"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="easy" className="rounded-lg">Easy</SelectItem>
                    <SelectItem value="medium" className="rounded-lg">Medium</SelectItem>
                    <SelectItem value="hard" className="rounded-lg">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6 flex gap-3 sm:justify-start">
            <Button className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? "Generating Magic..." : "Generate AI Quiz"}
            </Button>
            <Button variant="outline" className="flex-1 h-12 rounded-xl font-semibold text-sm" onClick={() => setIsGenerateOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
