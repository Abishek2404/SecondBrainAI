import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Search, Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "./ui/sheet";
import { NotificationsPopover } from "./NotificationsPopover";

export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/20">
      <Sidebar className="hidden md:flex" />
      <div className="flex flex-col flex-1 min-w-0">
        <header className="h-16 border-b bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
          <div className="flex-1 flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger 
                render={
                  <button className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors -ml-2" />
                }
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-r-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Main navigation for the application</SheetDescription>
                <Sidebar isMobile onNavigate={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="relative w-full max-w-md hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search notes, documents, or ask AI..." 
                className="w-full h-9 pl-9 pr-4 rounded-full bg-muted/50 border-none text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="font-semibold text-lg tracking-tight md:hidden">
              SecondBrain AI
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="md:hidden relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <NotificationsPopover />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
