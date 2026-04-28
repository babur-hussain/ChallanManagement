import { Bell, Menu, Moon, Sun, LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiGet } from '@/lib/api';
import { Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

export function TopBar({ onMenuClick, isMobile }: TopBarProps) {
  const { user, business, logout } = useAuthStore();
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [dailyQuote, setDailyQuote] = useState<string>("Loading inspiration...");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await apiGet<{ quote: string }>('/system/quote');
        if (res?.quote) {
          setDailyQuote(res.quote);
        }
      } catch (error) {
        setDailyQuote("Empowering your business journey.");
      }
    };
    fetchQuote();
    // Poll every hour
    const interval = setInterval(fetchQuote, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-background/80 backdrop-blur-md border-b border-border">
      {/* Left: menu button + business name */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} id="mobile-menu-toggle">
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <div>
          <h2 className="text-sm font-semibold text-foreground truncate max-w-[200px] md:max-w-none">
            {business?.name || 'TextilePro'}
          </h2>
          <div className="hidden sm:flex items-center gap-1.5 mt-0.5">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            <p className="text-xs italic text-muted-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary/80 to-blue-500 font-medium">
              "{dailyQuote}"
            </p>
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="relative"
          id="theme-toggle"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-5 h-5 transition-transform hover:-rotate-12" />
          )}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" id="notifications-bell">
          <Bell className="w-5 h-5" />
          <Badge
            variant="destructive"
            className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
          >
            2
          </Badge>
        </Button>

        <Separator orientation="vertical" className="h-8 mx-1 hidden sm:block" />

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors"
            id="user-menu-trigger"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium leading-tight">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.role || 'Role'}</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-xl shadow-xl animate-scale-in overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/app/settings'); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/app/settings'); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
              <div className="border-t border-border py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
