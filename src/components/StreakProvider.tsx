import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthProvider';
import { apiFetch } from '../lib/api';
import { Zap, Sparkles, Trophy, Flame, Check, HelpCircle, Volume2, VolumeX, ShieldAlert } from 'lucide-react';
import { Button } from "./ui/button";

interface StreakContextType {
  triggerStreakCheck: (activityType?: string) => Promise<any>;
}

const StreakContext = createContext<StreakContextType>({
  triggerStreakCheck: async () => {}
});

export const useStreak = () => useContext(StreakContext);

export const StreakProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [reward, setReward] = useState<any>(null);
  const [studyDays, setStudyDays] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('streak_sound_muted') === 'true';
    } catch {
      return false;
    }
  });

  const toggleMute = () => {
    const newVal = !isMuted;
    setIsMuted(newVal);
    try {
      localStorage.setItem('streak_sound_muted', String(newVal));
    } catch (e) {}
  };

  // Play premium Web Audio sound chime (Duolingo arpeggio)
  const playStreakChime = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playTone = (freq: number, startTime: number, duration: number, type: 'sine' | 'triangle' | 'sine' = 'triangle') => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        
        // Soft arpeggio envelope
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      // Cheerful C major arpeggio
      playTone(261.63, now, 0.4); // C4
      playTone(329.63, now + 0.1, 0.4); // E4
      playTone(392.00, now + 0.2, 0.4); // G4
      playTone(523.25, now + 0.3, 0.6); // C5
      
      // Sparkling secondary layer
      setTimeout(() => {
        const now2 = ctx.currentTime;
        playTone(659.25, now2, 0.3, 'sine'); // E5
        playTone(783.99, now2 + 0.1, 0.4, 'sine'); // G5
      }, 350);

    } catch (error) {
      console.warn("Failed to play Web Audio chime", error);
    }
  };

  const triggerStreakCheck = async (activityType: string = 'activity') => {
    if (!user) return null;
    try {
      const res = await apiFetch('/api/users/complete-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ activityType })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Instantly sync frontend user object in AuthContext without refreshing
        if (data.success) {
          const updatedUser = {
            ...user,
            currentStreak: data.currentStreak,
            longestStreak: data.longestStreak,
            xp: data.xp,
            level: data.level,
            coins: data.coins,
            focusPoints: data.focusPoints,
            studyDays: data.studyDays,
            achievements: data.achievements,
            todayCompleted: true
          };
          updateUser(updatedUser);

          // If the server tells us to show the daily streak celebration
          if (data.showPopup) {
            setCurrentStreak(data.currentStreak);
            setLongestStreak(data.longestStreak);
            setReward(data.reward);
            setStudyDays(data.studyDays || []);
            setIsOpen(true);
            
            // Play success chime
            setTimeout(() => {
              playStreakChime();
            }, 300);
          }
        }
        return data;
      }
    } catch (error) {
      console.error('Failed to trigger streak activity', error);
    }
    return null;
  };

  // Generate last 7 days details to show on the streak timeline
  const getTimelineDays = () => {
    const days = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = weekdays[date.getDay()];
      const dayNum = date.getDate();
      
      const isToday = i === 0;
      const isCompleted = studyDays.includes(dateStr);
      
      days.push({
        dateStr,
        dayName,
        dayNum,
        isToday,
        isCompleted
      });
    }
    return days;
  };

  const timelineDays = getTimelineDays();

  return (
    <StreakContext.Provider value={{ triggerStreakCheck }}>
      {children}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />

            {/* Confetti Particle Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-[101]">
              {Array.from({ length: 45 }).map((_, idx) => {
                const randomX = Math.random() * 100;
                const randomY = -10 - Math.random() * 20;
                const destinationX = randomX + (Math.random() * 40 - 20);
                const destinationY = 110 + Math.random() * 20;
                const randomDuration = 2 + Math.random() * 3;
                const randomDelay = Math.random() * 0.5;
                const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#ef4444'];
                const randomColor = colors[idx % colors.length];
                const size = 6 + Math.random() * 8;
                const isRound = Math.random() > 0.5;

                return (
                  <motion.div
                    key={idx}
                    initial={{ 
                      x: `${randomX}vw`, 
                      y: `${randomY}vh`, 
                      rotate: 0,
                      opacity: 1 
                    }}
                    animate={{ 
                      x: `${destinationX}vw`, 
                      y: `${destinationY}vh`, 
                      rotate: 360 + Math.random() * 720,
                      opacity: [1, 1, 0.8, 0] 
                    }}
                    transition={{ 
                      duration: randomDuration, 
                      delay: randomDelay, 
                      ease: 'easeOut' 
                    }}
                    style={{
                      position: 'absolute',
                      width: size,
                      height: size,
                      backgroundColor: randomColor,
                      borderRadius: isRound ? '50%' : '2px'
                    }}
                  />
                );
              })}
            </div>

            {/* Popup Card container */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center z-[102] overflow-hidden"
            >
              {/* Premium Glow effects */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

              {/* Sound Button */}
              <button
                onClick={toggleMute}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors"
                title={isMuted ? "Unmute sounds" : "Mute sounds"}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>

              {/* Flame Area */}
              <div className="relative mb-4 mt-2">
                {/* Glowing Background Rings */}
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-tr from-amber-600 to-orange-400 rounded-full blur-xl opacity-30"
                />
                
                {/* Interactive Pulsing Fire Emblem */}
                <motion.div
                  animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="relative z-10 flex items-center justify-center bg-gradient-to-tr from-amber-500 to-orange-400 h-24 w-24 rounded-3xl shadow-lg shadow-orange-500/20"
                >
                  <Flame className="h-14 w-14 text-white fill-white animate-pulse" />
                </motion.div>
                
                {/* Floating Spars */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -40 - Math.random() * 20],
                      x: [0, (Math.random() - 0.5) * 30],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.2]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1 + Math.random() * 1,
                      delay: i * 0.2,
                      ease: "easeOut"
                    }}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 h-2.5 w-2.5 bg-amber-400 rounded-full blur-[1px]"
                  />
                ))}
              </div>

              {/* Day Streak Label */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs font-bold tracking-wider text-amber-500 uppercase flex items-center gap-1.5"
              >
                <Sparkles className="h-3 w-3 fill-amber-500" /> STREAK ALIVE
              </motion.span>

              {/* Dynamic Number Counter */}
              <motion.h2
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', delay: 0.3 }}
                className="text-5xl font-black tracking-tight mt-1 mb-2 bg-gradient-to-tr from-orange-600 to-amber-500 bg-clip-text text-transparent flex items-center justify-center gap-1"
              >
                DAY {currentStreak}
              </motion.h2>

              <h3 className="text-xl font-bold tracking-tight text-foreground mb-1">
                🎉 Excellent Work!
              </h3>
              
              <p className="text-sm text-muted-foreground max-w-[280px] mb-6">
                You completed today's study activity. Your learning streak is alive!
              </p>

              {/* Rewards Grid */}
              <div className="w-full bg-muted/40 rounded-2xl p-4 grid grid-cols-4 gap-2 mb-6">
                {[
                  { label: 'Streak', value: `+${reward?.streak || 1}`, icon: Flame, color: 'text-orange-500 bg-orange-500/10' },
                  { label: 'XP', value: `+${reward?.xp || 20}`, icon: Trophy, color: 'text-amber-500 bg-amber-500/10' },
                  { label: 'Coins', value: `+${reward?.coins || 10}`, icon: Sparkles, color: 'text-yellow-500 bg-yellow-500/10' },
                  { label: 'Focus', value: `+${reward?.focus || 5}`, icon: Zap, color: 'text-primary bg-primary/10' },
                ].map((item, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    key={idx}
                    className="flex flex-col items-center p-2 rounded-xl bg-card border border-border/60 hover:shadow-sm transition-all"
                  >
                    <div className={`p-2 rounded-lg ${item.color} mb-1 shrink-0`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-extrabold tracking-tight text-foreground">{item.value}</span>
                    <span className="text-[10px] text-muted-foreground">{item.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* 7-Day Timeline */}
              <div className="w-full flex flex-col gap-2 mb-6">
                <span className="text-xs font-semibold text-muted-foreground text-left px-1 flex justify-between">
                  <span>Last 7 Days</span>
                  <span className="text-amber-500">Record: {longestStreak} days</span>
                </span>
                
                <div className="flex justify-between items-center w-full gap-1 sm:gap-2">
                  {timelineDays.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1">
                      {/* Circle indicator */}
                      <div className="relative flex items-center justify-center w-8 h-8 rounded-full mb-1">
                        {day.isToday ? (
                          <>
                            {/* Animated ring around today */}
                            <span className="absolute inset-0 rounded-full border-2 border-orange-500 animate-ping opacity-75" />
                            <div className="relative z-10 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                              <Flame className="h-4 w-4 fill-white" />
                            </div>
                          </>
                        ) : day.isCompleted ? (
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
                            <Check className="h-4 w-4 stroke-[3px]" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground">
                            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      
                      {/* Day Name & number */}
                      <span className="text-[10px] font-medium text-muted-foreground leading-none">{day.dayName}</span>
                      <span className={`text-[10px] font-bold mt-0.5 ${day.isToday ? 'text-orange-500' : 'text-muted-foreground'}`}>{day.dayNum}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inspirational Quote */}
              <blockquote className="text-[11px] italic text-muted-foreground px-4 mb-6 border-l-2 border-amber-500/40">
                "Small progress every day builds an extraordinary Second Brain."
              </blockquote>

              {/* Actions */}
              <div className="w-full flex flex-col gap-2">
                <Button 
                  onClick={() => setIsOpen(false)}
                  className="w-full h-11 rounded-xl font-bold bg-gradient-to-tr from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/20 border-0 transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  Continue Learning
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setIsOpen(false)}
                  className="w-full text-muted-foreground hover:text-foreground h-9 text-xs"
                >
                  View Dashboard
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </StreakContext.Provider>
  );
};
