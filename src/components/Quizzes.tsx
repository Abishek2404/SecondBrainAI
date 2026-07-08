import { apiFetch } from '../lib/api';
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ConfirmDialog } from "./ui/confirm-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Brain, Filter, MoreVertical, Play, Plus, Search, Trash, CheckCircle2, XCircle } from "lucide-react";

export function Quizzes() {
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
    fetchQuizzes();
    fetchDocuments();
  }, []);

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
      
      setQuizResult({ score, total: activeQuiz.questions.length });
      fetchQuizzes(); // Update attempts count
    } catch (error) {
      toast.error("Failed to submit quiz attempt");
    }
  };

  const filteredQuizzes = quizzes.filter(q => q.title.toLowerCase().includes(searchQuery.toLowerCase()));

  if (activeQuiz) {
    if (quizResult) {
      return (
        <div className="p-4 sm:p-8 max-w-3xl mx-auto w-full flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full text-center p-8">
            <CardHeader>
              <CardTitle className="text-3xl font-bold mb-2">Quiz Complete!</CardTitle>
              <CardDescription className="text-lg">You scored {quizResult.score} out of {quizResult.total}</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="text-6xl font-black text-primary mb-8">
                 {Math.round((quizResult.score / quizResult.total) * 100)}%
               </div>
               
               <div className="text-left space-y-6 mt-8">
                  {activeQuiz.questions.map((q: any, i: number) => {
                    const isCorrect = q.correctAnswerIndex === selectedAnswers[i];
                    return (
                      <div key={i} className="p-4 rounded-lg border bg-muted/30">
                        <div className="flex gap-3 font-medium mb-3">
                          {isCorrect ? <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="text-red-500 shrink-0 mt-0.5" />}
                          <span>{i + 1}. {q.question}</span>
                        </div>
                        <div className="pl-9 space-y-2 text-sm">
                          <p>
                            <span className="text-muted-foreground mr-2">Your answer:</span> 
                            <span className={isCorrect ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
                              {selectedAnswers[i] !== -1 ? q.options[selectedAnswers[i]] : 'Not answered'}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p>
                              <span className="text-muted-foreground mr-2">Correct answer:</span> 
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">{q.options[q.correctAnswerIndex]}</span>
                            </p>
                          )}
                          {q.explanation && (
                            <p className="mt-2 text-muted-foreground italic border-l-2 pl-3">{q.explanation}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
               </div>
            </CardContent>
            <CardFooter className="justify-center mt-8">
               <Button onClick={() => setActiveQuiz(null)}>Back to Quizzes</Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    const currentQ = activeQuiz.questions[currentQuestionIndex];
    return (
      <div className="p-4 sm:p-8 max-w-3xl mx-auto w-full flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">{activeQuiz.title}</h2>
            <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}</p>
          </div>
          <Button variant="ghost" onClick={() => setShowExitConfirm(true)}>Exit Quiz</Button>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
             {currentQ.options.map((opt: string, i: number) => (
                <Button 
                  key={i} 
                  variant={selectedAnswers[currentQuestionIndex] === i ? 'default' : 'outline'} 
                  className={`justify-start h-auto py-3 px-4 text-left whitespace-normal font-normal ${selectedAnswers[currentQuestionIndex] === i ? 'border-primary' : ''}`}
                  onClick={() => handleAnswerSelect(i)}
                >
                  <span className="mr-3 w-6 h-6 flex items-center justify-center rounded-full bg-background/20 text-xs shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </Button>
             ))}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
             <Button 
                variant="outline" 
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)} 
                disabled={currentQuestionIndex === 0}
             >
               Previous
             </Button>
             
             {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
               <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                 Next
               </Button>
             ) : (
               <Button onClick={() => submitQuiz()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                 Submit Quiz
               </Button>
             )}
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Quizzes</h1>
          <p className="text-muted-foreground">Test your knowledge with AI-generated quizzes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button className="w-full sm:w-auto gap-2 shadow-sm" onClick={() => setIsGenerateOpen(true)}>
            <Brain className="h-4 w-4" />
            Generate Quiz
          </Button>
          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Quiz</DialogTitle>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Number of Questions</Label>
                    <Select value={questionCount} onValueChange={setQuestionCount}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Difficulty</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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

      <div className="flex gap-2 w-full md:w-auto">
        <div className="relative flex-1 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search quizzes..." 
            className="pl-9 bg-card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="shrink-0"><Filter className="h-4 w-4" /></Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-10">
            No quizzes found. Auto-generate one from a document!
          </div>
        ) : (
          filteredQuizzes.map((quiz) => (
            <Card key={quiz._id} className="hover:shadow-md transition-all hover:border-primary/50 cursor-pointer group flex flex-col" onClick={() => startQuiz(quiz)}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="font-normal">{quiz.subject}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    } />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-red-500 focus:text-red-500 gap-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setItemToDelete(quiz._id); }}>
                        <Trash className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="leading-tight group-hover:text-primary transition-colors">{quiz.title}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-1">
                   {new Date(quiz.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <div className="flex flex-col gap-1.5 mt-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">Questions</span>
                    <span>{quiz.questionsCount}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium mt-1">
                    <span className="text-muted-foreground">Attempts</span>
                    <span>{quiz.attemptsCount}</span>
                  </div>
                  {quiz.attemptsCount > 0 && (
                    <div className="flex justify-between text-xs font-medium mt-1">
                      <span className="text-muted-foreground">Average Score</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {Math.round((quiz.avgScore / quiz.questionsCount) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                 <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" onClick={(e) => { e.stopPropagation(); startQuiz(quiz); }}>
                   {quiz.attemptsCount > 0 ? "Retake Quiz" : "Start Quiz"}
                 </Button>
              </CardFooter>
            </Card>
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
</div>
  );
}
