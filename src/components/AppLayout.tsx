import { Outlet, useNavigate, useLocation, useOutlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Search, Menu, Gift, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "./ui/sheet";
import { NotificationsPopover } from "./NotificationsPopover";
import { CommandMenu } from "./CommandMenu";
import { useAuth } from "./AuthProvider";
import { AnimatePresence, motion } from "motion/react";

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [offlineActive, setOfflineActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentOutlet = useOutlet();
  const { user } = useAuth();
  
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  };

  useEffect(() => {
    const checkConnection = () => {
      const actualOffline = typeof navigator !== "undefined" ? !navigator.onLine : false;
      const simulatedOffline = localStorage.getItem('offline_simulator') === 'true';
      setOfflineActive(actualOffline || simulatedOffline);
    };

    checkConnection();

    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
    
    const interval = setInterval(checkConnection, 3000);
    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandMenuOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/20">
      <CommandMenu open={commandMenuOpen} onOpenChange={setCommandMenuOpen} />
      <Sidebar className="hidden md:flex" />
      <div className="flex flex-col flex-1 min-w-0 bg-[#FAFAFA] dark:bg-background">
        <header className="h-16 border-b bg-background/95 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 z-10 shrink-0 sticky top-0">
          <div className="flex-1 flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger 
                render={
                  <button className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors -ml-2" />
                }
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 border-r-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Main navigation for the application</SheetDescription>
                <Sidebar isMobile onNavigate={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex items-center w-full max-w-md relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                readOnly
                onClick={() => setCommandMenuOpen(true)}
                placeholder="Search notes, documents, or ask AI..." 
                className="h-10 w-full rounded-full border border-input bg-muted/50 pl-10 pr-14 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors hover:bg-muted/80 cursor-pointer"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>

            <div className="font-semibold text-lg tracking-tight md:hidden">
              SecondBrain AI
            </div>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6">
            {offlineActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] md:text-xs font-medium animate-pulse shrink-0">
                <WifiOff className="w-3 h-3 md:w-3.5 md:h-3.5" /> Offline Mode
              </span>
            )}
            <button 
              onClick={() => setCommandMenuOpen(true)}
              className="md:hidden relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            >
              <Search className="h-5 w-5 pointer-events-none" />
            </button>
            
            <button className="hidden md:flex text-muted-foreground hover:text-foreground transition-colors p-1">
              <Gift className="h-5 w-5" />
            </button>
            
            <div className="relative">
                <NotificationsPopover />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative" id="main-scroll-container">
          <AnimatePresence mode="wait" initial={false} onExitComplete={() => document.getElementById('main-scroll-container')?.scrollTo(0, 0)}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="min-h-full"
            >
              {currentOutlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
