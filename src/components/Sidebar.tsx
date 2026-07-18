import { FileText, MessageSquare, LayoutDashboard, Calendar, BarChart2, BookOpen, Search, Bell, Settings, LogOut, ChevronDown, User as UserIcon, Plus, Layers, BrainCircuit, Crown, Sparkles, ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { useAuth } from "./AuthProvider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "AI Chat", href: "/chat", icon: MessageSquare },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Smart Notes", href: "/notes", icon: BookOpen },
  { name: "Quizzes", href: "/quizzes", icon: BrainCircuit },
  { name: "Flashcards", href: "/flashcards", icon: Layers },
  { name: "Planner", href: "/planner", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
];

export interface SidebarProps {
  className?: string;
  isMobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({ className, isMobile, onNavigate }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <div className={cn("flex h-full flex-col border-r border-border/40 bg-background transition-all duration-300", !isMobile && "md:w-20 lg:w-72", isMobile && "w-72", className)}>
      <div className={cn("flex h-20 items-center px-6 pt-2", !isMobile && "justify-center lg:justify-start", isMobile && "pr-12")}>
        <div className="flex items-center gap-3">
          {/* Custom Logo from image */}
          <div className="flex items-center gap-2">
            <span className="font-black text-2xl tracking-tighter">S<span className="text-sm align-super">3</span></span>
          </div>
          <span className={cn("font-bold text-[1.1rem] tracking-tight", !isMobile && "hidden lg:block")}>SecondBrain AI</span>
        </div>
      </div>
      
      <div className={cn("flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2", !isMobile && "items-center lg:items-stretch")}>
        <nav className="flex flex-col gap-1 w-full">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  !isMobile && "justify-center lg:justify-start",
                  isActive 
                    ? "bg-[#1A1A1A] text-white shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={!isMobile ? item.name : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className={cn("text-[0.95rem]", !isMobile && "hidden lg:block")}>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className={cn("px-4 pb-6 w-full flex flex-col gap-4", !isMobile && "items-center lg:items-stretch")}>


        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <button className={cn("flex w-full items-center gap-3 rounded-2xl p-2 hover:bg-muted/50 transition-colors outline-none text-left group", !isMobile && "justify-center lg:justify-start")}>
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0 overflow-hidden ring-1 ring-border/50">
                {user?.avatar ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" /> : getInitials(user?.name || 'User')}
              </div>
              <div className={cn("flex-1 truncate", !isMobile && "hidden lg:block")}>
                <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{user?.name || 'User'}</div>
                <div className="text-xs text-muted-foreground capitalize mt-0.5">{user?.subscriptionPlan || 'Free'} Plan</div>
              </div>
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors", !isMobile && "hidden lg:block")} />
            </button>
          } />
          <DropdownMenuContent align="end" className="w-56 rounded-xl">
            <DropdownMenuItem render={<Link to="/profile" className="flex items-center gap-2 w-full"><UserIcon className="w-4 h-4" /> Profile</Link>} />
            <DropdownMenuItem render={<Link to="/settings" className="flex items-center gap-2 w-full"><Settings className="w-4 h-4" /> Settings</Link>} />
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 focus:text-red-500 gap-2 cursor-pointer" onClick={logout}>
              <LogOut className="w-4 h-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
