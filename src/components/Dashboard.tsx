import { apiFetch } from '../lib/api';
import { FileText, MessageSquare, BookOpen, Clock, TrendingUp, Sparkles, Plus, ArrowRight, BrainCircuit, Zap } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export function Dashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiFetch('/api/dashboard');
        if (res.ok) {
          const json = await res.json();
          setAnalytics(json.data);
        }
      } catch (error) {
        console.error("Error fetching analytics", error);
      }
    };

    const fetchDocuments = async () => {
      try {
        const res = await apiFetch('/api/documents');
        if (res.ok) {
          const json = await res.json();
          setDocuments(json.data.slice(0, 4)); // Only top 4
        }
      } catch (error) {
        console.error("Error fetching documents", error);
      }
    };

    fetchAnalytics();
    fetchDocuments();
  }, []);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to SecondBrain.</h1>
          <p className="text-muted-foreground">Turn your documents into active learning sessions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/chat" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <MessageSquare className="h-4 w-4" />
            New Chat
          </Link>
          <Link to="/documents" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Upload Document
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Learning Streak", value: analytics ? `${analytics.studyStreak || 0} Days` : null, subtext: "Active streak", icon: Zap },
          { label: "Study Tasks", value: analytics ? analytics.totalTasks : null, subtext: analytics ? `${analytics.completedTasks || 0} completed` : null, icon: Clock },
          { label: "Documents Analysed", value: analytics ? analytics.totalDocuments : null, subtext: "Processed by AI", icon: FileText },
          { label: "AI Flashcards", value: analytics ? analytics.totalFlashcards : null, subtext: analytics ? `${analytics.masteredFlashcards || 0} mastered` : null, icon: Sparkles },
          { label: "Avg. Quiz Score", value: analytics ? `${analytics.avgQuizScore || 0}%` : null, subtext: analytics ? `${analytics.totalQuizzesTaken || 0} taken` : null, icon: TrendingUp },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between text-muted-foreground mb-2 relative z-10">
              <span className="text-sm font-medium">{stat.label}</span>
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 relative z-10">
              {stat.value !== null ? (
                <span className="text-3xl font-bold tracking-tight">{stat.value}</span>
              ) : (
                <div className="h-9 w-16 bg-muted rounded animate-pulse" />
              )}
            </div>
            <div className="relative z-10 min-h-4 mt-1">
              {stat.subtext !== null ? (
                <span className="text-xs text-muted-foreground">{stat.subtext}</span>
              ) : (
                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Recent Documents */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Recent Documents</h2>
              <Link to="/documents" className="text-sm text-primary hover:underline font-medium inline-flex items-center gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {documents.length === 0 ? (
                <div className="col-span-2 text-center py-6 text-muted-foreground border rounded-xl bg-card">No documents uploaded yet.</div>
              ) : (
                documents.map((doc, i) => (
                  <div key={i} className="group relative rounded-xl border bg-card p-4 hover:shadow-md transition-all hover:border-primary/50 cursor-pointer flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">{doc.title}</span>
                      <span className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* AI Suggestions / Recommendations */}
          <section className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">AI Recommended Actions</h2>
            </div>
            <div className="rounded-xl border bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-background p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Convert your notes to interactive study sets</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      You can generate quizzes and flashcards directly from any uploaded document.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link to="/quizzes" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3">
                        <BrainCircuit className="h-4 w-4" /> Go to Quizzes
                      </Link>
                      <Link to="/flashcards" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                        <BookOpen className="h-4 w-4" /> Go to Flashcards
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (Sidebar-ish) */}
        <div className="flex flex-col gap-8">
          {/* Upcoming Planner */}
          <section className="rounded-xl border bg-card flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="font-semibold tracking-tight">Up Next</h2>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6 flex flex-col gap-6">
              {analytics?.upcomingTasks && analytics.upcomingTasks.length > 0 ? (
                analytics.upcomingTasks.slice(0, 4).map((item: any, i: number) => {
                  const colors = ["bg-blue-500", "bg-amber-500", "bg-emerald-500", "bg-purple-500"];
                  const color = colors[i % colors.length];
                  const isLast = i === Math.min(analytics.upcomingTasks.length - 1, 3);
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center mt-1">
                        <div className={`h-2.5 w-2.5 rounded-full ${color} shrink-0`} />
                        {!isLast && <div className="w-px h-full bg-border my-1" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">
                          {new Date(item.date).toLocaleDateString()} • {item.duration}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  No upcoming tasks. Go to Study Planner to schedule some!
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
