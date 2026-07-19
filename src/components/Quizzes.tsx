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
import { Brain, Plus, Filter, MoreVertical, Search, Trash, CheckCircle2, XCircle, ArrowRight, ArrowLeft, Clock, Target, Trophy, Flame, GraduationCap, ClipboardList, Play, Check, ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import { Badge } from "./ui/badge";
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
  const [activeTab, setActiveTab] = useState("All Quizzes");
  const [filterSubject, setFilterSubject] = useState("all");
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

  const uniqueSubjects = Array.from(new Set(quizzes.map(q => q.subject).filter(Boolean)));
  const filteredQuizzes = quizzes.filter(q => {
     const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
     const matchesSubject = filterSubject === 'all' || q.subject === filterSubject;
     let matchesTab = true;
     if (activeTab === 'Completed') matchesTab = q.attemptsCount > 0;
     else if (activeTab === 'In Progress') matchesTab = q.attemptsCount > 0 && Math.round((q.avgScore / q.questionsCount) * 100) < 100;
     else if (activeTab === 'Not Attempted') matchesTab = !q.attemptsCount;
     return matchesSearch && matchesSubject && matchesTab;
  });

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

  // Calculate real stats
  let totalQuizzesTaken = 0;
  let totalCorrect = 0;
  let totalQuestionsAttempted = 0;
  const subjectStats: Record<string, { correct: number, total: number }> = {};
  
  quizzes.forEach(q => {
    if (q.attemptsCount > 0) {
      totalQuizzesTaken++;
      const qCorrect = q.avgScore * q.attemptsCount;
      const qTotal = q.questionsCount * q.attemptsCount;
      
      totalCorrect += qCorrect;
      totalQuestionsAttempted += qTotal;
      
      if (q.subject) {
        if (!subjectStats[q.subject]) {
          subjectStats[q.subject] = { correct: 0, total: 0 };
        }
        subjectStats[q.subject].correct += qCorrect;
        subjectStats[q.subject].total += qTotal;
      }
    }
  });

  const totalQuestions = quizzes.reduce((acc, q) => acc + q.questionsCount, 0);
  const avgScorePct = totalQuestionsAttempted > 0 ? (totalCorrect / totalQuestionsAttempted) * 100 : 0;
  const bestScoreQuiz = quizzes.filter(q => q.attemptsCount > 0).sort((a, b) => (b.avgScore / b.questionsCount) - (a.avgScore / a.questionsCount))[0];

  const subjectArray = Object.entries(subjectStats).map(([name, stats]) => ({
    name,
    progress: Math.round((stats.correct / stats.total) * 100),
  })).sort((a, b) => b.progress - a.progress).slice(0, 5);

  const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-indigo-600', 'bg-amber-500', 'bg-rose-500'];
  const formattedSubjects = subjectArray.map((sub, i) => ({ ...sub, color: colors[i % colors.length] }));

  const todayStr = new Date().toDateString();
  const quizzesCompletedToday = quizzes.filter(q => q.attemptsCount > 0 && new Date(q.updatedAt || q.createdAt).toDateString() === todayStr).length;
  const dailyGoal = 3;
  const dailyProgress = Math.min(quizzesCompletedToday / dailyGoal, 1);

  const recentActivity = quizzes
    .filter(q => q.attemptsCount > 0)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
    .slice(0, 4)
    .map(q => {
      const s = Math.round((q.avgScore / q.questionsCount) * 100);
      return {
        icon: s >= 80 ? <Trophy className="h-4 w-4 text-emerald-600" /> : <CheckCircle2 className="h-4 w-4 text-blue-600" />,
        bg: s >= 80 ? "bg-emerald-50" : "bg-blue-50",
        title: `Completed ${q.title}`,
        subtitle: `Score: ${s}% • ${Math.round(q.avgScore)}/${q.questionsCount}`,
        time: new Date(q.updatedAt || q.createdAt).toLocaleDateString()
      }
    });

  return (
    <div className="flex flex-col xl:flex-row gap-8 p-6 md:p-8 max-w-[1600px] mx-auto w-full min-h-screen">
      {/* Left Column (Main Content) */}
      <div className="flex-1 flex flex-col gap-6 md:gap-8 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1 text-foreground">Quizzes</h1>
              <p className="text-muted-foreground text-sm font-medium">Test your knowledge and track your learning progress.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button className="w-full sm:w-auto gap-2 rounded-xl h-11 px-6 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium" onClick={() => setIsGenerateOpen(true)}>
              <Plus className="h-4 w-4" />
              Generate Quiz
            </Button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-2 p-5 rounded-2xl border bg-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Quizzes Taken</p>
                <h3 className="text-2xl font-bold text-foreground mb-1">{totalQuizzesTaken}</h3>
                <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <span className="text-[10px]">▲</span> 6 this week
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-5 rounded-2xl border bg-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Target className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Average Score</p>
                <h3 className="text-2xl font-bold text-foreground mb-1">{Math.round(avgScorePct)}%</h3>
                <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                  <span className="text-[10px]">▲</span> 9% this week
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-5 rounded-2xl border bg-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Best Score</p>
                <h3 className="text-2xl font-bold text-foreground mb-1">{bestScoreQuiz ? Math.round((bestScoreQuiz.avgScore / bestScoreQuiz.questionsCount) * 100) : 0}%</h3>
                <p className="text-xs font-medium text-muted-foreground truncate">{bestScoreQuiz ? bestScoreQuiz.title : 'Take a quiz!'}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-5 rounded-2xl border bg-card">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <ClipboardList className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total Questions</p>
                <h3 className="text-2xl font-bold text-foreground mb-1">{totalQuestions}</h3>
                <p className="text-xs font-medium text-muted-foreground">Across all quizzes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters / Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 mt-2">
          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
            {['All Quizzes', 'Completed', 'In Progress', 'Not Attempted'].map((tab) => {
              const isActive = activeTab === tab;
              
              let count = 0;
              if (tab === 'All Quizzes') count = quizzes.length;
              else if (tab === 'Completed') count = quizzes.filter(q => q.attemptsCount > 0).length;
              else if (tab === 'In Progress') count = quizzes.filter(q => q.attemptsCount > 0 && Math.round((q.avgScore / q.questionsCount) * 100) < 100).length;
              else if (tab === 'Not Attempted') count = quizzes.filter(q => !q.attemptsCount).length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-colors ${isActive ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-muted text-muted-foreground bg-transparent'}`}
                >
                  {tab} ({count})
                </button>
              )
            })}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-auto h-10 rounded-xl bg-transparent border-none font-semibold text-foreground focus:ring-0">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Subjects</SelectItem>
                {uniqueSubjects.map(sub => (
                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="rounded-xl shrink-0 h-10 w-10 text-muted-foreground border-border bg-card shadow-sm"><Filter className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Quiz List */}
        <div className="flex flex-col gap-3 pb-12">
          {loading ? (
             <div className="p-12 text-center text-muted-foreground">Loading...</div>
          ) : filteredQuizzes.length === 0 ? (
             <div className="p-12 text-center text-muted-foreground">No quizzes found.</div>
          ) : (
            filteredQuizzes.map((quiz) => {
              const score = quiz.attemptsCount > 0 ? Math.round((quiz.avgScore / quiz.questionsCount) * 100) : 0;
              let scoreColor = "text-muted-foreground border-border";
              if (quiz.attemptsCount > 0) {
                 if (score >= 80) scoreColor = "text-emerald-500 border-emerald-500/20";
                 else if (score >= 60) scoreColor = "text-amber-500 border-amber-500/20";
                 else scoreColor = "text-red-500 border-red-500/20";
              }

              return (
                <div key={quiz._id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border bg-card hover:shadow-md transition-all cursor-pointer group" onClick={() => startQuiz(quiz)}>
                  <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <GraduationCap className="h-6 w-6 text-indigo-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-base text-foreground truncate group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
                      {quiz.subject && <Badge variant="secondary" className="text-[10px] uppercase font-bold text-muted-foreground bg-muted hover:bg-muted tracking-wider rounded-md px-1.5 py-0.5">{quiz.subject}</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
                      <span>{quiz.questionsCount} Questions</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>{quiz.questionsCount * 1.5} min</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span>Created on {new Date(quiz.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="flex items-center gap-4">
                      <div className="relative w-10 h-10 flex flex-col items-center justify-center shrink-0">
                         {quiz.attemptsCount > 0 ? (
                           <>
                             <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                               <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/30" />
                               <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - score/100)} className={score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-blue-500"} strokeLinecap="round" />
                             </svg>
                             <div className="absolute inset-0 flex items-center justify-center">
                               <span className="text-xs font-bold text-foreground">-</span>
                             </div>
                           </>
                         ) : (
                           <>
                             <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                               <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
                             </svg>
                             <div className="absolute inset-0 flex items-center justify-center">
                               <span className="text-[10px] font-bold text-muted-foreground/40">-</span>
                             </div>
                           </>
                         )}
                      </div>
                      <div className="flex flex-col w-12">
                        <span className="text-sm font-bold text-foreground leading-none mb-0.5">{quiz.attemptsCount > 0 ? `${score}%` : '0%'}</span>
                        <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">Score</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                       <Button 
                         variant={quiz.attemptsCount > 0 ? "outline" : "default"}
                         className={`rounded-full px-5 h-9 text-xs font-bold ${quiz.attemptsCount === 0 ? 'bg-black hover:bg-black/90 text-white' : (score >= 100 ? 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100' : 'text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100')}`}
                         onClick={(e) => { e.stopPropagation(); startQuiz(quiz); }}
                       >
                         {quiz.attemptsCount > 0 ? (score >= 100 ? "Completed" : "Retake Quiz") : "Start Quiz"}
                       </Button>
                       <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <button className="h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors" onClick={e => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        } />
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem className="text-red-500 focus:text-red-500 gap-2 rounded-lg" onClick={(e) => { e.stopPropagation(); setItemToDelete(quiz._id); }}>
                            <Trash className="h-4 w-4" /> Delete Quiz
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          <div className="flex justify-between items-center mt-4">
             <span className="text-sm font-semibold text-muted-foreground">Showing 1 to {Math.min(8, filteredQuizzes.length)} of {quizzes.length} quizzes</span>
             <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-border/50 text-muted-foreground hover:bg-muted"><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="default" className="h-8 w-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-0 font-bold shadow-sm">1</Button>
                <Button variant="ghost" className="h-8 w-8 rounded-lg px-0 font-bold text-muted-foreground">2</Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-border/50 text-muted-foreground hover:bg-muted"><ChevronRight className="h-4 w-4" /></Button>
             </div>
          </div>
        </div>
      </div>

      {/* Right Column (Sidebar) */}
      <div className="w-full xl:w-[320px] 2xl:w-[340px] shrink-0 flex flex-col gap-6">
        
        {/* Your Performance Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-foreground">Your Performance</h3>
           </div>
           
           <div className="flex items-center gap-6 mb-6">
             <div className="relative w-[100px] h-[100px] shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                   <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/30" />
                   {/* Correct - Green */}
                   <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="263.89" strokeDashoffset={263.89 * (1 - (avgScorePct/100))} className="text-emerald-500" />
                   {/* Incorrect - Red (starts after green) */}
                   <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="263.89" strokeDashoffset={263.89 * (1 - (1 - avgScorePct/100))} className="text-red-500" style={{ transformOrigin: 'center', transform: `rotate(${(avgScorePct/100) * 360}deg)` }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-2xl font-bold text-foreground leading-none">{Math.round(avgScorePct)}%</span>
                   <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5">Avg Score</span>
                </div>
             </div>
             
             <div className="flex flex-col gap-2.5 flex-1">
                <div className="flex items-center justify-between text-xs">
                   <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                     <span className="font-bold text-foreground">Correct</span>
                   </div>
                   <div className="flex items-center gap-1 font-bold">
                     <span className="text-foreground">{Math.round(totalCorrect)}</span>
                     <span className="text-muted-foreground/60">({Math.round(avgScorePct)}%)</span>
                   </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                   <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                     <span className="font-bold text-foreground">Incorrect</span>
                   </div>
                   <div className="flex items-center gap-1 font-bold">
                     <span className="text-foreground">{Math.round(totalQuestionsAttempted - totalCorrect)}</span>
                     <span className="text-muted-foreground/60">({totalQuestionsAttempted > 0 ? 100 - Math.round(avgScorePct) : 0}%)</span>
                   </div>
                </div>
             </div>
           </div>
           
           <div className="w-full py-2.5 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-bold text-center flex items-center justify-center gap-1">
              <span>{totalQuizzesTaken > 0 ? '✓ Keep up the great work!' : 'Start your first quiz today!'}</span>
           </div>
        </div>

        {/* Subject Performance Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-foreground">Subject Performance</h3>
           </div>
           
           <div className="flex flex-col gap-5">
              {formattedSubjects.length > 0 ? formattedSubjects.map(sub => (
                <div key={sub.name} className="flex flex-col gap-2">
                   <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-foreground">{sub.name}</span>
                      <span className="text-foreground">{sub.progress}%</span>
                   </div>
                   <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${sub.color}`} style={{ width: `${sub.progress}%` }} />
                   </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">Take some quizzes to see your subject stats!</p>
              )}
           </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-foreground">Recent Activity</h3>
           </div>
           
           <div className="flex flex-col gap-5">
              {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
                <div key={i} className="flex gap-4">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${activity.bg}`}>
                     {activity.icon}
                   </div>
                   <div className="flex flex-col min-w-0 flex-1">
                      <h4 className="text-[13px] font-bold text-foreground truncate mb-0.5">{activity.title}</h4>
                      <p className="text-[11px] font-semibold text-muted-foreground">{activity.subtitle}</p>
                   </div>
                   <div className="text-[10px] font-bold text-muted-foreground text-right shrink-0 mt-1 whitespace-nowrap">
                      {activity.time}
                   </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity yet.</p>
              )}
           </div>
        </div>
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
