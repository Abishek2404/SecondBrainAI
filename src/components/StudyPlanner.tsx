import { apiFetch } from '../lib/api';
import { Calendar, Clock, CheckCircle2, Circle, AlertCircle, Plus, ChevronRight, ChevronLeft, CalendarPlus, GripVertical, Check, Target } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useStreak } from "./StreakProvider";
import { motion, Reorder } from "motion/react";

import { DashboardCardSkeleton, TaskItemSkeleton } from "./Skeletons";

export function StudyPlanner() {
  const { triggerStreakCheck } = useStreak();
  const [plans, setPlans] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Generator State
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [examDate, setExamDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const res = await apiFetch('/api/planner');
      if (res.ok) {
        const data = await res.json();
        setPlans(data.data);
        if (data.exams) {
          setExams(data.exams);
        }
      }
    } catch (error) {
      console.error("Error fetching plans", error);
    }
  };

  useEffect(() => {
    const loadPlans = async () => {
       setLoading(true);
       await fetchPlans();
       setLoading(false);
    };
    loadPlans();
  }, []);

  const handleGenerate = async () => {
    if (!topic || !examDate) {
      toast.error("Please fill in topic and exam date");
      return;
    }

    setIsGenerating(true);
    
    try {
      const res = await apiFetch('/api/planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          examDate,
          availableHoursPerDay: 2
        })
      });
      
      if (res.ok) {
        toast.success("Schedule generated successfully");
        setIsGenerateOpen(false);
        fetchPlans();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to generate schedule");
      }
    } catch (error) {
      toast.error("Failed to generate schedule");
    } finally {
      setIsGenerating(false);
    }
  };

  const getDaysArray = () => {
    const arr = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + i);
      arr.push(d);
    }
    return arr;
  };

  const daysArr = getDaysArray();
  const dateStr = currentDate.toISOString().split('T')[0];
  const todayPlan = plans.find(p => p.date === dateStr);
  const rawTasks = todayPlan?.tasks || [];
  
  // State for drag and drop reordering
  const [tasks, setTasks] = useState(rawTasks);

  useEffect(() => {
    setTasks(rawTasks);
  }, [dateStr, plans]);

  const toggleTaskStatus = async (taskIdx: number) => {
    if (!todayPlan) return;
    
    const isNowCompleted = tasks[taskIdx].status !== 'completed';
    const newTasks = [...tasks];
    newTasks[taskIdx].status = isNowCompleted ? 'completed' : 'pending';
    setTasks(newTasks);

    try {
      await apiFetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayPlan.date,
          tasks: newTasks
        })
      });
      if (isNowCompleted) {
        triggerStreakCheck('task');
      }
    } catch (error) {
      toast.error("Failed to update task");
      setTasks(rawTasks); // Revert on failure
    }
  };

  const upcomingExams = exams
    .map(exam => {
      const today = new Date();
      const examDateObj = new Date(exam.date);
      const diffTime = examDateObj.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        title: exam.title,
        date: examDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        daysLeft: diffDays,
        color: diffDays < 7 ? "bg-red-500" : "bg-amber-500"
      };
    })
    .filter(exam => exam.daysLeft >= 0 && exam.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const completedCount = tasks.filter((t:any) => t.status === 'completed').length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 md:gap-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Study Planner</h1>
          <p className="text-muted-foreground text-sm">Manage your study schedule, track upcoming exams, and stay organized.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="flex-1 sm:flex-none gap-2 rounded-xl h-10 shadow-sm" onClick={() => setIsGenerateOpen(true)}>
            <CalendarPlus className="h-4 w-4" /> AI Schedule Auto-Generation
          </Button>
          <Button className="flex-1 sm:flex-none gap-2 rounded-xl h-10 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Calendar & Tasks) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Calendar Week View */}
          <div className="bg-card border rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h2 className="font-bold text-2xl tracking-tight">{currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</h2>
              <div className="flex items-center gap-2 bg-muted p-1 rounded-xl w-fit">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-background shadow-sm transition-colors" onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(newDate.getDate() - 1);
                  setCurrentDate(newDate);
                }}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" className="h-8 text-xs font-semibold px-4 rounded-lg hover:bg-background shadow-sm transition-colors" onClick={() => setCurrentDate(new Date())}>Today</Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-background shadow-sm transition-colors" onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(newDate.getDate() + 1);
                  setCurrentDate(newDate);
                }}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {daysArr.map((dayObj, i) => {
                const isSelected = i === 3; // Center element
                const dayStr = dayObj.toLocaleDateString('default', { weekday: 'short' });
                const dateNum = dayObj.getDate();
                const dStr = dayObj.toISOString().split('T')[0];
                const hasPlan = plans.some(p => p.date === dStr && p.tasks.length > 0);
                
                return (
                  <div key={i} className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl transition-all cursor-pointer ${isSelected ? 'bg-indigo-600 text-white shadow-md scale-105' : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'}`} onClick={() => setCurrentDate(dayObj)}>
                    <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 ${isSelected ? 'text-indigo-200' : ''}`}>{dayStr}</span>
                    <span className="text-xl sm:text-2xl font-black">{dateNum}</span>
                    <div className={`w-1.5 h-1.5 rounded-full mt-2 transition-colors ${hasPlan ? (isSelected ? 'bg-white' : 'bg-indigo-500') : 'bg-transparent'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-bold text-xl">{currentDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0] ? "Today's Timeline" : `${currentDate.toLocaleDateString()}'s Timeline`}</h2>
              {tasks.length > 0 && (
                <div className="flex items-center gap-3">
                   <div className="text-sm font-bold text-muted-foreground">{completedCount}/{tasks.length} done</div>
                   <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                   </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              {loading ? (
                <div className="flex flex-col gap-3">
                   <TaskItemSkeleton />
                   <TaskItemSkeleton />
                   <TaskItemSkeleton />
                </div>
              ) : tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-3xl bg-muted/20 text-center">
                   <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
                     <Calendar className="h-8 w-8 text-indigo-500" />
                   </div>
                   <h3 className="text-xl font-bold mb-2">No tasks scheduled</h3>
                   <p className="text-muted-foreground mb-6 max-w-sm">Use the AI Schedule Auto-Generation to instantly build a personalized study plan.</p>
                   <Button variant="outline" className="rounded-xl shadow-sm" onClick={() => setIsGenerateOpen(true)}>
                     Generate Schedule
                   </Button>
                </div>
              ) : (
                <Reorder.Group axis="y" values={tasks} onReorder={setTasks} className="flex flex-col gap-3">
                  {tasks.map((task: any, idx: number) => (
                    <Reorder.Item key={task.title + idx} value={task} className="list-none">
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${task.status === 'completed' ? 'bg-muted/30 opacity-70 border-dashed' : 'bg-card hover:shadow-md hover:border-indigo-500/50 cursor-grab active:cursor-grabbing'}`}
                      >
                        <div className="text-muted-foreground/30 hidden sm:flex shrink-0">
                          <GripVertical className="h-5 w-5" />
                        </div>
                        <button className="shrink-0 transition-transform active:scale-90" onClick={() => toggleTaskStatus(idx)}>
                          {task.status === 'completed' ? (
                            <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                              <Check className="h-4 w-4 font-bold" />
                            </div>
                          ) : (
                            <div className="h-7 w-7 rounded-full border-2 border-muted-foreground/30 hover:border-indigo-500 transition-colors flex items-center justify-center bg-background" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold text-[15px] leading-tight truncate transition-colors ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {task.duration}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="uppercase tracking-wider text-[10px]">{task.type}</span>
                          </div>
                        </div>
                        {task.status !== 'completed' && (
                          <div className={`shrink-0 h-2 w-2 rounded-full ${idx === 0 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : idx === 1 ? 'bg-orange-500' : 'bg-muted-foreground/30'}`} />
                        )}
                      </motion.div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Exams & Goals) */}
        <div className="flex flex-col gap-6">
          
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Target className="h-32 w-32" />
            </div>
            <div className="relative z-10 flex flex-col h-full">
               <div className="flex items-center gap-2 mb-4">
                 <AlertCircle className="h-5 w-5 text-indigo-200" />
                 <h2 className="text-sm font-bold tracking-wider uppercase text-indigo-100">AI Recommendation</h2>
               </div>
               <p className="text-lg font-medium leading-relaxed mb-6 text-indigo-50">
                 You are slightly behind on your <strong className="text-white">Biology Midterm</strong> revision. I recommend dedicating an extra 45 minutes to <strong className="text-white">"Cell Structure"</strong> today.
               </p>
               <Button className="mt-auto bg-white text-indigo-600 hover:bg-white/90 rounded-xl font-bold h-10 w-full shadow-sm">
                 Adjust Schedule
               </Button>
            </div>
          </div>
          
          <Card className="rounded-3xl border shadow-sm">
            <CardHeader className="pb-4 border-b bg-muted/20 rounded-t-3xl">
              <CardTitle className="text-lg font-bold">Upcoming Exams</CardTitle>
              <CardDescription>Your roadmap for the next 30 days</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col divide-y">
                {upcomingExams.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8 px-4">
                    No upcoming exams in the next 30 days. You're clear!
                  </div>
                ) : (
                  upcomingExams.map((exam, i) => (
                    <div key={i} className="flex flex-col gap-2 p-5 bg-card hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start gap-4">
                        <span className="font-bold text-foreground leading-tight">{exam.title}</span>
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm border ${exam.daysLeft < 7 ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-orange-500/10 text-orange-600 border-orange-500/20"}`}>
                          In {exam.daysLeft} days
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mt-1">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {exam.date}</span>
                        <button className="text-indigo-600 hover:text-indigo-700 transition-colors">Plan Revision</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
      
      {/* AI Generate Dialog */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader className="mb-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
               <CalendarPlus className="h-6 w-6 text-indigo-500" />
            </div>
            <DialogTitle className="text-xl">Generate Study Schedule</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5">
            <div className="grid gap-2.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Topic / Subject</Label>
              <Input 
                placeholder="e.g. Biology 101 Midterm" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-12 rounded-xl bg-muted/50 border-transparent hover:bg-muted focus:ring-indigo-500 font-medium"
              />
            </div>
            <div className="grid gap-2.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Exam Date</Label>
              <Input 
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="h-12 rounded-xl bg-muted/50 border-transparent hover:bg-muted focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>
          <DialogFooter className="mt-6 flex gap-3 sm:justify-start">
            <Button className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? "Generating Magic..." : "Generate Schedule"}
            </Button>
            <Button variant="outline" className="flex-1 h-12 rounded-xl font-semibold text-sm" onClick={() => setIsGenerateOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
