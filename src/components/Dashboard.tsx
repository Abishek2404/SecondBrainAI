import { apiFetch } from '../lib/api';
import { 
  FileText, MessageSquare, BookOpen, Clock, TrendingUp, Sparkles, Plus, 
  ArrowRight, BrainCircuit, Zap, Flame, Trophy, Star, Target, ChevronDown, 
  MoreHorizontal, ChevronLeft, ChevronRight, Activity, CalendarDays, UploadCloud, 
  ExternalLink, LineChart, CircleCheck, Check, LayoutDashboard, Code, PenTool, Database
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useStreak } from "./StreakProvider";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart as RechartsLineChart, Line, XAxis, YAxis } from "recharts";
import { DashboardCardSkeleton, DetailedCardSkeleton } from "./Skeletons";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

export function Dashboard() {
  const { user, updateUser } = useAuth();
  const { triggerStreakCheck } = useStreak();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyQuiz, setDailyQuiz] = useState<any>(null);
  const [loadingDailyQuiz, setLoadingDailyQuiz] = useState(true);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);

  useEffect(() => {
    if (analytics?.todayTasks) {
      setTodayTasks(analytics.todayTasks);
    }
  }, [analytics]);

  // Unchanged state variables
  const [dailyTasksGoal, setDailyTasksGoal] = useState<number>(user?.dailyTasksGoal || 4);
  const [dailyHoursGoal, setDailyHoursGoal] = useState<number>(user?.dailyHoursGoal || 2);

  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isGoalSaving, setIsGoalSaving] = useState(false);

  const handleSaveGoal = async () => {
    setIsGoalSaving(true);
    try {
      const res = await apiFetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dailyTasksGoal, dailyHoursGoal }),
      });
      if (res.ok) {
        const json = await res.json();
        updateUser(json.data);
        setIsGoalDialogOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGoalSaving(false);
    }
  };


  useEffect(() => {
    if (user) {
      setDailyTasksGoal(user.dailyTasksGoal || 4);
      setDailyHoursGoal(user.dailyHoursGoal || 2);
    }
  }, [user]);

  useEffect(() => {
    const fetchDailyQuiz = async () => {
      setLoadingDailyQuiz(true);
      try {
        const res = await apiFetch('/api/quizzes/daily');
        if (res.ok) {
          const json = await res.json();
          setDailyQuiz(json.data);
        }
      } catch (err) {
        console.error("Error fetching daily quiz", err);
      } finally {
        setLoadingDailyQuiz(false);
      }
    };
    fetchDailyQuiz();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [analyticsRes, documentsRes] = await Promise.all([
          apiFetch('/api/dashboard'),
          apiFetch('/api/documents')
        ]);
        
        if (analyticsRes.ok) {
          const json = await analyticsRes.json();
          setAnalytics(json.data);
        }
        
        if (documentsRes.ok) {
          const json = await documentsRes.json();
          setDocuments(json.data.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentStreakVal = user?.currentStreak !== undefined ? user.currentStreak : (analytics?.studyStreak || 0);
  const longestStreakVal = user?.longestStreak !== undefined ? user.longestStreak : (analytics?.studyStreak || 0);

  const completedTasks = analytics?.todayCompletedTasks ?? 0;
  const goalProgressPct = Math.min(100, Math.round((completedTasks / (dailyTasksGoal || 4)) * 100));

  const notesCount = analytics?.totalNotes || 0;
  const quizzesCount = analytics?.totalQuizzesTaken || 0;
  const flashcardsCount = analytics?.totalFlashcards || 0;
  const documentsCount = analytics?.totalDocuments || 0;

  const totalItemsCount = notesCount + quizzesCount + flashcardsCount + documentsCount;
  
  // Ratios (default to 25% each if no items exist)
  const hasData = totalItemsCount > 0;
  const chartData = hasData ? [
    { name: 'Notes', value: notesCount, color: '#6366f1' },
    { name: 'Quizzes', value: quizzesCount, color: '#3b82f6' },
    { name: 'Flashcards', value: flashcardsCount, color: '#cbd5e1' },
    { name: 'Documents', value: documentsCount, color: '#d946ef' },
  ] : [
    { name: 'Empty', value: 1, color: '#e2e8f0' }
  ];

  let insight1 = {
    iconName: "BookOpen",
    message: "You haven't revised any notes recently. Time to review!",
    action: "Review Notes",
    link: "/notes",
  };

  if (quizzesCount > notesCount && quizzesCount > 0) {
    insight1 = {
      iconName: "Target",
      message: `You've completed ${quizzesCount} quizzes! Great for active recall.`,
      action: "Take Another Quiz",
      link: "/quizzes",
    };
  } else if (notesCount > 0) {
    insight1 = {
      iconName: "BookOpen",
      message: `You have ${notesCount} notes. Testing yourself is the next step!`,
      action: "Generate a Quiz",
      link: "/quizzes",
    };
  } else if (flashcardsCount > 0) {
    insight1 = {
      iconName: "BrainCircuit",
      message: `You have ${flashcardsCount} flashcards. Spaced repetition builds memory.`,
      action: "Review Flashcards",
      link: "/flashcards",
    };
  }

  let insight2 = {
    iconName: "TrendingUp",
    message: "Complete tasks to build your daily study habit.",
    action: "Let's Go",
    link: "/planner",
  };

  if (completedTasks >= (dailyTasksGoal || 4)) {
    insight2 = {
      iconName: "Trophy",
      message: `You crushed your daily goal of ${dailyTasksGoal || 4} tasks!`,
      action: "View Progress",
      link: "/planner",
    };
  } else if (currentStreakVal > 2) {
    insight2 = {
      iconName: "Flame",
      message: `You're on a ${currentStreakVal}-day streak. Don't break it now!`,
      action: "Keep it up",
      link: "/planner",
    };
  } else if ((dailyTasksGoal || 4) > completedTasks) {
    insight2 = {
      iconName: "Target",
      message: `You are ${(dailyTasksGoal || 4) - completedTasks} task(s) away from your daily goal.`,
      action: "Complete Tasks",
      link: "/planner",
    };
  }


  const toggleDashboardTask = async (taskIdx: number) => {
    const task = todayTasks[taskIdx];
    const isNowCompleted = task.status !== 'completed';
    const newTasks = [...todayTasks];
    newTasks[taskIdx].status = isNowCompleted ? 'completed' : 'pending';
    setTodayTasks(newTasks);

    if (analytics) {
      const diff = isNowCompleted ? 1 : -1;
      setAnalytics({
        ...analytics,
        todayCompletedTasks: Math.max(0, (analytics.todayCompletedTasks || 0) + diff),
        completedTasks: Math.max(0, (analytics.completedTasks || 0) + diff)
      });
    }

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await apiFetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayStr,
          tasks: newTasks
        })
      });
      if (res.ok && isNowCompleted) {
        triggerStreakCheck('task');
      }
    } catch (error) {
      toast.error("Failed to update task");
      if (analytics?.todayTasks) {
        setTodayTasks(analytics.todayTasks);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-8 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-5 max-w-[1360px] mx-auto w-full flex flex-col gap-6 min-h-screen">
      
      {/* Top Flex Row containing Content Column and Sidebar */}
      <div className="w-full flex flex-col xl:flex-row gap-6">

         {/* Center Content Column */}
         <div className="flex-1 flex flex-col gap-6 min-w-0">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="rounded-[20px] p-8 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-sm border border-indigo-100/50 dark:border-indigo-900/30 bg-cover bg-center bg-no-repeat bg-[url('/mobile-bg.png')] md:bg-[url('/Wecome-bg.png')]"
        >
           {/* Glassmorphic Gradient Overlay to ensure perfect contrast and blending */}
           <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/40 dark:from-background/95 dark:via-background/90 dark:to-background/40 z-0" />

           <div className="flex flex-col z-10 w-full lg:w-auto relative">
               <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight mb-2 text-foreground">Welcome Back,<br/><span className="text-indigo-600 dark:text-indigo-400">{user?.name?.split(' ')[0] || 'Abishek'} 👋</span></h1>
               <p className="text-muted-foreground text-[15px] mb-8">Keep up the momentum. You're doing great!</p>
               
               <div className="flex flex-wrap items-center gap-4">
                   {/* Streak */}
                   <div className="flex items-center gap-3 bg-white/80 dark:bg-card/80 backdrop-blur-md border shadow-sm rounded-2xl p-3 pr-6 hover:-translate-y-1 transition-transform cursor-pointer">
                      <div className="h-10 w-10 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                          <img src="/learning-streak.svg" alt="Streak" className="h-10 w-10 object-contain" />
                      </div>
                      <div className="flex flex-col">
                         <span className="font-bold text-lg leading-none mb-1">{currentStreakVal}</span>
                         <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Day Streak</span>
                      </div>
                   </div>

                   {/* Goal with Dialog */}
                   <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                      <DialogTrigger nativeButton={false} render={
                          <div className="flex items-center gap-3 bg-white/80 dark:bg-card/80 backdrop-blur-md border shadow-sm rounded-2xl p-3 pr-6 hover:-translate-y-1 transition-transform cursor-pointer">
                             <div className="h-10 w-10  dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                 <img src="/target-hit-aim.svg" alt="Goal" className="h-10 w-10 object-contain" />
                             </div>
                             <div className="flex flex-col">
                                <span className="font-bold text-lg leading-none mb-1">{goalProgressPct}%</span>
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Today's Goal</span>
                             </div>
                          </div>
                        }
                      />
                     <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Set Daily Goal</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="target-tasks" className="text-right text-sm font-medium">Tasks</label>
                            <input
                              id="target-tasks"
                              type="number"
                              value={dailyTasksGoal}
                              onChange={(e) => setDailyTasksGoal(Number(e.target.value))}
                              className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="target-hours" className="text-right text-sm font-medium">Hours</label>
                            <input
                              id="target-hours"
                              type="number"
                              value={dailyHoursGoal}
                              onChange={(e) => setDailyHoursGoal(Number(e.target.value))}
                              className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button onClick={handleSaveGoal} disabled={isGoalSaving}>
                            {isGoalSaving ? "Saving..." : "Save changes"}
                          </Button>
                        </div>
                     </DialogContent>
                   </Dialog>
               </div>
           </div>
           
               
      
        </motion.div>

        {/* Middle Row: Recent Documents (Horizontal View) */}
         <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
               <h3 className="font-semibold text-[16px] tracking-tight">Recent Documents</h3>
               <Link to="/documents" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View all</Link>
            </div>
            {documents.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {documents.slice(0, 3).map((doc, i) => (
                    <div key={i} className="flex flex-col p-4 rounded-[20px] bg-card border shadow-sm group hover:shadow-md transition-all cursor-pointer justify-between gap-4" onClick={() => navigate('/documents')}>
                       <div className="flex items-start gap-4 min-w-0">
                          <div className="h-10 w-10 shrink-0 flex items-center justify-center">
                             <img src={doc.type === 'pdf' || doc.mimeType?.includes('pdf') ? '/pdf.svg.webp' : '/Doc%20File.png'} alt="Icon" className="h-full w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform" />
                           </div>
                          <div className="flex flex-col min-w-0 flex-1">
                             <h4 className="font-semibold text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{doc.title}</h4>
                             <span className="text-[11px] text-muted-foreground mt-0.5">Updated {new Date(doc.createdAt).toLocaleDateString()}</span>
                          </div>
                       </div>
                       
                       <div className="flex items-center justify-between mt-2 pt-2 border-t border-muted/50 w-full">
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                             <span>{Math.floor(Math.random() * 5 + 1)} MB</span>
                             <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                             <span>{Math.floor(Math.random() * 50 + 10)} pages</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 text-[10px] font-semibold">
                             <Check className="h-2.5 w-2.5" /> Ready
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            ) : (
               <div className="p-8 text-center text-muted-foreground bg-card border rounded-[20px] shadow-sm text-sm">
                  No recent documents found.
               </div>
            )}
         </div>

         {/* Continue Learning Row (Horizontal View) */}
         {analytics?.upcomingTasks && analytics.upcomingTasks.length > 0 && (
           <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                 <h3 className="font-semibold text-[16px] tracking-tight">Continue Learning</h3>
                 <Link to="/planner" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View all</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {analytics.upcomingTasks.slice(0, 3).map((task: any, i: number) => {
                    let Icon = Sparkles;
                    let color = "text-indigo-600";
                    let bg = "bg-indigo-100 dark:bg-indigo-900/30";
                    
                    if (task.type === 'Flashcards') { Icon = BrainCircuit; color = "text-pink-600"; bg = "bg-pink-100 dark:bg-pink-900/30"; }
                    else if (task.type === 'Reading') { Icon = BookOpen; color = "text-blue-600"; bg = "bg-blue-100 dark:bg-blue-900/30"; }
                    else if (task.type === 'Quiz') { Icon = Target; color = "text-orange-600"; bg = "bg-orange-100 dark:bg-orange-900/30"; }
                    else if (task.type === 'Notes') { Icon = FileText; color = "text-emerald-600"; bg = "bg-emerald-100 dark:bg-emerald-900/30"; }

                    return (
                    <div key={i} className="flex flex-col p-4 rounded-[20px] bg-card border shadow-sm group hover:shadow-md transition-all gap-4 justify-between h-full cursor-pointer" onClick={() => navigate('/planner')}>
                       <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                             <div className={`h-10 w-10 shrink-0 rounded-[14px] ${bg} flex items-center justify-center`}>
                                <Icon className={`h-5 w-5 ${color}`} />
                             </div>
                             <div className="flex flex-col min-w-0">
                                <h4 className="font-semibold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{task.title}</h4>
                                <span className="text-[11px] text-muted-foreground mt-0.5">{task.type}</span>
                             </div>
                          </div>
                       </div>
                       
                       <div className="flex flex-col gap-2 mt-2">
                          <div className="flex items-center justify-between text-xs">
                             <span className="text-muted-foreground font-medium flex items-center gap-1"><Clock className="h-3 w-3"/> {task.duration}</span>
                             <span className="font-bold text-indigo-600 dark:text-indigo-400">{task.date === new Date().toISOString().split('T')[0] ? 'Today' : task.date}</span>
                          </div>
                       </div>
                    </div>
                 )})}
              </div>
           </div>
         )}

         {/* AI Insights & Study Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* AI Insights */}
           <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-500" />
                    <h3 className="font-semibold text-[16px] tracking-tight">AI Insights</h3>
                 </div>
              </div>
              <p className="text-xs text-muted-foreground -mt-4 mb-1">Based on your study patterns</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="bg-card border rounded-[20px] p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="h-10 w-10 rounded-[14px] bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-500/20">
                        {insight1.iconName === "BookOpen" ? <BookOpen className="h-5 w-5 text-blue-500" /> : insight1.iconName === "Target" ? <Target className="h-5 w-5 text-blue-500" /> : <BrainCircuit className="h-5 w-5 text-blue-500" />}
                     </div>
                     <p className="text-sm font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: insight1.message.replace(/\d+/g, "<strong>$&</strong>") }} />
                     <Button variant="secondary" size="sm" className="w-full mt-auto bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-xl" onClick={() => navigate(insight1.link)}>
                        {insight1.action}
                     </Button>
                 </div>
                 
                 <div className="bg-card border rounded-[20px] p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="h-10 w-10 rounded-[14px] bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-100 dark:border-orange-500/20">
                        {insight2.iconName === "TrendingUp" ? <TrendingUp className="h-5 w-5 text-orange-500" /> : insight2.iconName === "Trophy" ? <Trophy className="h-5 w-5 text-orange-500" /> : insight2.iconName === "Flame" ? <Flame className="h-5 w-5 text-orange-500" /> : <Target className="h-5 w-5 text-orange-500" />}
                     </div>
                     <p className="text-sm font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: insight2.message.replace(/\d+/g, "<strong>$&</strong>") }} />
                     <Button variant="secondary" size="sm" className="w-full mt-auto bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 dark:text-orange-400 rounded-xl" onClick={() => navigate(insight2.link)}>
                        {insight2.action}
                     </Button>
                 </div>
              </div>
           </div>

           {/* Study Overview Donut */}
           <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between mb-2">
                 <h3 className="font-semibold text-[16px] tracking-tight">Study Overview</h3>
                 <span className="text-xs font-medium text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-foreground">This Week <ChevronDown className="h-3 w-3" /></span>
              </div>
              <div className="bg-card border rounded-[20px] p-6 shadow-sm flex items-center h-[230px]">
                 <div className="w-[160px] h-[160px] relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie
                           data={chartData}
                           cx="50%" cy="50%"
                           innerRadius={55}
                           outerRadius={75}
                           paddingAngle={hasData ? 2 : 0}
                           dataKey="value"
                           stroke="none"
                         >
                           { chartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                         </Pie>
                      </PieChart>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                       <span className="text-2xl font-bold tracking-tight">{totalItemsCount}</span>
                       <span className="text-[10px] text-muted-foreground font-medium uppercase mt-1">Total Items</span>
                    </div>
                    </ResponsiveContainer>
                 </div>
                 
                 <div className="flex flex-col gap-3 flex-1 pl-8">
                    {[
                       { label: 'Notes', count: notesCount, color: 'bg-indigo-500' },
                       { label: 'Quizzes', count: quizzesCount, color: 'bg-blue-500' },
                       { label: 'Flashcards', count: flashcardsCount, color: 'bg-slate-300' },
                       { label: 'Documents', count: documentsCount, color: 'bg-fuchsia-500' },
                    ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                             <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                             <span className="font-medium text-foreground">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="text-foreground font-medium">{item.count}</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

                    </div>

      {/* Right Sidebar */}
      <div className="w-full xl:w-[320px] shrink-0 flex flex-col gap-6">
         
         {/* Today's Tasks */}
         <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
               <h3 className="font-semibold text-[16px] tracking-tight">Today's Tasks</h3>
               <Link to="/planner" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View all</Link>
            </div>
            <div className="bg-card border rounded-[20px] p-2 shadow-sm flex flex-col min-h-[100px] justify-center">
                {todayTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-6 py-8">
                     <CalendarDays className="h-8 w-8 text-muted-foreground/50 mb-2" />
                     <p className="text-xs text-muted-foreground font-medium mb-3">No tasks scheduled for today</p>
                     <Button size="sm" variant="outline" className="text-xs h-8 rounded-xl font-bold border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20" onClick={() => navigate('/planner')}>
                       Go to Planner
                     </Button>
                  </div>
                ) : (
                  todayTasks.map((task, i) => {
                     const isDone = task.status === 'completed';
                     let color = "text-amber-600 dark:text-amber-400";
                     let bg = "bg-amber-50 dark:bg-amber-500/10";
                     if (task.type === 'Reading') {
                       color = "text-indigo-600 dark:text-indigo-400";
                       bg = "bg-indigo-50 dark:bg-indigo-500/10";
                     } else if (task.type === 'Practice') {
                       color = "text-purple-600 dark:text-purple-400";
                       bg = "bg-purple-50 dark:bg-purple-500/10";
                     } else if (task.type === 'Quiz') {
                       color = "text-blue-600 dark:text-blue-400";
                       bg = "bg-blue-50 dark:bg-blue-500/10";
                     }
                     return (
                        <div 
                           key={i} 
                           onClick={() => toggleDashboardTask(i)}
                           className="flex items-center justify-between p-3 rounded-[16px] hover:bg-muted/50 transition-colors cursor-pointer group"
                        >
                           <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center shrink-0 transition-colors ${isDone ? 'bg-indigo-600 border-indigo-600' : 'border-muted-foreground/30 group-hover:border-indigo-400'}`}>
                                 {isDone && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                              </div>
                              <span className={`text-sm font-medium truncate ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</span>
                           </div>
                           <div className="flex items-center gap-3 shrink-0 ml-2">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${bg} ${color}`}>{task.type}</span>
                              <span className="text-xs text-muted-foreground w-8 text-right">{task.duration || "30m"}</span>
                           </div>
                        </div>
                     );
                  })
                )}
             </div>
          </div>

         {/* Daily Quiz */}
         <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
               <h3 className="font-semibold text-[16px] tracking-tight">Daily Refresher</h3>
               <Link to="/quizzes" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View all</Link>
            </div>
            
            {loadingDailyQuiz ? (
               <div className="bg-card border rounded-[20px] p-5 shadow-sm flex flex-col items-center text-center gap-4 h-full min-h-[220px] justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="text-sm text-muted-foreground">Preparing your daily quiz...</p>
               </div>
            ) : dailyQuiz ? (
               <div className="bg-card border rounded-[20px] p-5 shadow-sm flex flex-col items-center text-center gap-4 group hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/quizzes', { state: { autoStartQuizId: dailyQuiz._id } })}>
                  <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 group-hover:scale-110 transition-transform">
                     <BrainCircuit className="h-7 w-7 text-indigo-600" />
                  </div>
                  <div className="flex flex-col">
                     <h4 className="font-bold text-base mb-1 truncate px-2">{dailyQuiz.title}</h4>
                     <p className="text-xs text-muted-foreground mb-3">{dailyQuiz.questions?.length || 0} Questions • ~5 min</p>
                     <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-foreground bg-muted rounded-full px-3 py-1">
                        <CalendarDays className="h-3 w-3" /> Today
                     </div>
                  </div>
                  <Button className="w-full rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 mt-2 font-semibold">
                     Start Quiz <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
               </div>
            ) : (
               <div className="bg-card border rounded-[20px] p-5 shadow-sm flex flex-col items-center text-center gap-4 h-full min-h-[220px] justify-center">
                  <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                     <BrainCircuit className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <div className="flex flex-col">
                     <h4 className="font-bold text-base mb-1">No Daily Quiz</h4>
                     <p className="text-xs text-muted-foreground">Upload documents to get daily quizzes.</p>
                  </div>
                  <Button variant="outline" className="w-full rounded-xl font-semibold" onClick={() => navigate('/documents')}>
                     Upload Documents
                  </Button>
               </div>
            )}
         </div>

         {/* Recent Activity */}
         <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
               <h3 className="font-semibold text-[16px] tracking-tight">Recent Activity</h3>
            </div>
            <div className="bg-card border rounded-[20px] p-2 shadow-sm flex flex-col">
               {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
                 analytics.recentActivity.slice(0, 6).map((act: any, i: number) => {
                   let Icon = Sparkles;
                   let color = "text-indigo-500";
                   let bg = "bg-indigo-50 dark:bg-indigo-500/10";
                   if (act.type === "document") {
                     Icon = UploadCloud;
                     color = "text-blue-500";
                     bg = "bg-blue-50 dark:bg-blue-500/10";
                   } else if (act.type === "note") {
                     Icon = BookOpen;
                     color = "text-emerald-500";
                     bg = "bg-emerald-50 dark:bg-emerald-500/10";
                   } else if (act.type === "quiz") {
                     Icon = CircleCheck;
                     color = "text-orange-500";
                     bg = "bg-orange-50 dark:bg-orange-500/10";
                   } else if (act.type === "deck") {
                     Icon = BrainCircuit;
                     color = "text-pink-500";
                     bg = "bg-pink-50 dark:bg-pink-500/10";
                   }

                   return (
                     <div key={i} className="flex items-center justify-between p-3 rounded-[16px] hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3 min-w-0">
                           <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                              {act.type === "document" ? <UploadCloud className={`h-4 w-4 ${color}`} strokeWidth={2} /> : act.type === "note" ? <BookOpen className={`h-4 w-4 ${color}`} strokeWidth={2} /> : act.type === "quiz" ? <CircleCheck className={`h-4 w-4 ${color}`} strokeWidth={2} /> : act.type === "deck" ? <BrainCircuit className={`h-4 w-4 ${color}`} strokeWidth={2} /> : <Sparkles className={`h-4 w-4 ${color}`} strokeWidth={2} />}
                           </div>
                           <span className="text-sm font-medium truncate text-foreground/80 group-hover:text-foreground">{act.title}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                           {new Date(act.createdAt).toLocaleDateString()}
                        </span>
                     </div>
                   );
                 })
               ) : (
                 <div className="p-4 text-center text-sm text-muted-foreground">No recent activity yet. Start studying!</div>
               )}
            </div>
         </div>

      </div>

    </div> {/* Close Top Section flex-row */}

      {/* This Week's Progress (At the bottom of the page) */}
      <div className="flex flex-col gap-4 mt-4 border-t pt-6">
         <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[16px] tracking-tight">This Week's Progress</h3>
            
         </div>
         
         <div className="rounded-[20px] border bg-card p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 flex-1 w-full">
                {/* Study Time */}
                <div className="flex flex-col gap-1.5 border-l-2 border-indigo-500 pl-4">
                   <div className="flex items-center gap-2">
                     <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                       <Clock className="h-3 w-3 text-indigo-600" />
                     </div>
                     <span className="text-xs text-muted-foreground font-medium">Study Time</span>
                   </div>
                   <div className="text-2xl font-bold tracking-tight">
                     {Math.floor(analytics?.totalStudyHours || 24)}h {Math.round(((analytics?.totalStudyHours || 24.6) % 1) * 60)}m
                   </div>
                   <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                   </span>
                </div>

                {/* Tasks Completed */}
                <div className="flex flex-col gap-1.5 border-l-2 border-emerald-500 pl-4">
                   <div className="flex items-center gap-2">
                     <div className="h-6 w-6 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                       <CircleCheck className="h-3 w-3 text-emerald-600" />
                     </div>
                     <span className="text-xs text-muted-foreground font-medium">Tasks Completed</span>
                   </div>
                   <div className="text-2xl font-bold tracking-tight">
                     {analytics?.completedTasks || 84}
                   </div>
                   <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                   </span>
                </div>

                {/* Quiz Accuracy */}
                <div className="flex flex-col gap-1.5 border-l-2 border-pink-500 pl-4">
                   <div className="flex items-center gap-2">
                     <div className="h-6 w-6 rounded-full bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center shrink-0">
                       <TrendingUp className="h-3 w-3 text-pink-600" />
                     </div>
                     <span className="text-xs text-muted-foreground font-medium">Quiz Accuracy</span>
                   </div>
                   <div className="text-2xl font-bold tracking-tight">
                     {analytics?.avgQuizScore || 87}%
                   </div>
                   <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                   </span>
                </div>

                {/* Documents Processed */}
                <div className="flex flex-col gap-1.5 border-l-2 border-blue-500 pl-4">
                   <div className="flex items-center gap-2">
                     <div className="h-6 w-6 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                       <FileText className="h-3 w-3 text-blue-600" />
                     </div>
                     <span className="text-xs text-muted-foreground font-medium">Docs Processed</span>
                   </div>
                   <div className="text-2xl font-bold tracking-tight">
                     {analytics?.totalDocuments || 3}
                   </div>
                   <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                   </span>
                </div>
              </div>

              {/* Mini Line Chart Placeholder */}
              <div className="hidden lg:flex w-[200px] h-[70px] shrink-0 opacity-80">
                 {analytics?.studyDistribution && analytics.studyDistribution.length > 0 && (
                 <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={analytics.studyDistribution}>
                       <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                    </RechartsLineChart>
                 </ResponsiveContainer>
                 )}
              </div>

            </div>
         </div>
      </div>
</div>
  );
}
