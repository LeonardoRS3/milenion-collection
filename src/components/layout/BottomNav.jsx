import { Link, useLocation } from "react-router-dom";
import { Home, Layers, Star, BookOpen, Target, History } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/collection", icon: Layers, label: "Coleção" },
  { path: "/goals", icon: Target, label: "Metas" },
  { path: "/history", icon: History, label: "Histórico" },
  { path: "/decks", icon: BookOpen, label: "Decks" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-all duration-300",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-all duration-300",
                isActive && "bg-primary/10 glow-purple"
              )}>
                <item.icon className={cn("w-5 h-5", isActive && "drop-shadow-[0_0_6px_rgba(124,58,237,0.5)]")} />
              </div>
              <span className="text-[10px] font-body font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}