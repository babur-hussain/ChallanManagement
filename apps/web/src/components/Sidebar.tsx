import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Users, Scissors, Package,
  Receipt, Handshake, BarChart3, Settings, ChevronLeft,
  ChevronRight, Sparkles, Target, ListTodo, MapPin, Trophy, FileCheck, Wallet, MessageCircle, Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { NAV_ITEMS } from '@textilepro/shared';
import { useAuthStore } from '@/stores/authStore';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, FileText, Users, Scissors, Package,
  Receipt, Handshake, BarChart3, Settings, Target, ListTodo, MapPin, Trophy, FileCheck, Wallet, MessageCircle, Globe
};

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onToggle, isMobile, onClose }: SidebarProps) {
  const location = useLocation();
  const { business } = useAuthStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full flex flex-col transition-all duration-300 ease-out",
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
          isMobile
            ? cn("w-72", isOpen ? "translate-x-0" : "-translate-x-full")
            : cn(isOpen ? "w-64" : "w-[72px]")
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {(isOpen || isMobile) && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold text-white tracking-tight">TextilePro</h1>
              <p className="text-xs text-sidebar-foreground/60 truncate max-w-[140px]">
                {business?.name || 'Textile Management'}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={handleNavClick}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  !isOpen && !isMobile && "justify-center px-0"
                )}
              >
                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                )}

                {Icon && <Icon className={cn("w-5 h-5 shrink-0", isActive && "text-white")} />}

                {(isOpen || isMobile) && (
                  <span className="truncate animate-fade-in">{item.label}</span>
                )}

                {/* Badge (mock pending count for challans) */}
                {(isOpen || isMobile) && item.id === 'challans' && (
                  <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0">
                    3
                  </Badge>
                )}

                {/* Tooltip for collapsed state */}
                {!isOpen && !isMobile && hoveredItem === item.id && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-popover text-popover-foreground text-sm rounded-md shadow-lg border border-border whitespace-nowrap z-50 animate-scale-in">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        {!isMobile && (
          <div className="p-3 border-t border-sidebar-border">
            <button
              onClick={onToggle}
              className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              {isOpen ? (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Collapse</span>
                </>
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
