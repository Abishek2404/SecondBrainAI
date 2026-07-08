import { apiFetch } from '../lib/api';
import { Calendar, Clock, CheckCircle2, Circle, AlertCircle, Plus, ChevronRight, ChevronLeft, CalendarPlus } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function StudyPlanner() {
  const [plans, setPlans] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Generator State
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [examDate, setExamDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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
    fetchPlans();
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
  const tasks = todayPlan?.tasks || [];

  const toggleTaskStatus = async (taskIdx: number) => {
    if (!todayPlan) return;
    
    const newTasks = [...todayPlan.tasks];
    newTasks[taskIdx].status = newTasks[taskIdx].status === 'completed' ? 'pending' : 'completed';

    try {
      await apiFetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayPlan.date,
          tasks: newTasks
        })
      });
      fetchPlans();
    } catch (error) {
      toast.error("Failed to update task");
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
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Study Planner</h1>
          <p className="text-muted-foreground">Manage your study schedule and track upcoming exams.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="flex-1 sm:flex-none gap-2" onClick={() => setIsGenerateOpen(true)}>
            <CalendarPlus className="h-4 w-4" /> AI Schedule Generator
          </Button>
          <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Study Schedule</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Topic / Subject</Label>
                  <Input 
                    placeholder="e.g. Biology 101 Midterm" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Exam Date</Label>
                  <Input 
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>Cancel</Button>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Generate Schedule"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button className="flex-1 sm:flex-none gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Calendar & Tasks) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Calendar Week View */}
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-lg">{currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(newDate.getDate() - 1);
                  setCurrentDate(newDate);
                }}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="outline" className="h-8 text-xs font-medium px-3" onClick={() => setCurrentDate(new Date())}>Today</Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(newDate.getDate() + 1);
                  setCurrentDate(newDate);
                }}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {daysArr.map((dayObj, i) => {
                const isSelected = i === 3; // Center element
                const dayStr = dayObj.toLocaleDateString('default', { weekday: 'short' });
                const dateNum = dayObj.getDate();
                const dStr = dayObj.toISOString().split('T')[0];
                const hasPlan = plans.some(p => p.date === dStr && p.tasks.length > 0);
                
                return (
                  <div key={i} className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg border transition-colors cursor-pointer ${isSelected ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-muted/30 hover:bg-muted'}`} onClick={() => setCurrentDate(dayObj)}>
                    <span className={`text-[10px] sm:text-xs font-medium mb-1 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{dayStr}</span>
                    <span className={`text-base sm:text-lg font-bold ${isSelected ? '' : ''}`}>{dateNum}</span>
                    {hasPlan && <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-primary-foreground' : 'bg-emerald-500'}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">{currentDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0] ? "Today's Schedule" : `${currentDate.toLocaleDateString()}'s Schedule`}</h2>
              <span className="text-sm text-muted-foreground font-medium">{tasks.length} Tasks</span>
            </div>
            
            <div className="flex flex-col gap-3">
              {tasks.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground bg-card border rounded-xl shadow-sm">
                  No tasks scheduled for this day.
                </div>
              ) : (
                tasks.map((task: any, idx: number) => (
                  <div key={idx} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${task.status === 'completed' ? 'bg-muted/30 opacity-70' : 'bg-card hover:border-primary/50 shadow-sm'}`}>
                    <button className="mt-0.5 text-muted-foreground hover:text-primary transition-colors" onClick={() => toggleTaskStatus(idx)}>
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</h3>
                        <Badge variant="outline" className="shrink-0">{task.type}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs font-medium">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {task.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Exams & Goals) */}
        <div className="flex flex-col gap-8">
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Upcoming Exams</CardTitle>
              <CardDescription>Your exams in the next 30 days</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {upcomingExams.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-4">
                  No upcoming exams in the next 30 days.
                </div>
              ) : (
                upcomingExams.map((exam, i) => (
                  <div key={i} className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50 border">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-sm">{exam.title}</span>
                      <Badge variant={exam.daysLeft < 7 ? "destructive" : "secondary"}>
                        In {exam.daysLeft} days
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{exam.date}</span>
                      <button className="text-primary hover:underline font-medium">Plan Revision</button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-background border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">AI Study Recommendation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                You are slightly behind on your Biology Midterm revision. I recommend dedicating an extra 45 minutes to "Cell Structure" today.
              </p>
              <Button size="sm" className="w-full">Adjust Schedule</Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
