import { useState, useEffect, useRef } from "react";
import { Bell, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { apiFetch } from "@/lib/api";
import { useNotifications } from "@/lib/useNotifications";

export function NotificationsPopover() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { enabled, sendNotification } = useNotifications();
  const notifiedTasksRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await apiFetch('/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          const upcoming = data.data.upcomingTasks || [];
          setTasks(upcoming);
          
          if (enabled) {
            const todayStr = new Date().toISOString().split('T')[0];
            
            // Check for tasks due today that we haven't notified about yet
            upcoming.forEach((task: any) => {
              const taskKey = `${task.title}-${task.date}`;
              if (task.date === todayStr && !notifiedTasksRef.current.has(taskKey)) {
                sendNotification("Study Reminder", {
                  body: `You have an upcoming session: ${task.title}`,
                  icon: '/icon.png'
                });
                notifiedTasksRef.current.add(taskKey);
              }
            });
            
            // Check if they are close to reaching goals (e.g., almost all tasks completed)
            const completed = data.data.completedTasks || 0;
            const total = data.data.totalTasks || 0;
            if (total > 0 && completed > 0 && completed === total - 1 && !notifiedTasksRef.current.has('almost-done')) {
              sendNotification("Almost there!", {
                body: `You only have 1 task left to reach your daily goal! Keep going!`,
                icon: '/icon.png'
              });
              notifiedTasksRef.current.add('almost-done');
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
    
    // Refresh every minute
    const interval = setInterval(fetchTasks, 60000);
    return () => clearInterval(interval);
  }, [enabled, sendNotification]);

  const unreadCount = tasks.length;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors" />
        }
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-background flex items-center justify-center">
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b flex items-center justify-between">
          <h4 className="font-medium text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {unreadCount} upcoming
            </span>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
          ) : tasks.length > 0 ? (
            <div className="flex flex-col">
              {tasks.map((task, i) => (
                <div key={i} className="p-4 border-b last:border-0 hover:bg-muted/50 transition-colors flex gap-3 items-start">
                  <div className="mt-0.5 bg-primary/10 p-1.5 rounded-full text-primary shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.type} • {task.duration}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(task.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Bell className="h-8 w-8 text-muted/50" />
              <p>No upcoming tasks right now.</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
