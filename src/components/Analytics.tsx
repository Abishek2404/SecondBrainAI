import { apiFetch } from '../lib/api';
import { Target, Zap, Clock, Trophy, TrendingUp, Calendar as CalendarIcon, CheckSquare, Flame, BrainCircuit, Activity } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { useStreak } from "./StreakProvider";
import { motion } from "motion/react";

import { DashboardCardSkeleton, DetailedCardSkeleton } from "./Skeletons";

export function Analytics() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiFetch('/api/dashboard');
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (error) {
        console.error("Error fetching analytics", error);
      }
    };
    fetchAnalytics();
  }, []);

  if (!data) return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div className="space-y-2 w-1/2">
           <div className="h-8 w-1/2 bg-muted animate-pulse rounded-md"></div>
           <div className="h-4 w-1/3 bg-muted animate-pulse rounded-md"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
        <DashboardCardSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
         <DetailedCardSkeleton />
         <DetailedCardSkeleton />
      </div>
    </div>
  );

  // Generate simulated heatmap data for the last 30 days
  const heatmapData = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return {
      date: d.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 5),
    };
  });

  const pieColors = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];
  const subjectPerformance = data.subjectPerformance?.length > 0 
    ? data.subjectPerformance 
    : [
        { subject: 'Biology', score: 85 },
        { subject: 'History', score: 72 },
        { subject: 'Physics', score: 91 },
        { subject: 'Math', score: 65 }
      ];

  const activityData = data.studyDistribution?.length > 0 
    ? data.studyDistribution
    : [
      { day: 'Mon', hours: 2, xp: 200 },
      { day: 'Tue', hours: 3, xp: 350 },
      { day: 'Wed', hours: 1.5, xp: 150 },
      { day: 'Thu', hours: 4, xp: 450 },
      { day: 'Fri', hours: 2.5, xp: 280 },
      { day: 'Sat', hours: 0, xp: 0 },
      { day: 'Sun', hours: 5, xp: 600 },
    ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Learning Analytics</h1>
          <p className="text-muted-foreground text-sm">Visualize your progress, track your XP, and optimize your study habits.</p>
        </div>
        <div className="flex items-center gap-2 bg-muted p-1 rounded-xl w-fit">
          <Button variant="ghost" className="h-8 text-xs font-semibold px-4 rounded-lg bg-background shadow-sm">7 Days</Button>
          <Button variant="ghost" className="h-8 text-xs font-semibold px-4 rounded-lg text-muted-foreground hover:text-foreground">30 Days</Button>
          <Button variant="ghost" className="h-8 text-xs font-semibold px-4 rounded-lg text-muted-foreground hover:text-foreground">All Time</Button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total XP Earned", value: `${(data.completedTasks * 50) + (data.totalQuizzesTaken * 100) + 500}`, trend: "+150 this week", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Tasks Completed", value: data.completedTasks || 12, trend: `Out of ${data.totalTasks || 24} total`, icon: CheckSquare, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Quiz Accuracy", value: `${data.avgQuizScore || 78}%`, trend: `${data.totalQuizzesTaken || 5} quizzes taken`, icon: Target, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Cards Mastered", value: data.masteredFlashcards || 45, trend: "Top 10% of users", icon: BrainCircuit, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="rounded-3xl border bg-card p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden group"
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${stat.bg} blur-2xl group-hover:scale-150 transition-transform duration-700`} />
            <div className="flex items-center gap-4 relative z-10">
              <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-muted-foreground">{stat.label}</span>
                <span className="text-2xl font-black tracking-tight">{stat.value}</span>
              </div>
            </div>
            <div className="mt-2 text-xs font-medium text-muted-foreground flex items-center gap-1.5 relative z-10">
              <TrendingUp className="h-3.5 w-3.5" />
              {stat.trend}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Activity Chart */}
        <div className="lg:col-span-2 rounded-3xl border bg-card shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Weekly Activity & XP</h2>
              <p className="text-sm text-muted-foreground mt-1">Your study hours and experience points over the last 7 days.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-indigo-500" /> Study Hours</div>
              <div className="flex items-center gap-1.5 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-orange-500" /> XP Earned</div>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))', marginBottom: '8px' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                <Line type="monotone" dataKey="xp" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316', strokeWidth: 2 }} yAxisId="right" />
                {/* Dummy hidden axis just to scale XP correctly if needed, or we just map it. For simplicity, we just render it on the same chart. */}
                <YAxis yAxisId="right" orientation="right" hide={true} domain={[0, 1000]} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Subjects Pie */}
        <div className="rounded-3xl border bg-card shadow-sm p-6 flex flex-col">
          <div className="mb-2">
            <h2 className="text-xl font-bold tracking-tight">Subject Mastery</h2>
            <p className="text-sm text-muted-foreground mt-1">Accuracy by topic</p>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectPerformance}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="score"
                  stroke="none"
                >
                  {subjectPerformance.map((entry:any, index:number) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'hsl(var(--card))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black">{Math.round(subjectPerformance.reduce((a:any, b:any) => a + b.score, 0) / subjectPerformance.length)}%</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Avg</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            {subjectPerformance.map((item:any, idx:number) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pieColors[idx % pieColors.length] }} />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold truncate max-w-[80px]">{item.subject}</span>
                  <span className="text-[10px] text-muted-foreground">{item.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 30 Day Activity Heatmap & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
        <div className="lg:col-span-2 rounded-3xl border bg-card p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
             <div>
               <h2 className="text-xl font-bold tracking-tight">Activity Heatmap</h2>
               <p className="text-sm text-muted-foreground mt-1">Your learning consistency over the last 30 days.</p>
             </div>
             <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
               Less <div className="flex gap-1">
                 <div className="w-3 h-3 rounded-sm bg-muted"></div>
                 <div className="w-3 h-3 rounded-sm bg-emerald-500/30"></div>
                 <div className="w-3 h-3 rounded-sm bg-emerald-500/60"></div>
                 <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
               </div> More
             </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] gap-2 sm:gap-3 w-full">
              {heatmapData.map((day, i) => {
                let colorClass = 'bg-muted';
                if (day.count === 1) colorClass = 'bg-emerald-500/30';
                if (day.count === 2 || day.count === 3) colorClass = 'bg-emerald-500/60';
                if (day.count >= 4) colorClass = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
                
                return (
                  <div 
                    key={i} 
                    className={`aspect-square rounded-lg ${colorClass} transition-colors hover:ring-2 hover:ring-offset-2 hover:ring-primary hover:ring-offset-background group relative cursor-pointer`}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded pointer-events-none whitespace-nowrap transition-opacity z-10">
                      {day.count} activities on {new Date(day.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-background p-6 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute right-0 top-0 p-6 opacity-10">
            <BrainCircuit className="h-24 w-24 text-indigo-500" />
          </div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">AI Insights</h2>
          </div>
          
          <div className="flex flex-col gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-background/60 backdrop-blur-sm border shadow-sm text-sm font-medium leading-relaxed">
              Your accuracy in <strong className="text-emerald-500">Physics</strong> has increased by 14% this week. Keep drilling those formula flashcards!
            </div>
            <div className="p-4 rounded-2xl bg-background/60 backdrop-blur-sm border shadow-sm text-sm font-medium leading-relaxed">
              You are most productive on <strong className="text-indigo-500">Sundays</strong>. I've automatically scheduled your heaviest review sessions for the weekend.
            </div>
          </div>
          
          <Button className="mt-auto w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 shadow-sm font-bold relative z-10">
            Generate Action Plan
          </Button>
        </div>
      </div>

    </div>
  );
}
