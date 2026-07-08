import { apiFetch } from '../lib/api';
import { BarChart, LineChart, Target, Zap, Clock, Trophy, TrendingUp, Layers, CheckSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import React, { useState, useEffect } from "react";

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

  if (!data) return <div className="p-8">Loading analytics...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Learning Analytics</h1>
          <p className="text-muted-foreground">Track your progress and identify areas for improvement.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks Scheduled", value: data.totalTasks, trend: `${data.completedTasks} completed`, icon: CheckSquare },
          { label: "Overall Accuracy (Quizzes)", value: `${data.avgQuizScore}%`, trend: `${data.totalQuizzesTaken} quizzes taken`, icon: Target },
          { label: "Flashcards Reviewed", value: data.reviewedFlashcards || data.masteredFlashcards, trend: `Out of ${data.totalFlashcards} total`, icon: Zap },
          { label: "Knowledge Docs", value: data.totalDocuments, trend: "Processed by AI", icon: Trophy },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-sm font-medium">{stat.label}</span>
              <stat.icon className="h-4 w-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{stat.value}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Study Tasks (Last 7 Days)</CardTitle>
            <CardDescription>Your daily study time distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Minimalist Bar Chart Representation using HTML/CSS for simplicity */}
            <div className="h-64 flex items-end gap-2 mt-4 pb-6 border-b border-l px-2">
              {data.studyDistribution && data.studyDistribution.length > 0 ? (
                data.studyDistribution.map((item: any, i: number) => {
                  const maxHours = Math.max(...data.studyDistribution.map((d: any) => d.hours), 6);
                  return (
                    <div key={i} className="relative flex-1 flex flex-col items-center justify-end group h-full">
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 text-xs font-medium bg-foreground text-background px-2 py-1 rounded transition-opacity">
                        {item.hours}h
                      </div>
                      <div 
                        className="w-full bg-primary/80 rounded-t-sm hover:bg-primary transition-colors"
                        style={{ height: `${(item.hours / maxHours) * 100}%`, minHeight: item.hours > 0 ? '4px' : '0' }}
                      />
                      <div className="absolute -bottom-6 text-xs text-muted-foreground font-medium">
                        {item.day}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No data available for the last 7 days
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Accuracy based on quizzes and flashcards</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex flex-col gap-6 mt-4">
              {data.subjectPerformance && data.subjectPerformance.length > 0 ? (
                data.subjectPerformance.map((item: any, i: number) => {
                  const colors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-orange-500", "bg-purple-500", "bg-red-500"];
                  const color = colors[i % colors.length];
                  return (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span>{item.subject}</span>
                        <span>{item.score}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${color}`} 
                          style={{ width: `${item.score}%` }} 
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-muted-foreground text-center py-6">
                  Not enough data to calculate performance yet. Generate some quizzes and flashcards!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-4 border rounded-xl p-4 sm:p-6 bg-gradient-to-r from-muted/50 to-background flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">AI Insights</h3>
            <p className="text-sm text-muted-foreground">Keep up the momentum! You've reviewed {data.reviewedFlashcards || data.masteredFlashcards} concepts so far.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
