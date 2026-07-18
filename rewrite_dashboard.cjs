const fs = require('fs');

const dashboardCode = `import { apiFetch } from '../lib/api';
import { 
  FileText, MessageSquare, BookOpen, Clock, TrendingUp, Sparkles, Plus, 
  ArrowRight, BrainCircuit, Zap, Flame, Trophy, Star, Target, ChevronDown, 
  MoreHorizontal, ChevronLeft, ChevronRight, Activity, CalendarDays, UploadCloud, 
  ExternalLink, LineChart, CheckCircle2, Check, LayoutDashboard, Code, PenTool, Database
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { motion, AnimatePresence } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart as RechartsLineChart, Line, XAxis, YAxis } from "recharts";
import { DashboardCardSkeleton, DetailedCardSkeleton } from "./Skeletons";
import { Button } from "./ui/button";

export function Dashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Unchanged state variables
  const [dailyTasksGoal, setDailyTasksGoal] = useState<number>(user?.dailyTasksGoal || 4);
  const [dailyHoursGoal, setDailyHoursGoal] = useState<number>(user?.dailyHoursGoal || 2);

  useEffect(() => {
    if (user) {
      setDailyTasksGoal(user.dailyTasksGoal || 4);
      setDailyHoursGoal(user.dailyHoursGoal || 2);
    }
  }, [user]);

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
  const xp = user?.xp || 480;
  const level = user?.level || 12;
  const coins = 120;
  
  const completedTasks = analytics?.todayCompletedTasks ?? 3;
  const goalProgressPct = Math.min(100, Math.round((completedTasks / (dailyTasksGoal || 4)) * 100));

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
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto w-full flex flex-col xl:flex-row gap-8 min-h-screen">
      
      {/* Center Content */}
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        
        {/* Hero Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[20px] bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/50 dark:from-indigo-950/20 dark:via-background dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/50 p-8 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-sm">
           <div className="flex flex-col z-10 w-full lg:w-auto">
               <h1 className="text-[28px] md:text-[32px] font-bold tracking-tight mb-2 text-foreground">Good Evening,<br/><span className="text-indigo-600 dark:text-indigo-400">{user?.name?.split(' ')[0] || 'Abishek'} 👋</span></h1>
               <p className="text-muted-foreground text-[15px] mb-8">Keep up the momentum. You're doing great!</p>
               
               <div className="flex flex-wrap items-center gap-4">
                   {/* Streak */}
                   <div className="flex items-center gap-3 bg-white dark:bg-card border shadow-sm rounded-2xl p-3 pr-6 hover:-translate-y-1 transition-transform cursor-pointer">
                      <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                          <Flame className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="flex flex-col">
                         <span className="font-bold text-lg leading-none mb-1">{currentStreakVal}</span>
                         <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Day Streak</span>
                      </div>
                   </div>

                   {/* Goal */}
                   <div className="flex items-center gap-3 bg-white dark:bg-card border shadow-sm rounded-2xl p-3 pr-6 hover:-translate-y-1 transition-transform cursor-pointer">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                          <Target className="h-5 w-5 text-indigo-500" />
                      </div>
                      <div className="flex flex-col">
                         <span className="font-bold text-lg leading-none mb-1">{goalProgressPct}%</span>
                         <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Today's Goal</span>
                      </div>
                   </div>

                   {/* XP */}
                   <div className="flex items-center gap-3 bg-white dark:bg-card border shadow-sm rounded-2xl p-3 pr-6 hover:-translate-y-1 transition-transform cursor-pointer">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                          <Zap className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex flex-col">
                         <span className="font-bold text-lg leading-none mb-1">{xp}</span>
                         <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">XP Earned</span>
                      </div>
                   </div>

                   {/* Coins */}
                   <div className="flex items-center gap-3 bg-white dark:bg-card border shadow-sm rounded-2xl p-3 pr-6 hover:-translate-y-1 transition-transform cursor-pointer">
                      <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                          <Star className="h-5 w-5 text-amber-500" />
                      </div>
                      <div className="flex flex-col">
                         <span className="font-bold text-lg leading-none mb-1">{coins}</span>
                         <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Coins</span>
                      </div>
                   </div>
               </div>
           </div>
           
           <div className="relative z-10 hidden xl:flex items-center justify-center shrink-0 gap-8">
               {/* 3D Illustration Placeholder */}
               <div className="w-[200px] h-[160px] relative">
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-[30px] -rotate-6 transform" />
                  <div className="absolute inset-0 bg-purple-500/10 rounded-[30px] rotate-3 transform" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-[30px] flex items-center justify-center shadow-inner backdrop-blur-sm">
                     <BrainCircuit className="h-16 w-16 text-indigo-600/50" />
                  </div>
               </div>
               
               {/* Goal Circle */}
               <div className="relative w-32 h-32 flex items-center justify-center bg-white dark:bg-card rounded-full shadow-lg border">
                  <svg className="w-28 h-28 -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" className="stroke-muted/30" strokeWidth="8" />
                    <circle 
                       cx="50" cy="50" r="44" 
                       fill="none" 
                       className="stroke-indigo-600 transition-all duration-1000 ease-out" 
                       strokeWidth="8" 
                       strokeDasharray="276.46" 
                       strokeDashoffset={276.46 - (276.46 * goalProgressPct) / 100} 
                       strokeLinecap="round" 
                     />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Today's Goal</span>
                    <span className="text-2xl font-bold tracking-tight text-indigo-600">{goalProgressPct}%</span>
                  </div>
               </div>
           </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-[16px] tracking-tight text-foreground">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
             {[
               { icon: UploadCloud, label: "Upload\\nDocument", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10", border: "border-indigo-100 dark:border-indigo-500/20", link: "/documents" },
               { icon: MessageSquare, label: "AI Chat", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-500/20", link: "/chat" },
               { icon: FileText, label: "Generate\\nNotes", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-500/20", link: "/notes" },
               { icon: BrainCircuit, label: "Generate\\nQuiz", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-100 dark:border-orange-500/20", link: "/quizzes" },
               { icon: BookOpen, label: "Flashcards", color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-500/10", border: "border-pink-100 dark:border-pink-500/20", link: "/flashcards" },
               { icon: CalendarDays, label: "AI Planner", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-100 dark:border-purple-500/20", link: "/planner" },
             ].map((action, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -2, scale: 1.02 }} 
                  onClick={() => navigate(action.link)}
                  className="flex items-center justify-center p-4 rounded-[20px] bg-card border shadow-sm cursor-pointer gap-3 hover:shadow-md transition-all group"
                >
                   <div className={\`h-10 w-10 rounded-2xl \${action.bg} \${action.border} border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform\`}>
                      <action.icon className={\`h-5 w-5 \${action.color}\`} strokeWidth={2} />
                   </div>
                   <span className="font-semibold text-sm leading-tight text-foreground/80 group-hover:text-foreground transition-colors whitespace-pre-line">{action.label}</span>
                </motion.div>
             ))}
          </div>
        </div>

        {/* Middle Row: Recent Documents & Continue Learning */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Recent Documents */}
           <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                 <h3 className="font-semibold text-[16px] tracking-tight">Recent Documents</h3>
                 <Link to="/documents" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View all</Link>
              </div>
              <div className="flex flex-col gap-3">
                 {documents.length > 0 ? documents.slice(0, 3).map((doc, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-[20px] bg-card border shadow-sm group hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/documents')}>
                      <div className="flex items-center gap-4 min-w-0">
                         <div className="h-10 w-10 shrink-0 rounded-[14px] bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center text-red-500 font-bold text-[10px] tracking-wider">
                           {doc.type === 'pdf' || doc.mimeType?.includes('pdf') ? 'PDF' : doc.type === 'txt' || doc.mimeType?.includes('text') ? 'TXT' : 'DOC'}
                         </div>
                         <div className="flex flex-col min-w-0">
                            <h4 className="font-semibold text-sm truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{doc.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[11px] text-muted-foreground">{Math.floor(Math.random() * 5 + 1)} MB</span>
                               <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                               <span className="text-[11px] text-muted-foreground">{Math.floor(Math.random() * 50 + 10)} pages</span>
                               <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                               <span className="text-[11px] text-muted-foreground">Updated {new Date(doc.createdAt).toLocaleDateString()}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                         <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 text-[10px] font-semibold">
                            <Check className="h-3 w-3" /> Summary Ready
                         </div>
                         <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); }}>
                            <MoreHorizontal className="h-4 w-4" />
                         </button>
                      </div>
                   </div>
                 )) : (
                   <div className="p-8 text-center text-muted-foreground bg-card border rounded-[20px] shadow-sm text-sm">
                      No recent documents found.
                   </div>
                 )}
              </div>
           </div>

           {/* Continue Learning */}
           <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                 <h3 className="font-semibold text-[16px] tracking-tight">Continue Learning</h3>
                 <Link to="/planner" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View all</Link>
              </div>
              <div className="flex flex-col gap-3">
                 {[
                   { title: "HTML & CSS Basics", progress: 78, icon: Code, color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30", bar: "bg-indigo-600" },
                   { title: "JavaScript Fundamentals", progress: 45, icon: PenTool, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", bar: "bg-amber-500" },
                   { title: "React Hooks & State", progress: 12, icon: Database, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", bar: "bg-emerald-500" },
                 ].map((course, i) => (
                    <div key={i} className="flex flex-col p-4 rounded-[20px] bg-card border shadow-sm group hover:shadow-md transition-all gap-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className={\`h-10 w-10 shrink-0 rounded-[14px] \${course.bg} flex items-center justify-center\`}>
                                <course.icon className={\`h-5 w-5 \${course.color}\`} />
                             </div>
                             <div className="flex flex-col">
                                <h4 className="font-semibold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{course.title}</h4>
                                <span className="text-[11px] text-muted-foreground mt-0.5">Keep pushing! You're almost there.</span>
                             </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-all rounded-lg">
                             Resume <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                             <div className={\`h-full \${course.bar} rounded-full\`} style={{ width: \`\${course.progress}%\` }} />
                          </div>
                          <span className="text-xs font-bold w-8 text-right">{course.progress}%</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

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
                       <BookOpen className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-sm font-medium leading-relaxed">
                       You haven't revised <strong>JavaScript</strong> in the last 5 days.
                    </p>
                    <Button variant="secondary" size="sm" className="w-full mt-auto bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-400 rounded-xl">
                       Review Now
                    </Button>
                 </div>
                 
                 <div className="bg-card border rounded-[20px] p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="h-10 w-10 rounded-[14px] bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-100 dark:border-orange-500/20">
                       <TrendingUp className="h-5 w-5 text-orange-500" />
                    </div>
                    <p className="text-sm font-medium leading-relaxed">
                       Your quiz accuracy improved by <strong>12%</strong> this week.
                    </p>
                    <Button variant="secondary" size="sm" className="w-full mt-auto bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 dark:text-orange-400 rounded-xl">
                       Keep It Up! 🎉
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
                           data={[
                             { name: 'Notes', value: 34, color: '#6366f1' },
                             { name: 'Quizzes', value: 28, color: '#3b82f6' },
                             { name: 'Flashcards', value: 24, color: '#cbd5e1' },
                             { name: 'Documents', value: 14, color: '#d946ef' },
                           ]}
                           cx="50%" cy="50%"
                           innerRadius={55}
                           outerRadius={75}
                           paddingAngle={2}
                           dataKey="value"
                           stroke="none"
                         >
                           { [
                             { name: 'Notes', value: 34, color: '#6366f1' },
                             { name: 'Quizzes', value: 28, color: '#3b82f6' },
                             { name: 'Flashcards', value: 24, color: '#cbd5e1' },
                             { name: 'Documents', value: 14, color: '#d946ef' },
                           ].map((entry, index) => (
                             <Cell key={\`cell-\${index}\`} fill={entry.color} />
                           ))}
                         </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                       <span className="text-xl font-bold tracking-tight">18h</span>
                       <span className="text-sm font-bold tracking-tight -mt-1">36m</span>
                       <span className="text-[9px] text-muted-foreground font-medium uppercase mt-1">Total Time</span>
                    </div>
                 </div>
                 
                 <div className="flex flex-col gap-3 flex-1 pl-8">
                    {[
                       { label: 'Notes', time: '6h 24m', pct: '34%', color: 'bg-indigo-500' },
                       { label: 'Quizzes', time: '5h 12m', pct: '28%', color: 'bg-blue-500' },
                       { label: 'Flashcards', time: '4h 30m', pct: '24%', color: 'bg-slate-300' },
                       { label: 'Documents', time: '2h 30m', pct: '14%', color: 'bg-fuchsia-500' },
                    ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                             <div className={\`w-2.5 h-2.5 rounded-full \${item.color}\`} />
                             <span className="font-medium text-foreground">{item.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="text-foreground">{item.time}</span>
                             <span className="text-muted-foreground text-xs w-8 text-right">({item.pct})</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* This Week's Progress */}
        <div className="flex flex-col gap-4">
           <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[16px] tracking-tight">This Week's Progress</h3>
              <span className="text-sm font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">+18%</span>
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
                       <ArrowRight className="h-3 w-3 -rotate-45" /> 4h 12m vs last week
                     </span>
                  </div>

                  {/* Tasks Completed */}
                  <div className="flex flex-col gap-1.5 border-l-2 border-emerald-500 pl-4">
                     <div className="flex items-center gap-2">
                       <div className="h-6 w-6 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                         <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                       </div>
                       <span className="text-xs text-muted-foreground font-medium">Tasks Completed</span>
                     </div>
                     <div className="text-2xl font-bold tracking-tight">
                       {analytics?.completedTasks || 84}
                     </div>
                     <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                       <ArrowRight className="h-3 w-3 -rotate-45" /> 17 vs last week
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
                       <ArrowRight className="h-3 w-3 -rotate-45" /> 9% vs last week
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
                       <ArrowRight className="h-3 w-3 -rotate-45" /> 2 vs last week
                     </span>
                  </div>
                </div>

                {/* Mini Line Chart Placeholder */}
                <div className="hidden lg:flex w-[200px] h-[70px] shrink-0 opacity-80">
                   <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={[
                        { v: 40 }, { v: 30 }, { v: 45 }, { v: 50 }, { v: 40 }, { v: 65 }, { v: 80 }
                      ]}>
                         <Line type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} />
                      </RechartsLineChart>
                   </ResponsiveContainer>
                </div>

              </div>
           </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full xl:w-[340px] shrink-0 flex flex-col gap-8">
         
         {/* Today's Tasks */}
         <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
               <h3 className="font-semibold text-[16px] tracking-tight">Today's Tasks</h3>
               <Link to="/planner" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View all</Link>
            </div>
            <div className="bg-card border rounded-[20px] p-2 shadow-sm flex flex-col">
               {[
                 { title: "Read about HTML semantic tags", type: "Reading", time: "30m", done: true, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
                 { title: "Practice CSS Flexbox", type: "Practice", time: "45m", done: false, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-500/10" },
                 { title: "Complete JavaScript Quiz", type: "Quiz", time: "20m", done: false, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
                 { title: "Review SQL Joins", type: "Reading", time: "30m", done: false, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-500/10" }
               ].map((task, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-[16px] hover:bg-muted/50 transition-colors cursor-pointer group">
                     <div className="flex items-center gap-3 min-w-0">
                        <div className={\`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center shrink-0 transition-colors \${task.done ? 'bg-indigo-600 border-indigo-600' : 'border-muted-foreground/30 group-hover:border-indigo-400'}\`}>
                           {task.done && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                        </div>
                        <span className={\`text-sm font-medium truncate \${task.done ? 'line-through text-muted-foreground' : 'text-foreground'}\`}>{task.title}</span>
                     </div>
                     <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className={\`text-[10px] font-semibold px-2 py-0.5 rounded-md \${task.bg} \${task.color}\`}>{task.type}</span>
                        <span className="text-xs text-muted-foreground w-6 text-right">{task.time}</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Upcoming Quiz */}
         <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
               <h3 className="font-semibold text-[16px] tracking-tight">Upcoming Quiz</h3>
               <Link to="/quizzes" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View all</Link>
            </div>
            <div className="bg-card border rounded-[20px] p-5 shadow-sm flex flex-col items-center text-center gap-4 group hover:shadow-md transition-all cursor-pointer">
               <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 group-hover:scale-110 transition-transform">
                  <BrainCircuit className="h-7 w-7 text-indigo-600" />
               </div>
               <div className="flex flex-col">
                  <h4 className="font-bold text-base mb-1">JavaScript Basics Quiz</h4>
                  <p className="text-xs text-muted-foreground mb-3">20 Questions • 15 min</p>
                  <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-foreground bg-muted rounded-full px-3 py-1">
                     <CalendarDays className="h-3 w-3" /> Tomorrow, 10:00 AM
                  </div>
               </div>
               <Button className="w-full rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 mt-2 font-semibold">
                  Start Quiz <ArrowRight className="h-4 w-4 ml-1.5" />
               </Button>
            </div>
         </div>

         {/* Recent Activity */}
         <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
               <h3 className="font-semibold text-[16px] tracking-tight">Recent Activity</h3>
               <Link to="/analytics" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View all</Link>
            </div>
            <div className="bg-card border rounded-[20px] p-2 shadow-sm flex flex-col">
               {[
                 { title: "You uploaded JavaScript Cheatsheet", time: "2m ago", icon: UploadCloud, color: "text-indigo-500", bg: "bg-indigo-50" },
                 { title: "AI generated notes for SQL Basics", time: "15m ago", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-50" },
                 { title: "You completed HTML Quiz", time: "1h ago", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
                 { title: "You created 10 new flashcards", time: "2h ago", icon: BookOpen, color: "text-pink-500", bg: "bg-pink-50" },
                 { title: "Study streak extended to 3 days!", time: "3h ago", icon: Flame, color: "text-orange-500", bg: "bg-orange-50" }
               ].map((act, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-[16px] hover:bg-muted/50 transition-colors cursor-pointer group">
                     <div className="flex items-center gap-3 min-w-0">
                        <div className={\`w-8 h-8 rounded-full \${act.bg} dark:bg-muted border border-border/50 flex items-center justify-center shrink-0\`}>
                           <act.icon className={\`h-4 w-4 \${act.color}\`} strokeWidth={2} />
                        </div>
                        <span className="text-sm font-medium truncate text-foreground/80 group-hover:text-foreground">{act.title}</span>
                     </div>
                     <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">{act.time}</span>
                  </div>
               ))}
            </div>
         </div>

      </div>

    </div>
  );
}
`;

fs.writeFileSync('src/components/Dashboard.tsx', dashboardCode);
console.log("Updated Dashboard");
